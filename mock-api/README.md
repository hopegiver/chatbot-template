# Mock API

이 폴더는 개발/데모 환경에서 사용할 정적 JSON 응답 파일들을 포함합니다.

## 파일 구조

```
mock-api/
├── chat.json              # 기본 채팅 응답
├── session.json           # 세션 초기화 응답
└── README.md
```

## 사용법

### 1. 개발 서버에서 사용

로컬 개발 서버(예: Live Server)를 실행하면 다음 경로로 접근 가능합니다:

- `http://localhost:5500/mock-api/chat.json`
- `http://localhost:5500/mock-api/session.json`
- `http://localhost:5500/mock-api/survey-response.json`

### 2. API 클라이언트 설정

`src/core/api.js`에서 API_BASE_URL을 `/mock-api`로 설정:

```javascript
let API_BASE_URL = '/mock-api';
```

### 3. 엔드포인트 매핑

실제 API와 Mock API의 매핑:

| 실제 API | Mock API | 파일 |
|---------|---------|------|
| POST /api/chat | GET /mock-api/chat.json | chat.json |
| POST /api/chat/session | GET /mock-api/session.json | session.json |

## 응답 타입

### 일반 텍스트 응답 (chat.json)
```json
{
  "reply": "응답 메시지",
  "sessionId": "세션ID",
  "type": "text"
}
```

## 주의사항

- Mock API는 정적 파일이므로 POST 요청이 실제로 처리되지 않습니다
- 실제 개발에서는 `fetchAPI()` 함수를 수정하여 GET 요청으로 변경하거나
- 별도의 mock 서버(json-server 등)를 사용하는 것을 권장합니다

## Cloudflare Pages 배포

Cloudflare Pages에 배포 시 이 폴더도 함께 배포되어 정적 파일로 제공됩니다:

```
https://your-domain.pages.dev/mock-api/chat.json
```
