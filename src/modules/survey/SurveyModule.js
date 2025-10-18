// 설문 모듈 - 비즈니스 로직

import { SurveyCard } from './SurveyCard.js';

export class SurveyModule {
  constructor(chatbot) {
    this.chatbot = chatbot;
  }

  /**
   * 설문 UI 렌더링
   * @param {Object} surveyData - 설문 데이터
   * @param {string} surveyData.title - 설문 제목
   * @param {Array} surveyData.questions - 질문 배열
   * @returns {HTMLElement}
   */
  render(surveyData = {}) {
    const card = new SurveyCard({
      title: surveyData.title || '설문조사',
      questions: surveyData.questions || this.getDefaultQuestions(),
      onSubmit: (answers) => {
        this.handleSubmit(answers, surveyData);
      },
      onCancel: () => {
        this.handleCancel();
      }
    });

    return card.render();
  }

  /**
   * 설문 제출 처리
   */
  async handleSubmit(answers, surveyData) {
    try {
      // 로딩 메시지
      this.chatbot.addBotMessage('설문을 제출하는 중입니다...');

      // TODO: 실제 API 호출
      // const response = await fetch('/api/survey/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     surveyId: surveyData.id,
      //     answers: answers
      //   })
      // });

      // 임시: 성공 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 800));

      // 성공 메시지
      this.chatbot.addBotMessage('설문에 참여해주셔서 감사합니다! 🎉');

      // 답변 요약 표시 (옵션)
      const summary = this.generateSummary(answers, surveyData.questions);
      if (summary) {
        this.chatbot.addBotMessage(summary);
      }

    } catch (error) {
      console.error('Survey submission failed:', error);
      this.chatbot.addBotMessage('죄송합니다. 설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * 설문 취소 처리
   */
  handleCancel() {
    this.chatbot.addBotMessage('설문 참여를 취소하셨습니다. 다음에 다시 참여해주세요!');
  }

  /**
   * 답변 요약 생성
   */
  generateSummary(answers, questions) {
    if (!questions || questions.length === 0) return null;

    const summary = Object.keys(answers).map((key, index) => {
      const question = questions[index];
      const answer = answers[key];

      if (!question) return null;

      if (Array.isArray(answer)) {
        return `${question.label}: ${answer.join(', ')}`;
      } else {
        return `${question.label}: ${answer}`;
      }
    }).filter(Boolean).join('\n');

    return summary ? `📝 제출하신 답변:\n${summary}` : null;
  }

  /**
   * 기본 설문 질문 (예시)
   */
  getDefaultQuestions() {
    return [
      {
        type: 'radio',
        label: '서비스에 만족하셨나요?',
        required: true,
        options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족']
      },
      {
        type: 'checkbox',
        label: '어떤 점이 좋았나요? (복수 선택 가능)',
        required: false,
        options: ['빠른 응답', '친절한 안내', '정확한 정보', '사용 편의성']
      },
      {
        type: 'text',
        label: '개선이 필요한 점이 있다면 알려주세요',
        required: false,
        placeholder: '자유롭게 의견을 남겨주세요'
      }
    ];
  }

  /**
   * AI 응답에서 설문 데이터 감지
   * @param {Object} aiResponse - AI 응답 객체
   * @returns {boolean}
   */
  static canHandle(aiResponse) {
    return aiResponse &&
           (aiResponse.type === 'survey' ||
            aiResponse.action === 'show_survey') &&
           aiResponse.data;
  }

  /**
   * 설문 시작 (챗봇에서 직접 호출용)
   */
  start(surveyData) {
    const surveyUI = this.render(surveyData);
    this.chatbot.chatWindow.addCustomElement(surveyUI);
  }
}
