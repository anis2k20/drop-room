export function useSignaling(url: string) {
    const ws = new WebSocket(url);
      const handlers = new Map<string, (m: any) => void>();

    ws.onmessage = e => {
        const m = JSON.parse(e.data);
         handlers.get(m.type)?.(m);
    }

    const send = (m: object) => {
        const data = JSON.stringify(m);
        if (ws.readyState === WebSocket.OPEN) ws.send(data);
        else ws.addEventListener("open", () => ws.send(data), { once: true });
    }

    const on = (type: string, fn: (m: any) => void) => handlers.set(type, fn);
    return { send, on, close: () => ws.close() };

}