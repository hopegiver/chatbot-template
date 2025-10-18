# AI Chatbot Template

Cloudflare Pages 배포를 위한 **AI 기반** embeddable 챗봇 위젯 템플릿입니다.

고객 웹사이트에 임베드 가능한 AI 대화형 챗봇을 제공하며, Vanilla JavaScript와 esbuild를 사용하여 가볍고 빠른 성능을 제공합니다.

**주요 특징:**
- 🤖 백엔드 API 서버 연동 (OpenAI 등)
- 💬 최근 5개 메시지 컨텍스트 유지
- ⚡ 타이핑 인디케이터 & 실시간 응답
- 💾 LocalStorage 기반 대화 히스토리 저장

## 🚀 빠른 시작

### 1. 템플릿 설치

```bash
git clone https://github.com/yourusername/chatbot-template.git
cd chatbot-template
npm install
```

### 2. 개발 시작

```bash
# Live Server로 index.html 실행
# 빌드 없이 바로 개발 가능 (ES6 모듈)
```

### 3. 프로덕션 빌드

```bash
npm run build
```

## 💡 사용법

### 개발 모드 (ES6 Modules)

```html
<script type="module">
  import { Chatbot } from './src/index.js';

  const chatbot = new Chatbot({
    position: 'bottom-right',
    greeting: '안녕하세요! AI 어시스턴트입니다.',
    apiBaseUrl: 'http://localhost:3000/api',
    maxHistoryLength: 5
  });
</script>
```

### 배포 모드 (고객용)

```html
<script src="https://cdn.yourservice.com/chatbot.min.js"></script>
<script>
  const chatbot = new Chatbot({
    apiBaseUrl: 'https://your-api-server.com/api',
    position: 'bottom-right',
    theme: 'light',
    greeting: '안녕하세요! 무엇을 도와드릴까요?'
  });
</script>
```

또는 네임스페이스 사용:

```html
<script>
  const chatbot = new ChatbotTemplate.Chatbot({
    apiBaseUrl: 'https://your-api-server.com/api'
  });
</script>
```

## 📋 설정 옵션

```javascript
new Chatbot({
  // 필수
  apiBaseUrl: 'https://your-api-server.com/api',  // 백엔드 API 서버 URL

  // 선택 (기본값 표시)
  position: 'bottom-right',         // 위치: bottom-right, bottom-left, top-right, top-left
  theme: 'light',                   // 테마: light, dark
  greeting: '안녕하세요!',          // 초기 인사 메시지
  maxHistoryLength: 5,              // 최대 히스토리 개수 (API 전송 시)
  offset: { x: 20, y: 20 }         // 화면 가장자리로부터 오프셋 (px)
})
```

## 🔌 백엔드 API 요구사항

프론트엔드 챗봇은 다음 API 엔드포인트를 기대합니다:

### POST `/api/chat`

**Request:**
```json
{
  "message": "사용자 메시지",
  "history": [
    { "role": "user", "content": "이전 메시지" },
    { "role": "assistant", "content": "이전 응답" }
  ],
  "sessionId": "세션ID"
}
```

**Response:**
```json
{
  "reply": "AI 응답 메시지",
  "sessionId": "세션ID"
}
```

### POST `/api/chat/session`

**Response:**
```json
{
  "sessionId": "새로운 세션ID"
}
```

## 🏗️ 프로젝트 구조

```
chatbot-template/
├── src/
│   ├── core/              # 핵심 로직
│   │   ├── chatbot.js    # 챗봇 메인 클래스
│   │   ├── state.js      # 전역 상태 관리
│   │   └── api.js        # API 호출 래퍼
│   ├── components/        # UI 컴포넌트
│   │   ├── FloatingButton.js   # 플로팅 버튼
│   │   └── ChatWindow.js       # 대화창
│   ├── handlers/          # 메시지 핸들러 (향후 확장)
│   ├── utils/            # 헬퍼 함수
│   │   ├── dom.js
│   │   └── helpers.js
│   ├── styles/           # CSS-in-JS
│   │   └── chatbot.css.js
│   └── index.js          # 엔트리 포인트
├── mock-api/             # Static JSON 파일들
├── dist/                 # 빌드 결과물
├── index.html            # 데모 페이지
├── build.js              # esbuild 설정
└── package.json
```

## 🎨 주요 기능

### 현재 구현된 기능 (v2.0)

- ✅ 플로팅 챗봇 버튼 (오른쪽 하단 고정)
- ✅ 대화창 열기/닫기 애니메이션
- ✅ 사용자/봇 메시지 구분
- ✅ **AI 기반 응답 (백엔드 API 연동)**
- ✅ **최근 5개 메시지 컨텍스트 유지**
- ✅ **타이핑 인디케이터 애니메이션**
- ✅ **LocalStorage 기반 대화 히스토리 저장**
- ✅ **세션 관리**
- ✅ 반응형 디자인 (모바일 대응)
- ✅ 다양한 위치 설정 (4방향)
- ✅ 커스터마이징 가능한 스타일

### 향후 추가 예정

- 🔜 상품 카드 표시
- 🔜 Quick Reply 버튼
- 🔜 파일 업로드
- 🔜 다국어 지원
- 🔜 스트리밍 응답 (SSE)

## 🛠️ 기술 스택

**프론트엔드:**
- Vanilla JavaScript (ES6 Modules)
- esbuild
- CSS-in-JS
- LocalStorage

**백엔드 (별도 구현 필요):**
- Node.js / Python / Go 등
- OpenAI API / Anthropic Claude API
- 세션 관리 (Redis 권장)

**배포:**
- Cloudflare Pages (프론트엔드)
- Cloudflare Workers / Vercel / AWS Lambda (백엔드)

## 🔧 개발

### 빌드 명령어

```bash
# 프로덕션 빌드
npm run build

# Watch 모드
npm run watch
```

### 빌드 결과물

- `dist/chatbot-template.esm.js` - ES Module 버전
- `dist/chatbot-template.min.js` - Minified IIFE 버전

## 🌐 배포

Cloudflare Pages에 배포:

1. GitHub에 코드 푸시
2. Cloudflare Pages에서 프로젝트 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `dist`

## 📚 API

### Chatbot 클래스

```javascript
const chatbot = new Chatbot(config);

// 메서드
chatbot.open();                    // 챗봇 열기
chatbot.close();                   // 챗봇 닫기
chatbot.toggle();                  // 열기/닫기 토글
chatbot.clearConversation();       // 대화 초기화
chatbot.destroy();                 // 챗봇 제거

// State 접근
chatbot.state.getState('messages');        // 메시지 히스토리 가져오기
chatbot.state.setContext('key', 'value');  // 컨텍스트 설정
chatbot.state.saveToStorage();             // 대화 저장
```

## 🤝 다른 서비스와 통합

### pages-template과 함께 사용

```html
<!-- 임베드 위젯 + AI 챗봇 함께 사용 -->
<div id="product-catalog"></div>

<script src="pages-template.min.js"></script>
<script src="chatbot-template.min.js"></script>

<script>
  // 상품 카탈로그 (임베드)
  const catalog = new Widget('#product-catalog', {
    apiKey: 'your-api-key'
  });

  // AI 챗봇 (플로팅)
  const chatbot = new Chatbot({
    apiBaseUrl: 'https://your-api-server.com/api',
    position: 'bottom-right',
    greeting: '상품에 대해 궁금하신 점을 물어보세요!'
  });

  // State 공유 (옵션)
  chatbot.state.setContext('catalog', catalog);
</script>
```

### 백엔드 예시 (Node.js + OpenAI)

```javascript
// Express.js 예시
app.post('/api/chat', async (req, res) => {
  const { message, history, sessionId } = req.body;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '당신은 친절한 AI 어시스턴트입니다.' },
      ...history,
      { role: 'user', content: message }
    ]
  });

  res.json({
    reply: completion.choices[0].message.content,
    sessionId: sessionId || generateSessionId()
  });
});
```

## 📝 커스터마이징

스타일 변경은 `src/styles/chatbot.css.js`에서 가능합니다.

```javascript
// 예: 버튼 색상 변경
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// → 원하는 색상으로 변경
```

## 📄 라이센스

MIT License
