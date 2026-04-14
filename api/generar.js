export default async function handler(req, res) {
  // 1. Forzamos que la respuesta siempre sea JSON para evitar el error del "Token A"
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { texto } = req.body;
    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
    
    // Usamos Imagen 3, el modelo estándar de Google AI Studio
    const MODEL_ID = "imagen-3.0-generate-001"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:predict?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: texto }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Detalle error Google:", data);
      return res.status(response.status).json({ 
        error: "Google API Error", 
        detalle: data.error?.message || "Error desconocido" 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("ERROR CRÍTICO:", error);
    return res.status(500).json({ error: "Error de servidor", detalle: error.message });
  }
}
