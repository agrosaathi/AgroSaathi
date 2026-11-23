// Runs on Netlify's server, so the Gemini API key stays secret.
const reply = (code, obj) => ({
  statusCode: code,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return reply(405, { error: "Method not allowed" });
  try {
    const { image, mime, lang } = JSON.parse(event.body || "{}");
    if (!image) return reply(400, { error: "No image received" });
    const key = process.env.GEMINI_API_KEY;
    if (!key)
      return reply(500, {
        error: "Server is not configured (missing API key)",
      });

    const language =
      { en: "English", hi: "Hindi", gu: "Gujarati" }[lang] || "English";
    const prompt = `You are an expert Indian agronomist. Look at this crop leaf photo.
Reply ONLY with JSON in this exact shape:
{"valid":true,"crop":"","disease":"","healthy":false,"confidence":0,"severity":"Low|Moderate|High","symptoms":"","organic":["",""],"chemical":["",""],"prevention":["",""]}
Rules:
- If the photo is not a plant leaf or crop, reply {"valid":false,"message":"<short advice>"}.
- If the leaf is healthy, set healthy true, disease "Healthy leaf", and give prevention tips only.
- confidence is your honest estimate from 0 to 100. If unsure, say so in symptoms and lower it.
- Chemical option: name the active ingredient and a typical dose per litre, and say to follow the label.
- Write all text values in ${language}.`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: { mime_type: mime || "image/jpeg", data: image },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      },
    );
    const j = await r.json();
    if (!r.ok)
      return reply(502, {
        error: (j.error && j.error.message) || "AI service error",
      });
    const text = j.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return reply(200, JSON.parse(text));
  } catch (e) {
    return reply(500, { error: "Could not analyse the image" });
  }
};
