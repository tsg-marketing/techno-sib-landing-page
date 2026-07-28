const YM_COUNTER = 106887780;

export function getYaClientId(): Promise<string> {
  return new Promise((resolve) => {
    const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym;
    const fromCookie = () => {
      const m = document.cookie.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    };
    if (typeof ym !== 'function') return resolve(fromCookie());
    let done = false;
    const finish = (v: string) => {
      if (!done) {
        done = true;
        resolve(v || fromCookie());
      }
    };
    try {
      ym(YM_COUNTER, 'getClientID', (id: string) => finish(String(id)));
    } catch {
      finish('');
    }
    setTimeout(() => finish(''), 600);
  });
}
