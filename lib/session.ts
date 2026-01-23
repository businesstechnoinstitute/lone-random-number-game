import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'auction_session_id';

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export async function createSession(): Promise<string> {
  const sessionId = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return sessionId;
}

export async function getOrCreateSession(): Promise<string> {
  let sessionId = await getSessionId();

  if (!sessionId) {
    sessionId = await createSession();
  }

  return sessionId;
}
