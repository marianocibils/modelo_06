export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : (req.body || {});

    const { texto } = body;

    if (!texto) {
      return res.status(400).json({ error: "Falta texto" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel" });
    }

    const prompt = `Advertising hyperrealistic photo of an older adult in a natural and emotional scene, based on this idea: "${texto}".

The person is wearing subtle hearing aids for hearing loss.
Warm, natural lighting.
Joyful, connected expression.
Shallow depth of field / soft bokeh background.
Close-up or medium shot.
Do not add any text inside the image.

Possible interactions:
- with son or daughter
- with partner
- with grandchild
- talking on the phone
- smiling at camera
- in a medical consultation with a doctor

Possible environments:
- cozy home
- sunny park
- modern clinic
- café

The image must look like a professional advertising campaign, elegant, realistic, emotional, and clean.`;

    async function generarImagen(aspectRatio) {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio,
                imageSize: "1K"
              }
            }
          })
        }
      );

      const raw = await response.text();
      console.log(`RAW GOOGLE RESPONSE (${aspectRatio}):`, raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        throw new Error(`Google devolvió una respuesta no JSON para ${aspectRatio}: ${raw}`);
      }

      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Error en Google API para ${aspectRatio}`
        );
      }

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p) => p.inlineData?.data);

      if (!imagePart) {
        throw new Error(`Google no devolvió imagen para ${aspectRatio}`);
      }

      return imagePart.inlineData.data;
    }

const postBase64 = await generarImagen("1:1");

return res.status(200).json({
  post: {
    aspectRatio: "1:1",
    b64_json: postBase64
  }
});

  } catch (error) {
    console.error("ERROR SERVER:", error);
    return res.status(500).json({
      error: "Error interno",
      detalle: error.message
    });
  }
}
