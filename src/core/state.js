// 전역 상태 관리 - AI 챗봇 중심

export class State {
  constructor() {
    this.state = {
      // 대화 관련 (OpenAI 형식으로 통일)
      messages: [],            // 메시지: [{role: 'user'|'assistant', content: string, time: string, id: string}]
      sessionId: null,         // 세션 ID
    };
    this.listeners = new Map(); // key: eventName, value: [callbacks]
    this.messageIdCounter = 0; // 메시지 ID 증가 카운터
  }

  /**
   * 상태 가져오기
   */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * 상태 업데이트
   */
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // 변경된 키에 대한 리스너들 호출
    Object.keys(updates).forEach(key => {
      this.notify(key, this.state[key], oldState[key]);
    });

    // 전체 상태 변경 리스너 호출
    this.notify('*', this.state, oldState);
  }

  /**
   * 이벤트 구독
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // 구독 해제 함수 반환
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * 리스너들에게 알림
   */
  notify(event, newValue, oldValue) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      callback(newValue, oldValue);
    });
  }

  /**
   * 메시지 추가 (OpenAI 형식)
   * @param {Object} message - {role: 'user'|'assistant', content: string}
   */
  addMessage(message) {
    const messages = [...this.state.messages, {
      role: message.role,
      content: message.content,
      id: message.id || this.generateMessageId(),
      time: message.time || this.getCurrentTime()
    }];
    this.setState({ messages });
    return messages;
  }

  /**
   * 메시지 ID 생성 (고유성 보장)
   */
  generateMessageId() {
    return `msg-${Date.now()}-${++this.messageIdCounter}`;
  }

  /**
   * 마지막 메시지 제거 (롤백용)
   */
  removeLastMessage() {
    if (this.state.messages.length > 0) {
      const messages = this.state.messages.slice(0, -1);
      this.setState({ messages });
      return messages;
    }
    return this.state.messages;
  }

  /**
   * 대화 히스토리 가져오기 (API 전송용, time/id 제외)
   * Note: 히스토리 길이 제한은 APIClient에서 처리
   * @returns {Array} [{role, content}, ...]
   */
  getConversationHistory() {
    return this.state.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 대화 초기화
   */
  clearConversation() {
    this.setState({
      messages: []
    });
  }

  /**
   * 세션 ID 설정
   */
  setSessionId(sessionId) {
    this.setState({ sessionId });
  }

  /**
   * 현재 시간 가져오기
   */
  getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * 상태 초기화
   */
  reset() {
    this.state = {
      messages: [],
      sessionId: null
    };
    this.messageIdCounter = 0;
    this.notify('*', this.state, {});
  }

  /**
   * LocalStorage에 저장 (대화 히스토리)
   */
  saveToStorage() {
    try {
      const dataToSave = {
        messages: this.state.messages.slice(-100),  // 최근 100개만 저장 (quota 관리)
        sessionId: this.state.sessionId
      };
      localStorage.setItem('chatbot-state', JSON.stringify(dataToSave));
    } catch (error) {
      // Quota 초과 시 재시도
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, saving fewer messages...');
        try {
          const dataToSave = {
            messages: this.state.messages.slice(-50),  // 최근 50개만 저장
            sessionId: this.state.sessionId
          };
          localStorage.setItem('chatbot-state', JSON.stringify(dataToSave));
        } catch (retryError) {
          console.error('Failed to save state even after reducing size:', retryError);
        }
      } else {
        console.warn('Failed to save state to localStorage:', error);
      }
    }
  }

  /**
   * LocalStorage에서 복원
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('chatbot-state');
      if (saved) {
        const data = JSON.parse(saved);
        this.setState({
          messages: data.messages || [],
          sessionId: data.sessionId || null
        });
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }
}

// 싱글톤 인스턴스
let stateInstance = null;

export function getState() {
  if (!stateInstance) {
    stateInstance = new State();
  }
  return stateInstance;
}
