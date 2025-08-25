export default async function handler(_req, res) {
  try {
    const base = process.env.KV_REST_API_URL;
    const auth = { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` };

    // Ambil semua key (jika nama pemain banyak, ini cukup untuk hobi/prototype)
    const keysResp = await fetch(`${base}/keys/*`, { headers: auth }).then(r => r.json());
    const keys = keysResp?.result || [];

    const list = [];
    for (const k of keys) {
      const v = await fetch(`${base}/get/${encodeURIComponent(k)}`, { headers: auth }).then(r => r.json());
      list.push({ name: k, score: parseInt(v?.result ?? "0", 10) || 0 });
    }
    list.sort((a, b) => b.score - a.score);
    return res.status(200).json(list.slice(0, 100)); // Top 100
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
