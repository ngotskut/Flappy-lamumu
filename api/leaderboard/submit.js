export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { name, score } = req.body || {};
    if (!name || typeof score !== "number") return res.status(400).json({ error: "Missing name or score" });

    // Simpan hanya skor tertinggi per nama
    const base = process.env.KV_REST_API_URL;
    const auth = { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` };

    // Ambil skor lama
    const prev = await fetch(`${base}/get/${encodeURIComponent(name)}`, { headers: auth }).then(r => r.json());
    const prevScore = parseInt(prev?.result ?? "0", 10) || 0;
    const best = Math.max(prevScore, score);

    // Tulis skor baru (atau pertahankan yang lama jika lebih tinggi)
    const resp = await fetch(`${base}/set/${encodeURIComponent(name)}/${best}`, {
      method: "POST",
      headers: auth
    }).then(r => r.json());

    return res.status(200).json({ ok: true, saved: best, upstash: resp });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
