// 전역 상태 관리 - AI 챗봇 중심

export class State {
  constructor() {
    this.state = {
      // 대화 관련 (OpenAI 형식으로 통일)
      messages: [],            // 메시지: [{role: 'user'|'assistant', content: string, time: string, id: number}]
      sessionId: null,         // 세션 ID
      context: {},             // 대화 컨텍스트 (사용자 정보, 상태 등)
      isTyping: false,         // 봇 타이핑 중 여부

      // 사용자 관련
      user: null,              // 사용자 정보
    };
    this.listeners = new Map(); // key: eventName, value: [callbacks]
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
      id: message.id || (Date.now() + Math.random()),
      time: message.time || this.getCurrentTime()
    }];
    this.setState({ messages });
    return messages;
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
   * @param {number} maxLength - 최대 메시지 쌍 개수 (기본: 전체)
   * @returns {Array} [{role, content}, ...]
   */
  getConversationHistory(maxLength = null) {
    const history = this.state.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    if (maxLength) {
      return history.slice(-maxLength * 2);
    }
    return history;
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
   * 컨텍스트 설정
   */
  setContext(key, value) {
    const context = { ...this.state.context, [key]: value };
    this.setState({ context });
  }

  /**
   * 컨텍스트 가져오기
   */
  getContext(key) {
    return key ? this.state.context[key] : this.state.context;
  }

  /**
   * 세션 ID 설정
   */
  setSessionId(sessionId) {
    this.setState({ sessionId });
  }

  /**
   * 타이핑 상태 설정
   */
  setTyping(isTyping) {
    this.setState({ isTyping });
  }

  /**
   * 현재 시간 가져오기
   */
  getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * 사용자 설정
   */
  setUser(user) {
    this.setState({ user });
  }

  /**
   * 로그아웃
   */
  logout() {
    this.setState({ user: null });
  }

  /**
   * 상태 초기화
   */
  reset() {
    this.state = {
      messages: [],
      sessionId: null,
      context: {},
      isTyping: false,
      user: null
    };
    this.notify('*', this.state, {});
  }

  /**
   * LocalStorage에 저장 (대화 히스토리)
   */
  saveToStorage() {
    try {
      localStorage.setItem('chatbot-state', JSON.stringify({
        messages: this.state.messages,
        sessionId: this.state.sessionId,
        context: this.state.context,
        user: this.state.user
      }));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
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
          sessionId: data.sessionId || null,
          context: data.context || {},
          user: data.user || null
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
