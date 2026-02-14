import crypto from "crypto";

export const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || (() => {
  console.warn("WARNING: No JWT_SECRET or SESSION_SECRET set. Using auto-generated secret (tokens will not persist across restarts).");
  return crypto.randomBytes(32).toString("hex");
})();
