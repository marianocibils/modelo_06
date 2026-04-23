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

(IMPORTANTE: No agregar textos en la imagen`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-001:predict?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
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
      console.error("ERROR GOOGLE:", data);
      return res.status(500).json({
        error: data?.error?.message || "Error en Google API",
        detalle: data
      });
    }

    if (
      !data.predictions ||
      !data.predictions[0] ||
      !data.predictions[0].bytesBase64Encoded
    ) {
      console.error("RESPUESTA INCOMPLETA:", data);
      return res.status(500).json({
        error: "Google no devolvió imagen",
        detalle: data
      });
    }

    return res.status(200).json({
      data: [
        {
          b64_json: data.predictions[0].bytesBase64Encoded
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
