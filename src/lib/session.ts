import { createHmac, timingSafeEqual } from "crypto";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function signSession(clientId: string): string {
  const secret = process.env.SESSION_SECRET!;
  const ts = Date.now().toString();
  const data = `${clientId}:${ts}`;
  const sig = createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(`${data}:${sig}`).toString("base64url");
}

export function verifySession(token: string): string | null {
  try {
    const secret = process.env.SESSION_SECRET!;
    if (!secret) return null;

    const decoded = Buffer.from(token, "base64url").toString();
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;

    const data = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const colonIdx = data.indexOf(":");
    if (colonIdx === -1) return null;

    const clientId = data.slice(0, colonIdx);
    const ts = data.slice(colonIdx + 1);
    if (!clientId || !ts) return null;

    // Check expiry
    if (Date.now() - parseInt(ts) > SESSION_TTL_MS) return null;

    // Timing-safe signature comparison
    const expected = createHmac("sha256", secret).update(data).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    return clientId;
  } catch {
    return null;
  }
}
