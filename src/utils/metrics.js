/**
 * Безопасная отправка цели в Яндекс.Метрику.
 * При отсутствии ym страница не ломается.
 * @param {string} name
 */
export function reachGoal(name) {
  if (typeof window === 'undefined') return;

  if (import.meta.env.PUBLIC_ENABLE_METRIKA !== 'true') return;
  if (typeof window.ym !== 'function') return;

  const rawId = import.meta.env.PUBLIC_YANDEX_METRIKA_ID;
  const id = rawId ? Number.parseInt(String(rawId).replace(/\D/g, ''), 10) : NaN;
  if (Number.isFinite(id) && id > 0) {
    window.ym(id, 'reachGoal', name);
  }
}
