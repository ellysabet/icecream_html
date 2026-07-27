# 오늘의 아이스크림 추천 🍦

날씨(현재 위치 기반)와 사용자의 기분을 입력받아, Gemini API가 어울리는 아이스크림을 추천해주는 웹앱입니다.

## 폴더 구조

```
icecream-app/
├── index.html          # 프론트엔드 (날씨 표시 + 기분 입력 + 결과 표시)
├── api/
│   └── generate.js     # Gemini API 호출 서버리스 함수
├── package.json
└── README.md
```

## 동작 방식

1. 브라우저가 사용자 위치 권한을 요청하고, 허용되면 해당 위치의 현재 날씨(기온, 날씨 상태)를 **Open-Meteo API**(무료, 키 불필요)로 가져옵니다. 권한을 거부하면 서울 날씨로 대체됩니다.
2. 사용자가 오늘 기분을 텍스트로 입력하고 버튼을 누릅니다.
3. 프론트엔드가 `{ mood, weather }`를 `/api/generate`로 POST 요청합니다.
4. `api/generate.js`가 서버에서 Gemini API를 호출해 추천 문구를 생성하고, 결과를 프론트엔드로 돌려줍니다.

## 로컬 실행 방법

1. [Vercel CLI](https://vercel.com/docs/cli) 설치
   ```
   npm i -g vercel
   ```
2. 프로젝트 루트에서 환경변수 설정 (`.env` 파일 생성)
   ```
   GEMINI_API_KEY=발급받은_키_입력
   ```
3. 로컬 서버 실행
   ```
   vercel dev
   ```
4. 브라우저에서 `http://localhost:3000` 접속

## Vercel 배포 방법

1. GitHub 저장소에 이 폴더를 push
2. [vercel.com](https://vercel.com) → New Project → 해당 GitHub 저장소 선택 → Import
3. 프로젝트 설정에서 **Environment Variables**에 다음을 추가
   - Key: `GEMINI_API_KEY`
   - Value: 발급받은 Gemini API 키
4. Deploy 클릭 → 배포 완료 후 발급된 URL로 접속

## Gemini API 키 발급

[Google AI Studio](https://aistudio.google.com/apikey)에서 무료로 발급받을 수 있습니다.

## 참고

- 사용 모델: `gemini-2.5-flash` (현재 안정적으로 지원되는 균형형 모델). 필요 시 `api/generate.js`의 모델명을 최신 모델(예: `gemini-3.6-flash`)로 교체 가능합니다.
- 날씨 API: [Open-Meteo](https://open-meteo.com/) — API 키 없이 사용 가능, CORS 지원.
- API 키는 절대 프론트엔드 코드에 노출되지 않으며, 서버리스 함수(`api/generate.js`) 안에서 `process.env.GEMINI_API_KEY`로만 읽습니다.
