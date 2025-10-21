// 챗봇 대화창

import { createElement } from '../utils/dom.js';

export class ChatWindow {
  constructor(props = {}) {
    this.props = props;
    this.onClose = props.onClose || (() => {});
    this.onSendMessage = props.onSendMessage || (() => {});
    this.messages = props.messages || [];
    this.isOpen = false;
  }

  render() {
    const window = createElement('div', {
      className: 'chatbot-window'
    });

    window.innerHTML = `
      <!-- 헤더 -->
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#667eea"/>
              <path d="M16 18c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zm0 2c-4 0-12 2-12 6v2h24v-2c0-4-8-6-12-6z" fill="white"/>
            </svg>
          </div>
          <div class="chatbot-title">
            <h3>쇼핑 도우미</h3>
            <span class="chatbot-status">온라인</span>
          </div>
        </div>
        <button class="chatbot-close-btn" id="chatbot-close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- 메시지 영역 -->
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chatbot-welcome">
          <p>안녕하세요! 👋</p>
          <p>무엇을 도와드릴까요?</p>
        </div>
      </div>

      <!-- 입력 영역 -->
      <div class="chatbot-input-area">
        <input
          type="text"
          class="chatbot-input"
          id="chatbot-input"
          placeholder="메시지를 입력하세요..."
          autocomplete="off"
        >
        <button class="chatbot-send-btn" id="chatbot-send">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10l16-8-8 16-2-6-6-2z"/>
          </svg>
        </button>
      </div>
    `;

    // 이벤트 리스너 등록
    this.attachEventListeners(window);

    return window;
  }

  attachEventListeners(window) {
    const closeBtn = window.querySelector('#chatbot-close');
    const sendBtn = window.querySelector('#chatbot-send');
    const input = window.querySelector('#chatbot-input');

    closeBtn.addEventListener('click', () => {
      this.onClose();
    });

    sendBtn.addEventListener('click', () => {
      this.sendMessage(input.value);
      input.value = '';
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage(input.value);
        input.value = '';
      }
    });
  }

  sendMessage(text) {
    if (!text.trim()) return;

    this.onSendMessage(text);
  }

  /**
   * 메시지 추가 (OpenAI 형식)
   * @param {Object} message - {role: 'user'|'assistant', content: string}
   */
  addMessage(message) {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer) return;

    const messageEl = createElement('div', {
      className: `chatbot-message ${message.role}`
    });

    messageEl.innerHTML = `
      <div class="chatbot-message-content">
        ${message.content}
      </div>
      <div class="chatbot-message-time">${message.time || this.getCurrentTime()}</div>
    `;

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * 타이핑 인디케이터 표시
   */
  showTypingIndicator() {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer) return;

    // 이미 있으면 중복 생성 방지
    if (document.querySelector('.chatbot-typing-indicator')) return;

    const typingEl = createElement('div', {
      className: 'chatbot-typing-indicator'
    });

    typingEl.innerHTML = `
      <div class="chatbot-message bot">
        <div class="chatbot-message-content">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  /**
   * 타이핑 인디케이터 숨기기
   */
  hideTypingIndicator() {
    const typingEl = document.querySelector('.chatbot-typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  /**
   * 메시지 영역을 맨 아래로 스크롤
   */
  scrollToBottom() {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * 마지막 메시지 제거 (롤백용)
   */
  removeLastMessage() {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer) return;

    // .chatbot-message 중 마지막 요소 찾기
    const messages = messagesContainer.querySelectorAll('.chatbot-message');
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      lastMessage.remove();
    }
  }

  /**
   * 모든 메시지 삭제
   */
  clearMessages() {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  }

  /**
   * 커스텀 엘리먼트 추가 (모듈에서 생성한 UI)
   */
  addCustomElement(element) {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer || !element) return;

    messagesContainer.appendChild(element);
    this.scrollToBottom();
  }

  getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  show() {
    this.isOpen = true;
  }

  hide() {
    this.isOpen = false;
  }
}
