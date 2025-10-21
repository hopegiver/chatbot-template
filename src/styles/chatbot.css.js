// 챗봇 스타일 (CSS-in-JS)

export const styles = `
  /* 챗봇 컨테이너 */
  .chatbot-container {
    position: fixed;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .chatbot-container[data-position="bottom-right"] {
    bottom: 20px;
    right: 20px;
  }

  .chatbot-container[data-position="bottom-left"] {
    bottom: 20px;
    left: 20px;
  }

  .chatbot-container[data-position="top-right"] {
    top: 20px;
    right: 20px;
  }

  .chatbot-container[data-position="top-left"] {
    top: 20px;
    left: 20px;
  }

  /* 플로팅 버튼 */
  .chatbot-floating-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
    position: relative;
  }

  .chatbot-floating-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .chatbot-floating-button:active {
    transform: scale(0.95);
  }

  .chatbot-floating-button .icon-chat {
    display: block;
  }

  .chatbot-floating-button .icon-close {
    display: none;
  }

  /* 챗봇이 열리면 플로팅 버튼 숨김 (데스크톱) */
  .chatbot-open .chatbot-floating-button {
    display: none;
  }

  /* 챗봇 윈도우 */
  .chatbot-window {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 380px;
    height: calc(100vh - 40px);
    max-height: 700px;
    min-height: 400px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: none;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    transition: all 0.3s ease;
  }

  .chatbot-open .chatbot-window {
    display: flex;
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  /* 헤더 */
  .chatbot-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
  }

  .chatbot-header-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .chatbot-menu-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .chatbot-menu-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .chatbot-menu-btn svg {
    width: 20px;
    height: 20px;
  }

  .chatbot-title h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .chatbot-status {
    font-size: 12px;
    opacity: 0.9;
  }

  .chatbot-close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .chatbot-close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* 사이드바 */
  .chatbot-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    width: 250px;
    height: 100%;
    background: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 10;
    display: flex;
    flex-direction: column;
  }

  .chatbot-sidebar.open {
    transform: translateX(0);
  }

  .chatbot-sidebar-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
  }

  .chatbot-sidebar-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .chatbot-sidebar-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .chatbot-sidebar-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .chatbot-sidebar-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .chatbot-menu-item {
    width: 100%;
    background: none;
    border: none;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    border-radius: 8px;
    color: #333;
    font-size: 14px;
    transition: background 0.2s;
    margin-bottom: 8px;
  }

  .chatbot-menu-item:hover {
    background: #f5f5f5;
  }

  .chatbot-menu-item svg {
    flex-shrink: 0;
  }

  /* 오버레이 */
  .chatbot-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 9;
  }

  .chatbot-overlay.visible {
    opacity: 1;
    visibility: visible;
  }

  /* 메시지 영역 */
  .chatbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8f9fa;
  }

  .chatbot-welcome {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .chatbot-welcome p {
    margin: 8px 0;
  }

  .chatbot-message {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    animation: messageSlideIn 0.3s ease;
  }

  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .chatbot-message.user {
    align-items: flex-end;
  }

  .chatbot-message.assistant {
    align-items: flex-start;
  }

  .chatbot-message-content {
    padding: 12px 16px;
    border-radius: 18px;
    max-width: 75%;
    word-wrap: break-word;
    display: inline-block;
    line-height: 1.5;
    white-space: pre-line;
  }

  .chatbot-message.user .chatbot-message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .chatbot-message.assistant .chatbot-message-content {
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom-left-radius: 4px;
  }

  .chatbot-message-time {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
  }

  /* 타이핑 인디케이터 */
  .chatbot-typing-indicator {
    margin-bottom: 16px;
  }

  .typing-dots {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    animation: typing-bounce 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes typing-bounce {
    0%, 80%, 100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    40% {
      transform: translateY(-8px);
      opacity: 1;
    }
  }

  /* 입력 영역 */
  .chatbot-input-area {
    padding: 16px;
    background: white;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 8px;
  }

  .chatbot-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 24px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .chatbot-input:focus {
    border-color: #667eea;
  }

  .chatbot-send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .chatbot-send-btn:hover {
    transform: scale(1.05);
  }

  .chatbot-send-btn:active {
    transform: scale(0.95);
  }

  /* 모바일 대응 - 전체 화면 */
  @media (max-width: 768px) {
    /* 컨테이너는 플로팅 버튼만 표시 */
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: auto;
      height: auto;
    }

    /* 플로팅 버튼은 항상 보임 */
    .chatbot-floating-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10001;
    }

    /* 챗봇 열리면 전체 화면 (100% 상하좌우) */
    .chatbot-open .chatbot-window {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      min-height: 0 !important;
      border-radius: 0 !important;
      margin: 0 !important;
      z-index: 10000;
    }

    /* 챗봇 열리면 플로팅 버튼 숨김 */
    .chatbot-open .chatbot-floating-button {
      display: none;
    }

    /* 모바일에서 메시지 max-width 증가 */
    .chatbot-message-content {
      max-width: 85%;
    }
  }

  /* 스크롤바 스타일 */
  .chatbot-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chatbot-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .chatbot-messages::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .chatbot-messages::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
