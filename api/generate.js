// api/generate.js
// Vercel Serverless Function
// 사용자의 기분(mood)과 날씨(weather) 정보를 받아 Gemini API로 아이스크림을 추천합니다.
// API 키는 절대 코드에 직접 쓰지 않고, Vercel 환경변수 GEMINI_API_KEY 에서 읽어옵니다.
// 결과 화면 디자인(Glacé Flow)에 맞춰 구조화된 JSON으로 응답을 받습니다.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '서버에 GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.' });
  }

  const { mood, weather } = req.body || {};

  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ error: 'mood 값이 필요합니다.' });
  }
  if (!weather || typeof weather.temperature !== 'number' || !weather.weatherDescription) {
    return res.status(400).json({ error: 'weather 값이 올바르지 않습니다.' });
  }

  // 사용자 입력 길이 제한 (과도한 요청 방지)
  const safeMood = mood.slice(0, 300);

  const prompt = `너는 아이스크림 가게의 친절한 AI 큐레이터야.
아래 정보를 참고해서 지금 이 사람에게 가장 잘 어울리는 아이스크림(또는 소르베, 젤라또 등 콜드 디저트) 하나를 추천해줘.

[오늘의 날씨]
- 기온: ${Math.round(weather.temperature)}도
- 날씨 상태: ${weather.weatherDescription}

[사용자의 기분]
"${safeMood}"

아래 JSON 스키마 형식으로만 답변해. 다른 설명이나 마크다운은 절대 포함하지 마.
{
  "flavorNameKo": "한글 아이스크림 이름 (예: 유자 레몬 소르베)",
  "flavorNameEn": "영문 이름을 대문자로 (예: YUZU LEMON SORBET)",
  "emoji": "이 맛을 가장 잘 나타내는 이모지 1개",
  "tag": "해시태그로 쓸 짧은 단어 (예: 상큼상큼, 기분전환)",
  "description": "왜 이 맛이 지금 날씨와 기분에 어울리는지, 다정하고 감성적인 말투로 3~4문장. 마지막에 짧은 응원 한마디 포함."
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errBody);
      return res.status(502).json({ error: 'AI 추천을 받아오는 중 오류가 발생했습니다.' });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'AI 응답을 해석하지 못했습니다.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, text);
      return res.status(502).json({ error: 'AI 응답 형식을 해석하지 못했습니다.' });
    }

    return res.status(200).json({
      flavorNameKo: parsed.flavorNameKo || '오늘의 아이스크림',
      flavorNameEn: parsed.flavorNameEn || '',
      emoji: parsed.emoji || '🍧',
      tag: parsed.tag || '',
      description: parsed.description || ''
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
