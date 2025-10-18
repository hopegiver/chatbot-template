// 전역 상태 관리 - AI 챗봇 중심

export class State {
  constructor() {
    this.state = {
      // 대화 관련
      conversationHistory: [], // OpenAI 메시지 포맷: [{role, content}]
      messages: [],            // UI 표시용 메시지: [{type, text, time, id}]
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
   * 메시지 추가 (UI용)
   */
  addMessage(message) {
    const messages = [...this.state.messages, {
      ...message,
      id: Date.now() + Math.random(),
      time: message.time || this.getCurrentTime()
    }];
    this.setState({ messages });
    return messages;
  }

  /**
   * 대화 히스토리 추가 (OpenAI용)
   */
  addToConversation(role, content) {
    const conversationHistory = [
      ...this.state.conversationHistory,
      { role, content }
    ];
    this.setState({ conversationHistory });
    return conversationHistory;
  }

  /**
   * 대화 히스토리 가져오기
   */
  getConversationHistory() {
    return this.state.conversationHistory;
  }

  /**
   * 대화 초기화
   */
  clearConversation() {
    this.setState({
      conversationHistory: [],
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
      conversationHistory: [],
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
        conversationHistory: this.state.conversationHistory,
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
          conversationHistory: data.conversationHistory || [],
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
