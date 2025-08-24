import { kv } from "@vercel/kv";

function sanitizeName(raw) {
  return String(raw || "")
    .trim()
    .slice(0, 16)
    .replace(/[^a-zA-Z0-9 _.\-]/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { name, score } = body;

    const clean = sanitizeName(name);
    const s = Number(score);

    if (!clean || !Number.isFinite(s) || s < 0 || s > 1000000) {
      return res.status(400).json({ ok: false, error: "Invalid name or score" });
    }

    // read current best
    const current = await kv.zscore("lamumu:lb", clean);
    const currentScore = current == null ? null : Number(current);

    // update if better
    if (currentScore == null || s > currentScore) {
      await kv.zadd("lamumu:lb", { score: s, member: clean });

      // trim to Top-100 (Redis ZSET ascending = rank 0 = lowest)
      const size = await kv.zcard("lamumu:lb");
      if (size > 100) {
        await kv.zremrangebyrank("lamumu:lb", 0, size - 101);
      }
    }

    const best = await kv.zscore("lamumu:lb", clean);
    return res.json({ ok: true, name: clean, best: Number(best) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
