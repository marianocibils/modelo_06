export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" 
      ? JSON.parse(req.body) 
      : req.body;

    const { texto } = body;

    if (!texto) {
      return res.status(400).json({ error: "Falta texto" });
    }

    const prompt = `Crear una imagen publicitaria (1024 x 1024) realista sobre audífonos para personas con hipoacusia. (NO COLOCAR EN LA IMAGEN logos y textos.) (Evitar: estética fría, resultados genéricos)(Elegí vos, teniendo en cuenta esto "${texto}", si querés que sea: un/a anciano/a con su hija/o, un/a anciano/a con su pareja, un/a médico/a con paciente anciano/a, un grupo de ancianos/as, un/a anciano/a con su nieto/a, un/a anciano/a hablando por teléfono, un/a anciano/a sonriendo a cámara, una pareja de ancianos/as conversando, un/a anciano/a en consulta médica). (Interpretar el título como concepto creativo central de la imagen y generar una escena coherente y emocional en base a su significado.)

Estilo:
Fotográfico profesional, iluminación cálida, alta calidad, fondo desenfocado.`;

    // Configuración para Google AI Studio (Imagen 3)
    // Nota: El modelo suele ser 'imagen-3.0-generate-001' o similar según la región/permisos
    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
    const MODEL_ID = "imagen-3.0-generate-001"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:predict?key=${API_KEY}`;

    const response = await fetch(url, {
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
          aspectRatio: "1:1",
          outputMimeType: "image/jpeg"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ERROR GOOGLE AI:", data);
      return res.status(response.status).json(data);
    }

    // Google devuelve la imagen en Base64 dentro de predictions[0].bytesBase64Encoded
    // Si tu frontend espera una URL (como hacía OpenAI), deberás manejar el base64 o subirlo a un bucket.
    return res.status(200).json(data);

  } catch (error) {
    console.error("ERROR SERVER:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
