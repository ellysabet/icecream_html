# Ice Cream Bliss 🍦 (Glacé Flow 디자인 + Firebase 게시판)

날씨(현재 위치 기반)와 사용자의 기분을 입력받아, Gemini API가 어울리는 아이스크림을 추천해주는 웹앱입니다.
Stitch의 "Glacé Flow" 디자인을 적용했고, 이번 버전부터 **Firebase Firestore 기반 커뮤니티 게시판**이 추가되었습니다.

## 폴더 구조

```
icecream-app/
├── index.html          # 프론트엔드 (입력/결과/게시판 3개 화면, 단일 페이지 전환)
├── api/
│   └── generate.js     # Gemini API 호출 서버리스 함수 (구조화된 JSON 응답)
├── package.json
└── README.md
```

## 이번 버전 변경점 — 게시판(Board) 기능

- 하단 내비게이션의 **Board** 탭, 결과 화면의 **"의견 나누기"** 버튼을 누르면 실제 게시판 화면으로 이동합니다.
- **글쓰기**: 닉네임(선택, 비우면 "익명") + 의견(최대 300자)을 입력하고 "게시하기"를 누르면 Firestore `boardPosts` 컬렉션에 저장됩니다.
- **실시간 목록**: `onSnapshot`으로 실시간 구독하기 때문에, 다른 학생이 글을 올리면 새로고침 없이 바로 화면에 나타납니다. 최신 글 50개까지 최신순으로 보여줍니다.
- 사용자 입력은 전부 `textContent`로만 렌더링해서 스크립트 삽입(XSS)을 방지했습니다.

## ⚠️ 배포 전 꼭 확인할 것 — Firestore 보안 규칙

지금 코드에는 Firebase API 키가 그대로 클라이언트에 노출됩니다. **이건 정상입니다** — Firebase 웹 API 키는 서버 비밀키가 아니라 "이 앱이 어느 프로젝트에 연결되는지" 식별하는 용도라 코드에 있어도 괜찮습니다. 진짜 보안은 **Firestore 보안 규칙(Security Rules)**이 담당합니다.

지금 Firebase 콘솔에서 프로젝트를 막 만든 상태라면 기본 규칙이 "모든 읽기/쓰기 거부" 또는 "테스트 모드(30일간 전체 허용)"로 되어 있을 거예요. 학생들이 게시판을 쓰려면 아래처럼 **읽기는 누구나, 쓰기는 최소한의 검증만 통과하면 허용**하는 규칙을 넣어주세요.

Firebase 콘솔 → Firestore Database → 규칙(Rules) 탭에서:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /boardPosts/{postId} {
      allow read: if true;
      allow create: if
        request.resource.data.message is string &&
        request.resource.data.message.size() > 0 &&
        request.resource.data.message.size() <= 300 &&
        request.resource.data.nickname is string &&
        request.resource.data.nickname.size() <= 20;
      allow update, delete: if false; // 학생 실습용: 수정/삭제는 막아둠
    }
  }
}
```

이 규칙은 "글자수 조건을 지킨 글쓰기와 누구나 읽기"만 허용하고, 수정·삭제는 막아서 실습 중 데이터가 지워지는 사고를 예방합니다. 나중에 수정/삭제 기능을 넣고 싶으면 `allow update, delete`를 조건부로 열어주면 됩니다.

## 로컬 실행 방법

1. [Vercel CLI](https://vercel.com/docs/cli) 설치
   ```
   npm i -g vercel
   ```
2. 프로젝트 루트에서 환경변수 설정 (`.env` 파일 생성) — Gemini 추천 기능에만 필요
   ```
   GEMINI_API_KEY=발급받은_키_입력
   ```
3. 로컬 서버 실행
   ```
   vercel dev
   ```
4. 브라우저에서 `http://localhost:3000` 접속

## Vercel 배포 방법

1. GitHub 저장소에 이 폴더를 push (파일이 저장소 최상위에 있어야 합니다)
2. [vercel.com](https://vercel.com) → New Project → 해당 GitHub 저장소 선택 → Import
3. 프로젝트 설정 → **Environment Variables**에 추가
   - Key: `GEMINI_API_KEY`
   - Value: 발급받은 Gemini API 키
4. Deploy 클릭 → 배포 완료 후 발급된 URL로 접속
5. **Firestore 보안 규칙**을 위 내용대로 설정했는지 확인 (기본 테스트 모드는 30일 후 자동으로 전체 차단됩니다)

## Gemini API 키 발급

[Google AI Studio](https://aistudio.google.com/apikey)에서 무료로 발급받을 수 있습니다.

## 참고

- 사용 모델: `gemini-2.5-flash`. 필요 시 `api/generate.js`의 모델명을 최신 모델로 교체 가능합니다.
- 날씨 API: [Open-Meteo](https://open-meteo.com/) — API 키 없이 사용 가능.
- 위치명 API: [BigDataCloud Reverse Geocoding](https://www.bigdatacloud.com/free-api-reverse-geocode) — API 키 없이 사용 가능.
- 게시판 DB: **Firebase Firestore** (프로젝트: `selecticecream`), CDN 모듈(`firebase-app.js`, `firebase-firestore.js` v12.16.0)을 통해 클라이언트에서 직접 연동.
- Gemini API 키는 프론트엔드에 노출되지 않으며, 서버리스 함수(`api/generate.js`) 안에서 `process.env.GEMINI_API_KEY`로만 읽습니다. (Firebase 설정값은 위 설명대로 클라이언트 노출이 정상입니다.)
