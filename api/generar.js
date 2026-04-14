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

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("ERROR OPENAI:", data);
      return res.status(500).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("ERROR SERVER:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
