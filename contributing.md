# Contributing Guide

이 문서는 AI Chatbot Template 프로젝트의 구조, 규칙, 개발 가이드를 설명합니다. AI 에이전트와 개발자 모두 이 가이드를 따라 일관된 코드를 작성해야 합니다.

## 📊 프로젝트 개요

**목적**: Cloudflare Pages 배포를 위한 AI 기반 embeddable 챗봇 위젯
**언어**: Vanilla JavaScript (ES6 Modules)
**번들러**: esbuild
**스타일**: CSS-in-JS
**UI 형태**: 플로팅 챗봇 (오른쪽 하단 고정)
**AI 엔진**: 백엔드 API 서버 (OpenAI 등)
**대화 히스토리**: 최근 5개 메시지 컨텍스트 유지

## 📁 프로젝트 구조

```
chatbot-template/
├── src/
│   ├── core/                  # 챗봇 핵심 엔진 (인터페이스는 유지하되 리팩토링 규칙)
│   │   ├── chatbot.js        # 챗봇 메인 클래스 (대화 관리, 모듈 통합)
│   │   ├── state.js          # 대화 상태 관리
│   │   └── api.js            # 백엔드 API 서버 연동
│   ├── components/            # 코어 UI 컴포넌트 (재사용 가능)
│   │   ├── FloatingButton.js # 플로팅 버튼
│   │   └── ChatWindow.js     # 대화창 (타이핑 인디케이터, 커스텀 엘리먼트)
│   ├── modules/               # 핵심 기능 모듈 (완전 독립) ⭐
│   │   └── survey/           # 설문 모듈
│   │       ├── SurveyModule.js    # 로직 (비즈니스 로직)
│   │       ├── SurveyCard.js      # UI 컴포넌트
│   │       ├── survey.css.js      # 전용 스타일
│   │       └── index.js           # export 통합
│   ├── utils/                 # 헬퍼 함수
│   │   ├── dom.js
│   │   └── helpers.js
│   ├── styles/                # 코어 스타일
│   │   └── chatbot.css.js
│   └── index.js               # 엔트리 포인트 (스타일 통합)
├── dist/                      # 빌드 결과물
├── index.html                 # 데모 페이지
├── build.js                   # esbuild 설정
└── package.json
```

### 폴더 역할 구분

- **`core/`**: 챗봇의 필수 엔진 (절대 제거 불가)
- **`components/`**: 코어 UI 컴포넌트 (여러 곳에서 재사용)
- **`modules/`**: 핵심 기능 모듈 (독립적, 추가/제거 자유)
- **`styles/`**: 코어 전용 스타일
- **`utils/`**: 공통 헬퍼 함수

## 🎯 핵심 규칙 (MUST FOLLOW)

### 1. 파일 및 클래스 네이밍 규칙

#### Components (src/components/)
- **파일명**: PascalCase.js
- **클래스명**: PascalCase (접미사 없음)
- **예시**:
  ```javascript
  // 파일: src/components/FloatingButton.js
  export class FloatingButton { ... }

  // 파일: src/components/ChatWindow.js
  export class ChatWindow { ... }

  // 파일: src/components/QuickReply.js (향후 추가)
  export class QuickReply { ... }
  ```

#### Modules (src/modules/)
- **폴더명**: kebab-case (예: `survey`, `quiz`, `event`)
- **파일명**: PascalCase.js + 모듈 이름 (예: `SurveyModule.js`)
- **클래스명**: PascalCase + `Module` 접미사
- **예시**:
  ```javascript
  // 폴더: src/modules/survey/
  // 파일: src/modules/survey/SurveyModule.js
  export class SurveyModule { ... }

  // 파일: src/modules/survey/SurveyCard.js
  export class SurveyCard { ... }

  // 파일: src/modules/quiz/QuizModule.js
  export class QuizModule { ... }
  ```

#### Core, Utils
- **파일명**: kebab-case.js
- **함수/클래스명**: camelCase 또는 PascalCase (표준 규칙 따름)

### 2. 모듈 구조 규칙

#### 모든 모듈은 다음 구조를 따릅니다:

```
modules/
└── survey/                    # 모듈 폴더 (독립적)
    ├── SurveyModule.js       # 비즈니스 로직
    ├── SurveyCard.js         # UI 컴포넌트
    ├── survey.css.js         # 전용 스타일
    └── index.js              # export 통합
```

#### 모듈 메인 클래스 (SurveyModule.js)

```javascript
export class SurveyModule {
  constructor(chatbot) {
    this.chatbot = chatbot;
  }

  /**
   * UI 렌더링
   */
  render(data) {
    const card = new SurveyCard({
      title: data.title,
      questions: data.questions,
      onSubmit: (answers) => this.handleSubmit(answers)
    });
    return card.render();
  }

  /**
   * 제출 처리
   */
  async handleSubmit(answers) {
    // API 호출, 상태 업데이트 등
    this.chatbot.addBotMessage('제출 완료!');
  }

  /**
   * AI 응답 감지
   */
  static canHandle(aiResponse) {
    return aiResponse.type === 'survey';
  }
}
```

#### UI 컴포넌트 (SurveyCard.js)

```javascript
import { createElement } from '../../utils/dom.js';

export class SurveyCard {
  constructor(props = {}) {
    this.title = props.title || '';
    this.questions = props.questions || [];
    this.onSubmit = props.onSubmit || (() => {});
  }

  render() {
    const card = createElement('div', {
      className: 'module-survey-card'
    });

    card.innerHTML = `
      <div class="module-survey-header">
        <h3>${this.title}</h3>
      </div>
      <form class="module-survey-form">
        ${this.renderQuestions()}
        <button type="submit">제출</button>
      </form>
    `;

    this.attachEventListeners(card);
    return card;
  }

  renderQuestions() {
    return this.questions.map((q, i) => `
      <div class="module-survey-question">
        <label>${q.label}</label>
        <input name="q${i}" required />
      </div>
    `).join('');
  }

  attachEventListeners(card) {
    card.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      this.onSubmit(Object.fromEntries(formData));
    });
  }
}
```

### 3. State 관리 규칙 (대화 중심)

#### State 사용법
```javascript
import { getState } from './core/state.js';

// 싱글톤 인스턴스 가져오기
const state = getState();

// 대화 상태 읽기
const messages = state.getState('messages');
const history = state.getConversationHistory();
const sessionId = state.getState('sessionId');

// 메시지 추가 (OpenAI 형식)
state.addMessage({ role: 'user', content: '안녕하세요' });
state.addMessage({ role: 'assistant', content: '안녕하세요!' });

// 컨텍스트 관리
state.setContext('userName', '홍길동');
const userName = state.getContext('userName');

// 타이핑 상태
state.setTyping(true);
state.setTyping(false);

// 대화 초기화
state.clearConversation();

// LocalStorage 저장/복원
state.saveToStorage();
state.loadFromStorage();

// 이벤트 구독
const unsubscribe = state.subscribe('messages', (newMessages) => {
  console.log('Messages updated:', newMessages);
});
```

### 4. 메시지 처리 규칙

#### 챗봇 메시지 흐름
```javascript
// 1. 사용자 메시지 추가
this.addUserMessage('안녕하세요');

// 2. 타이핑 인디케이터 표시
this.state.setTyping(true);
this.chatWindow.showTypingIndicator();

// 3. API 서버 호출 (최근 5개 히스토리 포함)
const history = this.getRecentHistory(); // 최근 5쌍 (10개)
const response = await sendChatMessage(text, history, sessionId);

// 4. 타이핑 인디케이터 숨기기
this.state.setTyping(false);
this.chatWindow.hideTypingIndicator();

// 5. 봇 응답 추가
this.addBotMessage(response.reply);

// 6. 대화 저장
this.state.saveToStorage();

// 메시지 객체 구조 (OpenAI 형식 통일)
{
  role: 'user' | 'assistant',  // OpenAI 표준 (구 type 필드)
  content: string,               // 메시지 내용 (구 text 필드)
  time: string,                  // HH:MM 형식 (자동 생성)
  id: number                     // 고유 ID (자동 생성)
}
```

### 5. 스타일 규칙

#### CSS-in-JS 방식 사용
```javascript
// src/styles/chatbot.css.js
export const styles = `
  .chatbot-container {
    position: fixed;
    z-index: 9999;
  }

  .chatbot-floating-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
`;
```

#### 클래스명 규칙
- 모든 클래스에 `chatbot-` prefix 사용
- kebab-case 사용
- BEM 방식 권장

```css
.chatbot-container
.chatbot-floating-button
.chatbot-window
.chatbot-header
.chatbot-message
.chatbot-message-content
.chatbot-message--user
.chatbot-message--bot
```

### 6. API 호출 규칙 (백엔드 연동)

```javascript
// src/core/api.js 사용
import { sendChatMessage, initSession } from '../core/api.js';

// ✅ 올바른 방법: 챗봇 메시지 전송
async handleUserMessage(text) {
  try {
    const history = this.getRecentHistory(); // 최근 5쌍
    const sessionId = this.state.getState('sessionId');

    const response = await sendChatMessage(text, history, sessionId);
    this.addBotMessage(response.reply);
  } catch (error) {
    console.error('Failed to send message:', error);
    this.addBotMessage('죄송합니다. 오류가 발생했습니다.');
  }
}

// ✅ 세션 초기화
async initializeSession() {
  const { sessionId } = await initSession();
  this.state.setSessionId(sessionId);
}

// ❌ 직접 fetch 호출 금지
fetch('/api/chat', { ... });  // NO!

// API 서버 엔드포인트 (백엔드 구현 필요)
// POST /api/chat
// - Body: { message: string, history: Array, sessionId: string }
// - Response: { reply: string, sessionId: string }
//
// POST /api/chat/session
// - Response: { sessionId: string }
```

## 🚀 개발 워크플로우

### 개발 모드
```bash
# Live Server로 index.html 실행
# ES6 모듈이 직접 로드됨 (빌드 불필요)
```

### 프로덕션 빌드
```bash
npm run build
# dist/chatbot-template.esm.js (ES Module)
# dist/chatbot-template.min.js (Minified IIFE)
```

### 배포
```bash
# Cloudflare Pages에 배포
# dist/ 폴더만 배포하면 됨
```

## 📝 코딩 스타일 가이드

### Import 순서
```javascript
// 1. Core modules
import { Chatbot } from '../core/chatbot.js';
import { State } from '../core/state.js';

// 2. Components
import { FloatingButton } from '../components/FloatingButton.js';
import { ChatWindow } from '../components/ChatWindow.js';

// 3. Utils
import { createElement } from '../utils/dom.js';
import { formatCurrency } from '../utils/helpers.js';
```

### 주석 규칙
```javascript
// 한국어 주석 사용
// 함수/클래스 상단에 간단한 설명

// ✅ 좋은 예시
// 플로팅 챗봇 버튼 - 클릭 시 대화창 열기/닫기
export class FloatingButton { ... }

// ❌ 나쁜 예시
// This is floating button
export class FloatingButton { ... }
```

### 에러 처리
```javascript
// 모든 비동기 함수는 try-catch 사용
async handleUserMessage(text) {
  try {
    const response = await this.generateResponse(text);
    this.addBotMessage(response);
  } catch (error) {
    console.error('Failed to generate response:', error);
    this.addBotMessage('죄송합니다. 오류가 발생했습니다.');
  }
}
```

## ⚠️ 금지사항 (DO NOT)

1. **Core 파일 구조 변경 금지**
   - `src/core/chatbot.js` - 대화 흐름 관리 로직
   - `src/core/state.js` - 대화 상태 관리 구조
   - `src/core/api.js` - API 엔드포인트 계약
   - 기능 추가는 가능하지만, 기존 인터페이스 변경 금지

2. **직접 DOM 조작 최소화**
   ```javascript
   // ❌ 지양
   document.getElementById('foo');

   // ✅ 권장
   import { $, createElement } from '../utils/dom.js';
   ```

3. **외부 라이브러리 추가 지양**
   - Vanilla JS 원칙 유지
   - 꼭 필요한 경우만 추가 (예: esbuild)

4. **프론트엔드에서 OpenAI 직접 호출 금지**
   - 반드시 백엔드 API 서버를 통해 호출
   - API 키 노출 방지

5. **대화 히스토리 전체 전송 금지**
   - 최근 5쌍(10개) 메시지만 전송
   - 토큰 비용 및 성능 최적화

6. **모듈은 완전 독립적으로 작성**
   - 모듈 폴더 안에 UI + 로직 + 스타일 모두 포함
   - 다른 모듈에 의존하지 않도록 설계
   - 제거 시 폴더만 삭제하면 끝

## 🧪 테스트 체크리스트

새로운 기능 추가 후 확인사항:

- [ ] Live Server에서 정상 작동하는가?
- [ ] 빌드 후 (`npm run build`) dist 파일들이 정상 생성되는가?
- [ ] 플로팅 버튼이 올바른 위치에 표시되는가?
- [ ] 대화창 열기/닫기가 정상 작동하는가?
- [ ] API 서버 연동이 정상 작동하는가?
- [ ] 타이핑 인디케이터가 올바르게 표시/숨김되는가?
- [ ] 최근 5개 메시지 히스토리가 정상 전송되는가?
- [ ] 세션이 LocalStorage에 올바르게 저장/복원되는가?
- [ ] 에러 처리가 올바르게 동작하는가?
- [ ] State 변경이 올바르게 동기화되는가?
- [ ] 모바일에서도 정상 작동하는가?
- [ ] 한국어/영어 메시지가 올바르게 표시되는가?

## 📚 참고 자료

### 주요 파일 설명
- **src/index.js**: 전역 API 노출, 스타일 주입
- **src/core/chatbot.js**: 챗봇 메인 로직, 대화 흐름 관리, API 호출
- **src/core/state.js**: 대화 상태 관리 (메시지, 히스토리, 컨텍스트, 세션)
- **src/core/api.js**: 백엔드 API 서버 연동 (최근 5개 히스토리 전송)
- **src/components/FloatingButton.js**: 플로팅 버튼 UI
- **src/components/ChatWindow.js**: 대화창 UI (타이핑 인디케이터 포함)
- **build.js**: esbuild 설정 (ESM + Minified 출력)

### 새로운 기능 추가 시 읽어야 할 파일
1. 이 파일 (CONTRIBUTING.md)
2. [src/core/chatbot.js](src/core/chatbot.js) - 대화 흐름 이해
3. [src/core/state.js](src/core/state.js) - 대화 상태 관리 이해
4. [src/core/api.js](src/core/api.js) - API 서버 인터페이스 이해
5. 기존 컴포넌트 예시 ([src/components/ChatWindow.js](src/components/ChatWindow.js))

### 백엔드 API 서버 요구사항

프론트엔드는 다음 엔드포인트를 기대합니다:

```
POST /api/chat
Request Body:
{
  "message": "사용자 메시지",
  "history": [
    { "role": "user", "content": "이전 메시지 1" },
    { "role": "assistant", "content": "이전 응답 1" },
    // 최대 10개 (5쌍)
  ],
  "sessionId": "세션ID"
}

Response:
{
  "reply": "AI 응답 메시지",
  "sessionId": "세션ID"
}

POST /api/chat/session
Response:
{
  "sessionId": "새로운 세션ID"
}
```

## 🎓 학습 예시

### AI 챗봇 초기화 예시

```javascript
// index.html에서 사용
const chatbot = new ChatbotTemplate.Chatbot({
  greeting: '안녕하세요! AI 어시스턴트입니다.',
  apiBaseUrl: 'https://your-api-server.com/api',
  maxHistoryLength: 5,
  position: 'bottom-right'
});
```

### 컨텍스트 활용 예시

```javascript
// 사용자 정보를 컨텍스트에 저장
state.setContext('userName', '홍길동');
state.setContext('userPreference', 'tech');

// 대화 중 컨텍스트 활용
const userName = state.getContext('userName');
console.log(`${userName}님의 메시지 처리 중...`);
```

## 🚀 새로운 모듈 추가 가이드

### 완전한 예시: Quiz 모듈 추가

<details>
<summary>1단계: 폴더 및 파일 생성</summary>

```bash
mkdir src/modules/quiz
touch src/modules/quiz/QuizModule.js
touch src/modules/quiz/QuizCard.js
touch src/modules/quiz/QuizResult.js
touch src/modules/quiz/quiz.css.js
touch src/modules/quiz/index.js
```

**폴더 구조:**
```
src/modules/quiz/
├── QuizModule.js     # 비즈니스 로직
├── QuizCard.js       # 퀴즈 UI
├── QuizResult.js     # 결과 UI
├── quiz.css.js       # 스타일
└── index.js          # export
```
</details>

<details>
<summary>2단계: QuizModule.js 작성</summary>

```javascript
// src/modules/quiz/QuizModule.js
import { QuizCard } from './QuizCard.js';
import { QuizResult } from './QuizResult.js';

export class QuizModule {
  constructor(chatbot) {
    this.chatbot = chatbot;
    this.currentQuiz = null;
    this.answers = [];
  }

  /**
   * 퀴즈 UI 렌더링
   */
  render(quizData) {
    this.currentQuiz = quizData;
    this.answers = [];

    const card = new QuizCard({
      title: quizData.title,
      questions: quizData.questions,
      onAnswer: (questionIndex, answer) => {
        this.handleAnswer(questionIndex, answer);
      },
      onComplete: () => {
        this.showResult();
      }
    });

    return card.render();
  }

  /**
   * 답변 처리
   */
  handleAnswer(questionIndex, answer) {
    this.answers[questionIndex] = answer;
    console.log(`Question ${questionIndex} answered:`, answer);
  }

  /**
   * 결과 표시
   */
  showResult() {
    const score = this.calculateScore();

    const result = new QuizResult({
      score: score,
      total: this.currentQuiz.questions.length,
      onClose: () => {
        this.chatbot.addBotMessage(
          `퀴즈를 완료하셨습니다! 점수: ${score}/${this.currentQuiz.questions.length}`
        );
      }
    });

    this.chatbot.chatWindow.addCustomElement(result.render());
  }

  /**
   * 점수 계산
   */
  calculateScore() {
    let score = 0;
    this.currentQuiz.questions.forEach((q, i) => {
      if (this.answers[i] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  }

  /**
   * AI 응답 감지
   */
  static canHandle(aiResponse) {
    return aiResponse.type === 'quiz' && aiResponse.data;
  }
}
```
</details>

<details>
<summary>3단계: QuizCard.js 작성 (UI)</summary>

```javascript
// src/modules/quiz/QuizCard.js
import { createElement } from '../../utils/dom.js';

export class QuizCard {
  constructor(props = {}) {
    this.title = props.title || '퀴즈';
    this.questions = props.questions || [];
    this.onAnswer = props.onAnswer || (() => {});
    this.onComplete = props.onComplete || (() => {});
    this.currentIndex = 0;
  }

  render() {
    const card = createElement('div', {
      className: 'module-quiz-card'
    });

    this.updateCard(card);
    return card;
  }

  updateCard(card) {
    const question = this.questions[this.currentIndex];
    const progress = ((this.currentIndex + 1) / this.questions.length) * 100;

    card.innerHTML = `
      <div class="module-quiz-header">
        <h3>${this.title}</h3>
        <div class="module-quiz-progress">
          <div class="module-quiz-progress-bar" style="width: ${progress}%"></div>
        </div>
        <span class="module-quiz-count">${this.currentIndex + 1} / ${this.questions.length}</span>
      </div>
      <div class="module-quiz-question">
        <p class="module-quiz-question-text">${question.text}</p>
        <div class="module-quiz-options">
          ${question.options.map((option, i) => `
            <button class="module-quiz-option" data-index="${i}">
              ${option}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners(card);
  }

  attachEventListeners(card) {
    card.querySelectorAll('.module-quiz-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIndex = parseInt(e.target.dataset.index);
        const selectedAnswer = this.questions[this.currentIndex].options[selectedIndex];

        this.onAnswer(this.currentIndex, selectedAnswer);
        this.currentIndex++;

        if (this.currentIndex < this.questions.length) {
          this.updateCard(card);
        } else {
          this.onComplete();
          card.remove();
        }
      });
    });
  }
}
```
</details>

<details>
<summary>4단계: quiz.css.js 작성</summary>

```javascript
// src/modules/quiz/quiz.css.js
export const quizStyles = `
  .module-quiz-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .module-quiz-header h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .module-quiz-progress {
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .module-quiz-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  .module-quiz-count {
    font-size: 12px;
    color: #666;
  }

  .module-quiz-question {
    margin-top: 20px;
  }

  .module-quiz-question-text {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .module-quiz-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .module-quiz-option {
    padding: 14px 18px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .module-quiz-option:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;
```
</details>

<details>
<summary>5단계: index.js 작성</summary>

```javascript
// src/modules/quiz/index.js
export { QuizModule } from './QuizModule.js';
export { QuizCard } from './QuizCard.js';
export { QuizResult } from './QuizResult.js';
export { quizStyles } from './quiz.css.js';
```
</details>

<details>
<summary>6단계: chatbot.js에 통합</summary>

```javascript
// src/core/chatbot.js
import { QuizModule } from '../modules/quiz/index.js';

initializeModules() {
  this.modules.survey = new SurveyModule(this);
  this.modules.quiz = new QuizModule(this);  // 추가
}

async handleUserMessage(text) {
  // ... API 호출 ...

  // 응답 타입 처리
  if (response.type === 'quiz' && response.data) {
    const quizUI = this.modules.quiz.render(response.data);
    this.chatWindow.addCustomElement(quizUI);
  } else if (response.type === 'survey' && response.data) {
    // ... 기존 코드 ...
  }
}
```
</details>

<details>
<summary>7단계: index.js에 스타일 통합</summary>

```javascript
// src/index.js
import { surveyStyles } from './modules/survey/survey.css.js';
import { quizStyles } from './modules/quiz/quiz.css.js';

function injectStyles() {
  // ...
  styleElement.textContent = styles + '\n\n' + surveyStyles + '\n\n' + quizStyles;
  // ...
}
```
</details>

<details>
<summary>8단계: 백엔드 API 응답 형식</summary>

```json
{
  "type": "quiz",
  "message": "재미있는 퀴즈를 풀어보세요!",
  "data": {
    "title": "IT 상식 퀴즈",
    "questions": [
      {
        "text": "HTML의 H는 무엇의 약자인가요?",
        "options": ["Hyper", "High", "Home", "Hybrid"],
        "correctAnswer": "Hyper"
      },
      {
        "text": "CSS는 무엇을 의미하나요?",
        "options": [
          "Cascading Style Sheets",
          "Creative Style System",
          "Computer Style Syntax",
          "Colorful Style Sheets"
        ],
        "correctAnswer": "Cascading Style Sheets"
      }
    ]
  },
  "sessionId": "session-123"
}
```
</details>

---

### 모듈 제거 방법

```bash
# Quiz 모듈 제거
rm -rf src/modules/quiz/

# chatbot.js에서 제거
# - import 문 제거
# - initializeModules()에서 초기화 코드 제거
# - handleUserMessage()에서 처리 코드 제거

# index.js에서 스타일 import 제거
```

---

### 완전한 기능 추가 예시: Quick Reply 버튼 (레거시)

<details>
<summary>1단계: QuickReply 컴포넌트 생성</summary>

```javascript
// src/components/QuickReply.js
import { createElement } from '../utils/dom.js';

export class QuickReply {
  constructor(props = {}) {
    this.options = props.options || [];
    this.onSelect = props.onSelect || (() => {});
  }

  render() {
    const container = createElement('div', {
      className: 'chatbot-quick-reply'
    });

    this.options.forEach(option => {
      const button = createElement('button', {
        className: 'chatbot-quick-reply-btn',
        innerHTML: option.label
      });

      button.addEventListener('click', () => {
        this.onSelect(option.value);
      });

      container.appendChild(button);
    });

    return container;
  }
}
```
</details>

<details>
<summary>2단계: ChatWindow에 통합</summary>

```javascript
// src/components/ChatWindow.js
import { QuickReply } from './QuickReply.js';

export class ChatWindow {
  // ...

  addQuickReply(options) {
    const messagesContainer = document.querySelector('#chatbot-messages');
    if (!messagesContainer) return;

    const quickReply = new QuickReply({
      options,
      onSelect: (value) => {
        this.onSendMessage(value);
        // Quick Reply 제거
        messagesContainer.querySelector('.chatbot-quick-reply')?.remove();
      }
    });

    messagesContainer.appendChild(quickReply.render());
  }
}
```
</details>

<details>
<summary>3단계: Chatbot에서 사용</summary>

```javascript
// src/core/chatbot.js

handleUserMessage(text) {
  this.addUserMessage(text);

  setTimeout(() => {
    if (text.includes('상품')) {
      this.addBotMessage('어떤 카테고리를 찾으시나요?');

      // Quick Reply 추가
      this.chatWindow.addQuickReply([
        { label: '노트북', value: '노트북' },
        { label: '헤드폰', value: '헤드폰' },
        { label: '마우스', value: '마우스' }
      ]);
    }
  }, 500);
}
```
</details>

<details>
<summary>4단계: 스타일 추가</summary>

```javascript
// src/styles/chatbot.css.js

export const styles = `
  /* ... 기존 스타일 ... */

  .chatbot-quick-reply {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 12px 0;
  }

  .chatbot-quick-reply-btn {
    padding: 8px 16px;
    border: 1px solid #667eea;
    border-radius: 16px;
    background: white;
    color: #667eea;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .chatbot-quick-reply-btn:hover {
    background: #667eea;
    color: white;
  }
`;
```
</details>

<details>
<summary>5단계: index.js에 Export 추가</summary>

```javascript
// src/index.js

import { QuickReply } from './components/QuickReply.js';

export {
  Chatbot,
  State,
  getState,
  FloatingButton,
  ChatWindow,
  QuickReply  // 추가
};

window.ChatbotTemplate = {
  Chatbot,
  State,
  getState,
  components: {
    FloatingButton,
    ChatWindow,
    QuickReply  // 추가
  }
};
```
</details>

---

## 🚀 성능 최적화 가이드

1. **대화 히스토리 관리**
   - 최근 5쌍(10개)만 API로 전송
   - 전체 히스토리는 LocalStorage에만 저장
   - 불필요한 메타데이터 제거

2. **API 호출 최적화**
   - 타이핑 인디케이터로 UX 개선
   - 에러 발생 시 재시도 로직 (옵션)
   - 네트워크 타임아웃 설정

3. **메모리 관리**
   - 너무 긴 대화 히스토리는 자동 정리
   - 세션 만료 시 LocalStorage 정리

4. **모듈 최적화**
   - 각 모듈은 독립적으로 동작
   - 사용하지 않는 모듈은 import 제거로 자동 제외 (Tree-shaking)
   - 모듈별 스타일은 index.js에서 한 번만 로드

---

## 📝 모듈 개발 체크리스트

새로운 모듈 추가 시 확인사항:

- [ ] 모듈 폴더에 로직 + UI + 스타일 모두 포함되어 있는가?
- [ ] index.js에 모든 export가 정의되어 있는가?
- [ ] chatbot.js의 initializeModules()에 초기화 코드가 있는가?
- [ ] chatbot.js의 handleUserMessage()에 응답 처리 코드가 있는가?
- [ ] src/index.js에 모듈 스타일이 통합되어 있는가?
- [ ] 백엔드 API 응답 형식이 정의되어 있는가?
- [ ] 다른 모듈에 의존하지 않고 독립적으로 동작하는가?
- [ ] 모듈 제거 시 폴더 삭제만으로 완전히 제거되는가?

---

**이 문서를 반드시 따라주세요. 일관된 코드 구조는 프로젝트의 생명입니다.**

**주요 변경사항**

**v3.1 (2025-10-20) - API 안정성 및 OpenAI 형식 통일**
- **OpenAI 형식 완전 통일**: 모든 메시지 형식을 OpenAI 표준으로 변경 (`{role, content}`)
  - `type` → `role` (`'user'` | `'assistant'`)
  - `text` → `content`
  - CSS 클래스 `.bot` → `.assistant`
- **APIClient 클래스 도입**: 기존 함수 기반 → 클래스 기반 구조
  - 타임아웃 제어 (AbortController + finally 블록 정리)
  - 재시도 로직 (Exponential Backoff + Jitter)
  - HTTP status 기반 재시도 판단
  - 사용자 친화적 에러 메시지 + 원본 에러 보존
  - JSON 파싱 실패 처리 강화
  - 스트리밍 지원 (response.body null 체크, timeout, reader 정리)
- **State 구조 단순화**: `conversationHistory` 제거, `messages`만 사용
- **싱글톤 패턴 제거**: `new APIClient()` 직접 사용

**v3.0 (2025-10-19) - 모듈 시스템 도입**
- Handlers 폴더 제거 → Modules 폴더로 재구성
- 모듈별 완전 독립 구조 (UI + 로직 + 스타일 통합)
- Survey 모듈 예시 구현
- 모듈 추가/제거 가이드 추가

**v2.0 (2025-10-18) - AI 전환**
- 키워드 매칭 → 백엔드 AI 서버 연동
- 장바구니 상태 → 대화 상태 중심 재설계
- Mock API → 실제 API 엔드포인트 연동
- 대화 히스토리 컨텍스트 관리 추가

마지막 업데이트: 2025-10-20
