/**
 * Genera y persiste un identificador único por navegador (sessionId),
 * usado para vincular ese navegador con un chat de Telegram sin
 * necesidad de un sistema de login.
 *
 * El sessionId se guarda en localStorage la primera vez que se genera,
 * por lo que se mantiene igual entre visitas del mismo navegador.
 */

const STORAGE_KEY = 'energiai_telegram_session_id';
const LINKED_KEY = 'energiai_telegram_linked';

export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

export function isTelegramLinked() {
  return localStorage.getItem(LINKED_KEY) === 'true';
}

export function markTelegramAsLinked() {
  localStorage.setItem(LINKED_KEY, 'true');
}
