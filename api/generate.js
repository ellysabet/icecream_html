// api/generate.js
// Vercel Serverless Function
// 사용자의 기분(mood)과 날씨(weather) 정보를 받아 Gemini API로 아이스크림을 추천합니다.
// API 키는 절대 코드에 직접 쓰지 않고, Vercel 환경변수 GEMINI_API_KEY 에서 읽어옵니다.

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
아래 정보를 참고해서 지금 이 사람에게 가장 잘 어울리는 아이스크림 하나를 추천해줘.

[오늘의 날씨]
- 기온: ${Math.round(weather.temperature)}도
- 날씨 상태: ${weather.weatherDescription}

[사용자의 기분]
"${safeMood}"

[답변 작성 규칙]
1. 추천 아이스크림 이름을 굵게 강조하듯 맨 앞에 이모지와 함께 제시해.
2. 왜 이 아이스크림이 지금 날씨와 기분에 어울리는지 2~3문장으로 설명해.
3. 마지막에 짧고 다정한 한마디를 덧붙여.
4. 전체 답변은 한국어로, 5~6문장 이내로 작성해.
5. 딱딱한 설명체 말고 친구처럼 다정한 말투를 사용해.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ]
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

    return res.status(200).json({ recommendation: text.trim() });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
