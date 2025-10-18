// 챗봇 메인 클래스 - AI 대화 중심

import { FloatingButton } from '../components/FloatingButton.js';
import { ChatWindow } from '../components/ChatWindow.js';
import { getState } from './state.js';
import { sendChatMessage, initSession, setApiBaseUrl } from './api.js';
import { SurveyModule } from '../modules/survey/index.js';

export class Chatbot {
  constructor(config = {}) {
    this.config = {
      position: 'bottom-right',
      theme: 'light',
      offset: { x: 20, y: 20 },
      greeting: '안녕하세요! 무엇을 도와드릴까요?',
      systemPrompt: null, // 시스템 프롬프트 (선택적)
      apiBaseUrl: null,   // API 서버 URL (선택적)
      maxHistoryLength: 5, // 최대 히스토리 개수
      ...config
    };

    this.isOpen = false;
    this.state = getState();
    this.container = null;
    this.floatingButton = null;
    this.chatWindow = null;

    // 모듈 초기화
    this.modules = {};

    this.init();
  }

  /**
   * 초기화
   */
  async init() {
    console.log('Chatbot initialized with config:', this.config);

    // API Base URL 설정 (config에서 제공된 경우)
    if (this.config.apiBaseUrl) {
      setApiBaseUrl(this.config.apiBaseUrl);
    }

    // 컨테이너 생성
    this.createContainer();

    // 플로팅 버튼 생성
    this.createFloatingButton();

    // 챗봇 윈도우 생성
    this.createChatWindow();

    // 세션 초기화
    await this.initializeSession();

    // 모듈 초기화
    this.initializeModules();

    // 초기 인사 메시지 추가
    if (this.config.greeting) {
      setTimeout(() => {
        this.addBotMessage(this.config.greeting);
      }, 500);
    }
  }

  /**
   * 모듈 초기화
   */
  initializeModules() {
    this.modules.survey = new SurveyModule(this);
    console.log('Modules initialized:', Object.keys(this.modules));
  }

  /**
   * 세션 초기화
   */
  async initializeSession() {
    try {
      // 기존 세션 복원 시도
      this.state.loadFromStorage();

      // 세션 ID가 없으면 새로 생성
      if (!this.state.getState('sessionId')) {
        const { sessionId } = await initSession();
        this.state.setSessionId(sessionId);
        console.log('New session created:', sessionId);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      // 세션 초기화 실패해도 로컬에서 동작하도록
      this.state.setSessionId('local-' + Date.now());
    }
  }

  /**
   * 메인 컨테이너 생성
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'chatbot-container';
    this.container.setAttribute('data-position', this.config.position);
    document.body.appendChild(this.container);
  }

  /**
   * 플로팅 버튼 생성
   */
  createFloatingButton() {
    this.floatingButton = new FloatingButton({
      position: this.config.position,
      onClick: (isOpen) => {
        this.toggle();
      }
    });

    const buttonElement = this.floatingButton.render();
    this.container.appendChild(buttonElement);
  }

  /**
   * 챗봇 윈도우 생성
   */
  createChatWindow() {
    this.chatWindow = new ChatWindow({
      onClose: () => {
        this.close();
      },
      onSendMessage: (text) => {
        this.handleUserMessage(text);
      }
    });

    const windowElement = this.chatWindow.render();
    this.container.appendChild(windowElement);
  }

  /**
   * 챗봇 열기/닫기 토글
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 챗봇 열기
   */
  open() {
    this.isOpen = true;
    this.container.classList.add('chatbot-open');
    this.floatingButton.setOpen(true);
    this.chatWindow.show();
  }

  /**
   * 챗봇 닫기
   */
  close() {
    this.isOpen = false;
    this.container.classList.remove('chatbot-open');
    this.floatingButton.setOpen(false);
    this.chatWindow.hide();
  }

  /**
   * 사용자 메시지 처리
   */
  async handleUserMessage(text) {
    // 사용자 메시지 추가
    this.addUserMessage(text);

    // 봇 응답 생성 (API 서버 호출)
    try {
      // 타이핑 인디케이터 표시
      this.state.setTyping(true);
      this.chatWindow.showTypingIndicator();

      // API 서버로 메시지 전송 (최근 5개 히스토리 포함)
      const history = this.getRecentHistory();
      const sessionId = this.state.getState('sessionId');

      const response = await sendChatMessage(text, history, sessionId);

      // 응답 받으면 타이핑 인디케이터 숨기기
      this.state.setTyping(false);
      this.chatWindow.hideTypingIndicator();

      // 응답 타입에 따라 처리
      if (response.type === 'survey' && response.data) {
        // 설문 모듈 실행
        const surveyUI = this.modules.survey.render(response.data);
        this.chatWindow.addCustomElement(surveyUI);

        // 설문 안내 메시지 (옵션)
        if (response.message) {
          this.addBotMessage(response.message);
        }
      } else {
        // 일반 텍스트 응답
        if (response.reply) {
          this.addBotMessage(response.reply);
        }
      }

      // 대화 히스토리 저장
      this.state.saveToStorage();

    } catch (error) {
      console.error('Failed to get bot response:', error);
      this.state.setTyping(false);
      this.chatWindow.hideTypingIndicator();

      // 에러 메시지 표시
      this.addBotMessage('죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * 최근 대화 히스토리 가져오기 (최대 5개)
   */
  getRecentHistory() {
    const messages = this.state.getState('messages');
    const maxLength = this.config.maxHistoryLength || 5;

    // 최근 N개의 메시지를 API 형식으로 변환
    return messages.slice(-maxLength * 2).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  }

  /**
   * 사용자 메시지 추가
   */
  addUserMessage(text) {
    const message = {
      type: 'user',
      text: text
    };

    this.state.addMessage(message);
    this.chatWindow.addMessage(message);
  }

  /**
   * 봇 메시지 추가
   */
  addBotMessage(text) {
    const message = {
      type: 'bot',
      text: text
    };

    this.state.addMessage(message);
    this.chatWindow.addMessage(message);
  }

  /**
   * 대화 초기화
   */
  clearConversation() {
    this.state.clearConversation();
    this.chatWindow.clearMessages();

    // 인사 메시지 다시 표시
    if (this.config.greeting) {
      setTimeout(() => {
        this.addBotMessage(this.config.greeting);
      }, 300);
    }
  }

  /**
   * 챗봇 제거
   */
  destroy() {
    // 상태 저장
    this.state.saveToStorage();

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.floatingButton = null;
    this.chatWindow = null;
  }
}
