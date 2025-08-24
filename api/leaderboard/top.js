import { kv } from "@vercel/kv";

export default async function handler(_req, res) {
  try {
    const raw = await kv.zrevrange("lamumu:lb", 0, 99, { withScores: true });
    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({
        rank: i / 2 + 1,
        name: raw[i],
        score: Number(raw[i + 1]),
      });
    }
    return res.json({ ok: true, entries });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
