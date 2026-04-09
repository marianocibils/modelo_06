export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { texto } = req.body;

  const prompt = `Crear una imagen publicitaria (1024 x 1024) realista sobre audífonos para personas con hipoacusia... "${texto}"`;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error generando imagen" });
  }
}
