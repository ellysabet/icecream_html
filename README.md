# Ice Cream Bliss 🍦 (Glacé Flow 디자인 적용)

날씨(현재 위치 기반)와 사용자의 기분을 입력받아, Gemini API가 어울리는 아이스크림을 추천해주는 웹앱입니다.
Stitch에서 받은 "Glacé Flow" 디자인 시스템(글래스모피즘 + 파스텔 그라데이션)을 적용했습니다.

## 폴더 구조

```
icecream-app/
├── index.html          # 프론트엔드 (입력 화면 + 결과 화면, 단일 페이지 전환)
├── api/
│   └── generate.js     # Gemini API 호출 서버리스 함수 (구조화된 JSON 응답)
├── package.json
└── README.md
```

## 이전 버전 대비 변경점

1. **디자인 전면 적용**: Stitch에서 받은 Glacé Flow 디자인 토큰(색상, 폰트, 라운드, 간격)을 Tailwind 설정으로 그대로 반영했습니다.
2. **화면 전환 구조**: 하나의 `index.html` 안에서 `#viewInput`(입력)과 `#viewResult`(결과)를 JS로 토글하는 방식입니다. 별도 라우팅 없이 SPA처럼 동작합니다.
3. **Gemini 응답을 JSON으로 구조화**: 기존에는 텍스트 한 덩어리를 받았지만, 이제는 `generationConfig.responseMimeType: "application/json"`을 사용해 `flavorNameKo`, `flavorNameEn`, `emoji`, `tag`, `description` 필드로 나눠 받습니다. 그래서 결과 카드의 제목/영문명/해시태그/설명을 디자인대로 각각 채울 수 있습니다.
4. **위치 라벨 표시**: [BigDataCloud 무료 역지오코딩 API](https://www.bigdatacloud.com/free-api-reverse-geocode)(키 불필요)를 추가해서 날씨 카드에 "서울", "부천" 같은 지역명을 보여줍니다. 실패 시 "내 위치"로 대체됩니다.
5. **Board / History 탭**: 디자인에는 있지만 이번 버전에서는 기능 구현 전이라, 누르면 "준비 중" 토스트 메시지만 뜨는 자리표시자(placeholder)입니다. 실제 게시판/기록 기능을 붙이려면 Firebase 같은 백엔드 저장소가 필요합니다.

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

1. GitHub 저장소에 이 폴더를 push (파일이 저장소 최상위에 있어야 합니다)
2. [vercel.com](https://vercel.com) → New Project → 해당 GitHub 저장소 선택 → Import
3. 프로젝트 설정 → **Environment Variables**에 추가
   - Key: `GEMINI_API_KEY`
   - Value: 발급받은 Gemini API 키
4. Deploy 클릭 → 배포 완료 후 발급된 URL로 접속

## Gemini API 키 발급

[Google AI Studio](https://aistudio.google.com/apikey)에서 무료로 발급받을 수 있습니다.

## 참고

- 사용 모델: `gemini-2.5-flash`. 필요 시 `api/generate.js`의 모델명을 최신 모델로 교체 가능합니다.
- 날씨 API: [Open-Meteo](https://open-meteo.com/) — API 키 없이 사용 가능.
- 위치명 API: [BigDataCloud Reverse Geocoding](https://www.bigdatacloud.com/free-api-reverse-geocode) — API 키 없이 사용 가능.
- API 키는 절대 프론트엔드 코드에 노출되지 않으며, 서버리스 함수(`api/generate.js`) 안에서 `process.env.GEMINI_API_KEY`로만 읽습니다.
