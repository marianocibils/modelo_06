// En tu archivo de la API
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { texto } = req.body;
    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
    
    // El modelo exacto para la API Key que mostraste:
    const MODEL_ID = "imagen-3.0-generate-001"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:predict?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{
          // Agregamos un refuerzo al prompt para que no falle si el texto es corto
          prompt: `A professional advertising photo for hearing aids, realistic style, high quality. Scene: ${texto || "an elderly person smiling"}`
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          outputMimeType: "image/jpeg"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Detalle error Google:", JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("ERROR CRÍTICO:", error);
    return res.status(500).json({ error: "Error de servidor", detalle: error.message });
  }
}
