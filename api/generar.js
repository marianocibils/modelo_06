export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body || {};

    const { texto } = body;

    if (!texto) {
      return res.status(400).json({ error: "Falta texto" });
    }

    const prompt = `Crear una imagen publicitaria (1:1) realista sobre audífonos para personas con hipoacusia. (NO COLOCAR EN LA IMAGEN logos y textos.) (Evitar: estética fría, resultados genéricos)(Elegí vos, teniendo en cuenta esto "${texto}", si querés que sea: un/a anciano/a con su hija/o, un/a anciano/a con su pareja, un/a médico/a con paciente anciano/a, un grupo de ancianos/as, un/a anciano/a con su nieto/a, un/a anciano/a hablando por teléfono, un/a anciano/a sonriendo a cámara, una pareja de ancianos/as conversando, un/a anciano/a en consulta médica). (Interpretar el título como concepto creativo central de la imagen y generar una escena coherente y emocional en base a su significado.)

Estilo:
Fotográfico profesional, iluminación cálida, alta calidad, fondo desenfocado.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`, {
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
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ERROR GOOGLE:", data);
      return res.status(500).json(data);
    }

    if (!data.predictions || !data.predictions[0] || !data.predictions[0].bytesBase64Encoded) {
      console.error("ERROR DE GENERACIÓN O FILTROS:", data);
      return res.status(500).json({ error: "No se pudo generar la imagen o fue bloqueada por filtros de seguridad." });
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
    return res.status(500).json({ error: "Error interno", detalle: error.message });
  }
}
