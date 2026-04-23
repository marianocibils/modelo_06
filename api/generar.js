export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : (req.body || {});

    const { texto } = body;

    if (!texto) {
      return res.status(400).json({ error: "Falta texto" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel" });
    }

  const prompt =`Fotografía publicitaria hiperrealista de una persona mayor con [sujeto/interacción] teniendo en cuenta esto "${texto}". Lleva puestos unos discretos audífonos para la hipoacusia. Expresión de alegría y conexión. Iluminación natural cálida. Fondo [entorno] desenfocado (bokeh). Primer plano o plano medio.
    
[sujeto/interacción]: su hija/o, su pareja, su nieto/a, hablando por teléfono, sonriendo a cámara, en consulta médica, con un/a médico/a.]

[entorno]: acogedor en casa, parque soleado, cafetería, clínica moderna, etc.

(IMPORTANTE: No agregar textos en la imagen)`;

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
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "2K"
            }
          }
        })
      }
    );

    const raw = await response.text();
    console.log("RAW GOOGLE RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        error: "Google devolvió una respuesta no JSON",
        detalle: raw
      });
    }

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || "Error en Google API",
        detalle: data
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData?.data);

    if (!imagePart) {
      return res.status(500).json({
        error: "Google no devolvió imagen",
        detalle: data
      });
    }

    return res.status(200).json({
      data: [
        {
          b64_json: imagePart.inlineData.data
        }
      ]
    });

  } catch (error) {
    console.error("ERROR SERVER:", error);
    return res.status(500).json({
      error: "Error interno",
      detalle: error.message
    });
  }
}
