// 설문 카드 UI 컴포넌트

import { createElement } from '../../utils/dom.js';

export class SurveyCard {
  constructor(props = {}) {
    this.title = props.title || '설문조사';
    this.questions = props.questions || [];
    this.onSubmit = props.onSubmit || (() => {});
    this.onCancel = props.onCancel || (() => {});
  }

  render() {
    const card = createElement('div', {
      className: 'module-survey-card'
    });

    card.innerHTML = `
      <div class="module-survey-header">
        <h3>${this.title}</h3>
        <p class="module-survey-description">간단한 설문에 참여해주세요</p>
      </div>
      <form class="module-survey-form">
        ${this.renderQuestions()}
        <div class="module-survey-actions">
          <button type="button" class="module-survey-cancel">취소</button>
          <button type="submit" class="module-survey-submit">제출하기</button>
        </div>
      </form>
    `;

    this.attachEventListeners(card);
    return card;
  }

  renderQuestions() {
    return this.questions.map((q, index) => {
      switch (q.type) {
        case 'text':
          return this.renderTextQuestion(q, index);
        case 'radio':
          return this.renderRadioQuestion(q, index);
        case 'checkbox':
          return this.renderCheckboxQuestion(q, index);
        default:
          return '';
      }
    }).join('');
  }

  renderTextQuestion(question, index) {
    return `
      <div class="module-survey-question">
        <label class="module-survey-label">
          ${index + 1}. ${question.label}
          ${question.required ? '<span class="required">*</span>' : ''}
        </label>
        <input
          type="text"
          name="q${index}"
          class="module-survey-input"
          ${question.required ? 'required' : ''}
          placeholder="${question.placeholder || '답변을 입력하세요'}"
        >
      </div>
    `;
  }

  renderRadioQuestion(question, index) {
    return `
      <div class="module-survey-question">
        <label class="module-survey-label">
          ${index + 1}. ${question.label}
          ${question.required ? '<span class="required">*</span>' : ''}
        </label>
        <div class="module-survey-options">
          ${question.options.map((option, optIndex) => `
            <label class="module-survey-option">
              <input
                type="radio"
                name="q${index}"
                value="${option}"
                ${question.required ? 'required' : ''}
              >
              <span>${option}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCheckboxQuestion(question, index) {
    return `
      <div class="module-survey-question">
        <label class="module-survey-label">
          ${index + 1}. ${question.label}
          ${question.required ? '<span class="required">*</span>' : ''}
        </label>
        <div class="module-survey-options">
          ${question.options.map((option, optIndex) => `
            <label class="module-survey-option">
              <input
                type="checkbox"
                name="q${index}[]"
                value="${option}"
              >
              <span>${option}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners(card) {
    const form = card.querySelector('.module-survey-form');
    const cancelBtn = card.querySelector('.module-survey-cancel');

    // 제출 처리
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const answers = {};

      this.questions.forEach((q, index) => {
        if (q.type === 'checkbox') {
          answers[`q${index}`] = formData.getAll(`q${index}[]`);
        } else {
          answers[`q${index}`] = formData.get(`q${index}`);
        }
      });

      this.onSubmit(answers);
    });

    // 취소 처리
    cancelBtn.addEventListener('click', () => {
      this.onCancel();
    });
  }
}
