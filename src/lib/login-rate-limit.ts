type Attempt = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, Attempt>();

function getAttempt(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(key, fresh);
    return fresh;
  }
  return current;
}

export function isLoginRateLimited(key: string) {
  const attempt = getAttempt(key);
  return attempt.count >= MAX_ATTEMPTS ? Math.ceil((attempt.resetAt - Date.now()) / 1000) : 0;
}

export function recordFailedLogin(key: string) {
  const attempt = getAttempt(key);
  attempt.count += 1;
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}

export function loginRateLimitKey(request: Request, email: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${email}`;
}
