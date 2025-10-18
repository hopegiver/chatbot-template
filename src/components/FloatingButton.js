// 플로팅 챗봇 버튼

import { createElement } from '../utils/dom.js';

export class FloatingButton {
  constructor(props = {}) {
    this.onClick = props.onClick || (() => {});
    this.position = props.position || 'bottom-right';
    this.isOpen = false;
  }

  render() {
    const button = createElement('button', {
      className: 'chatbot-floating-button',
      innerHTML: `
        <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
        </svg>
        <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      `
    });

    button.addEventListener('click', () => {
      this.toggle();
      this.onClick(this.isOpen);
    });

    return button;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  setOpen(isOpen) {
    this.isOpen = isOpen;
  }
}
