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
          <button class="chatbot-menu-btn" id="chatbot-menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="chatbot-title">
            <h3>AI 도우미</h3>
          </div>
        </div>
        <button class="chatbot-close-btn" id="chatbot-close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- 사이드 메뉴 -->
      <div class="chatbot-sidebar" id="chatbot-sidebar">
        <div class="chatbot-sidebar-header">
          <h3>메뉴</h3>
          <button class="chatbot-sidebar-close" id="chatbot-sidebar-close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="chatbot-sidebar-content">
          <button class="chatbot-menu-item" id="menu-new-chat">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>새 대화</span>
          </button>
          <button class="chatbot-menu-item" id="menu-clear">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 6h14M8 6V4h4v2M5 6v11a2 2 0 002 2h6a2 2 0 002-2V6H5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>대화 초기화</span>
          </button>
        </div>
      </div>

      <!-- 오버레이 -->
      <div class="chatbot-overlay" id="chatbot-overlay"></div>

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
    const menuBtn = window.querySelector('#chatbot-menu');
    const sidebar = window.querySelector('#chatbot-sidebar');
    const sidebarClose = window.querySelector('#chatbot-sidebar-close');
    const overlay = window.querySelector('#chatbot-overlay');
    const menuNewChat = window.querySelector('#menu-new-chat');
    const menuClear = window.querySelector('#menu-clear');

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

    // 메뉴 열기
    menuBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
    });

    // 메뉴 닫기
    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    };

    sidebarClose.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // 메뉴 항목 클릭
    menuNewChat.addEventListener('click', () => {
      // 새 대화 시작 (현재는 대화 초기화와 동일)
      this.clearMessages();
      closeSidebar();
    });

    menuClear.addEventListener('click', () => {
      // 대화 초기화
      this.clearMessages();
      closeSidebar();
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
      <div class="chatbot-message-content"></div>
      <div class="chatbot-message-time">${message.time || this.getCurrentTime()}</div>
    `;

    // 앞뒤 공백 제거하고 textContent로 설정 (XSS 방지 + 공백 처리)
    const contentEl = messageEl.querySelector('.chatbot-message-content');
    if (contentEl) {
      contentEl.textContent = (message.content || '').trim();
    }

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
   * 스트리밍 메시지 시작 (빈 메시지 생성 후 ID 반환)
   */
  startStreamingMessage() {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer) return null;

    const messageId = `streaming-${Date.now()}-${Math.random()}`;
    const messageEl = createElement('div', {
      className: 'chatbot-message assistant streaming',
      'data-message-id': messageId
    });

    messageEl.innerHTML = `
      <div class="chatbot-message-content"></div>
      <div class="chatbot-message-time">${this.getCurrentTime()}</div>
    `;

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();

    return messageId;
  }

  /**
   * 스트리밍 메시지에 청크 추가
   */
  appendToStreamingMessage(messageId, chunk) {
    if (!messageId) return;

    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageEl) return;

    const contentEl = messageEl.querySelector('.chatbot-message-content');
    if (contentEl) {
      contentEl.textContent += chunk;
      this.scrollToBottom();
    }
  }

  /**
   * 스트리밍 메시지 완료 (streaming 클래스 제거)
   */
  finalizeStreamingMessage(messageId) {
    if (!messageId) return;

    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      // 앞뒤 공백 제거
      const contentEl = messageEl.querySelector('.chatbot-message-content');
      if (contentEl) {
        contentEl.textContent = contentEl.textContent.trim();
      }

      messageEl.classList.remove('streaming');
      messageEl.removeAttribute('data-message-id');
    }
  }

  /**
   * 스트리밍 메시지 제거 (에러 시)
   */
  removeStreamingMessage(messageId) {
    if (!messageId) return;

    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      messageEl.remove();
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
