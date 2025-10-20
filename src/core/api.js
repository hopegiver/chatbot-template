// API 클라이언트 - 백엔드 API 서버 연동
// aitutor/APIClient.js 기반으로 개선된 버전

export class APIClient {
  constructor(options = {}) {
    this.options = {
      baseUrl: options.baseUrl || '/api',
      timeout: options.timeout || 30000,          // 30초
      retryAttempts: options.retryAttempts || 3,  // 3번 재시도
      retryDelay: options.retryDelay || 1000,     // 1초 기본 지연
      maxHistoryLength: options.maxHistoryLength || 5, // 최근 5개 대화쌍
      useMock: options.useMock || false,
      ...options
    };

    this.endpoint = `${this.options.baseUrl}/chat`;
    this.sessionEndpoint = `${this.options.baseUrl}/chat/session`;
    this.token = null; // 인증 토큰 (필요시)
  }

  /**
   * 챗봇 메시지 전송
   * @param {string} message - 사용자 메시지
   * @param {Array} history - 대화 히스토리 (OpenAI 형식)
   * @param {string} sessionId - 세션 ID
   * @returns {Promise<{reply: string, sessionId: string, type?: string, data?: any}>}
   */
  async sendMessage(message, history = [], sessionId = null) {
    // Mock API 모드
    if (this.options.useMock) {
      return this.mockResponse(message);
    }

    // 히스토리 길이 제한 (최근 N개 대화쌍)
    const recentHistory = history.slice(-this.options.maxHistoryLength * 2);

    // 현재 메시지 추가
    const messages = [
      ...recentHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const payload = {
      messages,
      sessionId
    };

    return this.makeRequest(this.endpoint, payload);
  }

  /**
   * 세션 초기화
   * @returns {Promise<{sessionId: string}>}
   */
  async initSession() {
    if (this.options.useMock) {
      return { sessionId: `mock-session-${Date.now()}` };
    }

    return this.makeRequest(this.sessionEndpoint, {});
  }

  /**
   * 스트리밍 메시지 전송 (타임아웃 + 안전성 보강)
   * @param {string} message
   * @param {Array} history
   * @param {Function} onChunk - 청크 수신 콜백
   * @param {Function} onComplete - 완료 콜백
   * @param {Function} onError - 에러 콜백
   * @param {string} sessionId
   */
  async sendMessageWithStreaming(message, history = [], onChunk, onComplete, onError, sessionId = null) {
    let timeoutId = null;
    let reader = null;
    let controller = null;

    try {
      // 히스토리 길이 제한 (최근 N개 대화쌍)
      const recentHistory = history.slice(-this.options.maxHistoryLength * 2);

      const messages = [
        ...recentHistory,
        { role: 'user', content: message }
      ];

      const payload = {
        messages,
        sessionId,
        stream: true
      };

      // 타임아웃 제어
      controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      // response.body null 체크
      if (!response.body) {
        throw new Error('Streaming not supported: response.body is null');
      }

      reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 스트리밍 읽기
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        const text = decoder.decode(value, { stream: true });
        if (text) {
          onChunk?.(text);
        }
      }

    } catch (error) {
      const userError = this.createError(error);
      onError?.(userError);

    } finally {
      // 리소스 정리
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (reader) {
        try {
          reader.cancel();
        } catch (e) {
          // reader.cancel() 실패 무시
        }
      }
    }
  }

  /**
   * HTTP 요청 (재시도 + 타임아웃 포함)
   */
  async makeRequest(endpoint, payload, attempt = 1) {
    let timeoutId = null;
    let response = null;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      // JSON 파싱 (실패 시 명확한 에러)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const error = new Error('서버 응답을 처리할 수 없습니다 (Invalid JSON)');
        error.code = 'INVALID_JSON';
        error.originalError = jsonError;
        error.status = response.status;
        error.shouldRetry = false; // JSON 파싱 실패는 재시도 안 함
        throw error;
      }

      return this.parseResponse(data);

    } catch (error) {
      // 재시도 로직 (Exponential Backoff + Jitter)
      if (attempt < this.options.retryAttempts && this.shouldRetry(error, response)) {
        const backoffDelay = this.calculateBackoffDelay(attempt);
        console.warn(`API 요청 실패 (재시도 ${attempt}/${this.options.retryAttempts}, ${backoffDelay}ms 후):`, error.message);
        await this.delay(backoffDelay);
        return this.makeRequest(endpoint, payload, attempt + 1);
      }

      throw this.createError(error, response);

    } finally {
      // 타임아웃 타이머 정리 보장
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * HTTP 헤더 생성
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * API 응답 파싱 (다양한 형식 지원)
   * @returns {{reply?: string, sessionId?: string, type?: string, data?: any}}
   */
  parseResponse(data) {
    // 문자열인 경우
    if (typeof data === 'string') {
      return { reply: data };
    }

    // 기본 응답 구조
    const result = {};

    // 메시지 필드 (다양한 필드명 지원)
    result.reply = data.reply || data.response || data.message || data.content || data.text;

    // 세션 ID
    result.sessionId = data.sessionId || data.session_id || data.sessionID;

    // 타입 (모듈 라우팅용)
    if (data.type) {
      result.type = data.type;
    }

    // 추가 데이터 (모듈용)
    if (data.data) {
      result.data = data.data;
    }

    // 응답 메시지가 없는 경우 경고
    if (!result.reply && !result.type) {
      console.warn('API 응답에서 메시지를 찾을 수 없습니다:', data);
      result.reply = '응답을 받을 수 없습니다.';
    }

    return result;
  }

  /**
   * 재시도 여부 판단 (HTTP status 기반)
   * @param {Error} error - 발생한 에러
   * @param {Response|null} response - HTTP 응답 객체
   */
  shouldRetry(error, response) {
    // JSON 파싱 실패는 재시도하지 않음
    if (error.shouldRetry === false) {
      return false;
    }

    // 타임아웃은 재시도하지 않음
    if (error.name === 'AbortError') {
      return false;
    }

    // 네트워크 오류 (fetch 실패) - 재시도
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }

    // HTTP status 기반 판단
    if (response && response.status) {
      // 5xx 서버 에러 - 재시도
      if (response.status >= 500 && response.status < 600) {
        return true;
      }

      // 429 Rate Limit - 재시도
      if (response.status === 429) {
        return true;
      }

      // 408 Request Timeout - 재시도
      if (response.status === 408) {
        return true;
      }
    }

    // error.status로도 체크 (makeRequest에서 설정)
    if (error.status) {
      if (error.status >= 500 || error.status === 429 || error.status === 408) {
        return true;
      }
    }

    return false;
  }

  /**
   * 사용자 친화적 에러 메시지 생성 (원본 에러 보존)
   * @param {Error} originalError - 원본 에러 객체
   * @param {Response|null} response - HTTP 응답 객체
   * @returns {Error} 사용자 친화적 메시지를 가진 에러 (원본 정보 포함)
   */
  createError(originalError, response = null) {
    let userMessage = '일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
    let errorCode = 'UNKNOWN_ERROR';

    // AbortError (타임아웃)
    if (originalError.name === 'AbortError') {
      userMessage = '요청 시간이 초과되었습니다. 다시 시도해 주세요.';
      errorCode = 'TIMEOUT';
    }
    // 네트워크 오류
    else if (originalError.name === 'TypeError' && originalError.message.includes('fetch')) {
      userMessage = '네트워크 연결을 확인해 주세요.';
      errorCode = 'NETWORK_ERROR';
    }
    // HTTP 상태 코드 기반 에러
    else if (originalError.status || response?.status) {
      const status = originalError.status || response.status;

      if (status === 401) {
        userMessage = '인증이 필요합니다.';
        errorCode = 'UNAUTHORIZED';
      } else if (status === 403) {
        userMessage = '접근이 거부되었습니다.';
        errorCode = 'FORBIDDEN';
      } else if (status === 404) {
        userMessage = '요청한 리소스를 찾을 수 없습니다.';
        errorCode = 'NOT_FOUND';
      } else if (status === 408) {
        userMessage = '요청 시간이 초과되었습니다.';
        errorCode = 'REQUEST_TIMEOUT';
      } else if (status === 429) {
        userMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
        errorCode = 'RATE_LIMIT';
      } else if (status >= 500 && status < 600) {
        userMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        errorCode = 'SERVER_ERROR';
      }
    }

    // 사용자 친화적 에러 생성
    const userError = new Error(userMessage);
    userError.code = errorCode;
    userError.originalError = originalError; // 원본 에러 보존 (디버깅용)
    userError.status = originalError.status || response?.status;
    userError.response = response;

    return userError;
  }

  /**
   * 지연 함수 (재시도용)
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exponential Backoff + Jitter 계산
   * @param {number} attempt - 재시도 횟수 (1부터 시작)
   * @returns {number} 지연 시간 (밀리초)
   *
   * 공식: min(maxDelay, baseDelay * 2^(attempt-1) + random(0, 1000))
   * 예시:
   *   attempt 1: 1000ms + 0~1000ms = 1000~2000ms
   *   attempt 2: 2000ms + 0~1000ms = 2000~3000ms
   *   attempt 3: 4000ms + 0~1000ms = 4000~5000ms
   */
  calculateBackoffDelay(attempt) {
    const baseDelay = this.options.retryDelay; // 1000ms (기본값)
    const maxDelay = 30000; // 최대 30초
    const jitter = Math.random() * 1000; // 0~1000ms 랜덤

    // Exponential: 2^(attempt-1)
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);

    // 최대값 제한 + Jitter 추가
    return Math.min(maxDelay, exponentialDelay + jitter);
  }

  /**
   * Mock 응답 (개발/테스트용)
   */
  async mockResponse(message) {
    await this.delay(800); // 네트워크 지연 시뮬레이션

    return {
      reply: `[Mock API] "${message}"에 대한 응답입니다.`,
      sessionId: `mock-session-${Date.now()}`
    };
  }

  /**
   * 설정 업데이트
   */
  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  setBaseUrl(baseUrl) {
    this.options.baseUrl = baseUrl;
    this.endpoint = `${baseUrl}/chat`;
    this.sessionEndpoint = `${baseUrl}/chat/session`;
  }

  setTimeout(timeout) {
    this.options.timeout = timeout;
  }

  setRetryOptions(attempts, delay) {
    this.options.retryAttempts = attempts;
    this.options.retryDelay = delay;
  }

  /**
   * 연결 테스트
   */
  async testConnection() {
    try {
      await this.sendMessage('test', [], null);
      return { success: true, message: 'API 연결이 정상입니다.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * 통계 정보
   */
  getStats() {
    return {
      endpoint: this.endpoint,
      timeout: this.options.timeout,
      retryAttempts: this.options.retryAttempts,
      maxHistoryLength: this.options.maxHistoryLength,
      hasToken: !!this.token,
      useMock: this.options.useMock
    };
  }
}

