export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { texto } = req.body;
    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
    console.log("¿La clave existe?:", !!API_KEY); 
console.log("Nombre de la clave buscada: GOOGLE_AI_STUDIO_KEY");

if (!API_KEY) {
    return res.status(500).json({ error: "La API KEY no está configurada en Vercel" });
}
    
    // MODELO: Probá con este ID que es el más estable para predict
    const MODEL_ID = "imagen-3.0-generate-001"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:predict?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{
          prompt: texto || "Persona usando audífonos, estilo fotográfico profesional"
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          // Esto relaja los filtros por si el tema médico/ancianos causa conflicto
          safetySetting: "BLOCK_NONE" 
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si hay error, enviamos el detalle exacto de Google al cliente
      console.error("Respuesta de Google:", data);
      return res.status(response.status).json({
        error: "Error de la API de Google",
        detalle: data[0]?.error || data.error || data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Error de servidor", detalle: error.message });
  }
}
