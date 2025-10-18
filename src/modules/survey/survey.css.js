// 설문 모듈 전용 스타일

export const surveyStyles = `
  /* 설문 카드 컨테이너 */
  .module-survey-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 설문 헤더 */
  .module-survey-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #667eea;
  }

  .module-survey-header h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .module-survey-description {
    margin: 0;
    font-size: 13px;
    color: #666;
  }

  /* 설문 폼 */
  .module-survey-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* 질문 */
  .module-survey-question {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .module-survey-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    line-height: 1.5;
  }

  .module-survey-label .required {
    color: #e53e3e;
    margin-left: 4px;
  }

  /* 텍스트 입력 */
  .module-survey-input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .module-survey-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .module-survey-input::placeholder {
    color: #aaa;
  }

  /* 옵션 (라디오/체크박스) */
  .module-survey-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .module-survey-option {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }

  .module-survey-option:hover {
    background: #f7fafc;
    border-color: #667eea;
  }

  .module-survey-option:has(input:checked) {
    background: #f0f4ff;
    border-color: #667eea;
  }

  .module-survey-option input[type="radio"],
  .module-survey-option input[type="checkbox"] {
    margin: 0;
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
  }

  .module-survey-option span {
    font-size: 14px;
    color: #333;
    flex: 1;
  }

  /* 액션 버튼 */
  .module-survey-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  .module-survey-cancel,
  .module-survey-submit {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .module-survey-cancel {
    background: #f5f5f5;
    color: #666;
  }

  .module-survey-cancel:hover {
    background: #e8e8e8;
  }

  .module-survey-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .module-survey-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .module-survey-submit:active {
    transform: translateY(0);
  }

  /* 반응형 */
  @media (max-width: 480px) {
    .module-survey-card {
      padding: 16px;
      margin: 12px 0;
    }

    .module-survey-header h3 {
      font-size: 16px;
    }

    .module-survey-actions {
      flex-direction: column;
    }

    .module-survey-cancel,
    .module-survey-submit {
      width: 100%;
    }
  }
`;
