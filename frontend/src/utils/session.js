const SESSION_KEY = 'clientSessionId';

const createSessionId = () => {
  const randomPart = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  return `sess_${timestamp}_${randomPart}`;
};

export const getClientSessionId = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const generated = createSessionId();
    sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return null;
  }
};

