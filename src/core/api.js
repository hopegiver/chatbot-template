// API 호출 로직 - 백엔드 API 서버 연동

// API Base URL (Chatbot config에서 설정 가능)
// 개발 환경: '/mock-api' (정적 JSON 파일)
// 프로덕션: 'https://your-api-server.com/api'
let API_BASE_URL = '/mock-api';
let USE_MOCK = true; // Mock API 사용 여부

/**
 * API Base URL 설정
 * @param {string} url - API 서버 URL
 * @param {boolean} useMock - Mock API 사용 여부 (기본값: true)
 */
export function setApiBaseUrl(url, useMock = true) {
  API_BASE_URL = url;
  USE_MOCK = useMock;
  console.log('API Base URL set to:', API_BASE_URL, '| Mock mode:', USE_MOCK);
}

/**
 * 현재 API Base URL 가져오기
 * @returns {string}
 */
export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Fetch wrapper for API calls
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response data
 */
export async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * 챗봇 메시지 전송 (OpenAI 백엔드 API 호출)
 * @param {string} message - 사용자 메시지
 * @param {Array} history - 최근 대화 히스토리 (최대 5개)
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<{reply: string, sessionId: string}>}
 */
export async function sendChatMessage(message, history = [], sessionId = null) {
  if (USE_MOCK) {
    // Mock API: 정적 JSON 파일 사용
    return fetchAPI('/chat.json', { method: 'GET' });
  }

  // 실제 API 서버 호출
  return fetchAPI('/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      history: history.slice(-5), // 최근 5개만 전송
      sessionId
    })
  });
}

/**
 * 세션 초기화
 * @returns {Promise<{sessionId: string}>}
 */
export async function initSession() {
  if (USE_MOCK) {
    // Mock API: 정적 JSON 파일 사용
    return fetchAPI('/session.json', { method: 'GET' });
  }

  // 실제 API 서버 호출
  return fetchAPI('/chat/session', {
    method: 'POST'
  });
}
