/** ابزار طراحی پرنده‌ها؛ خروجی برای هر ورودی ثابت است تا سرور و مرورگر یکی رندر کنند */

const round = (n: number) => Math.round(n * 100) / 100;

function basis(x: number, y: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  return (along: number, across: number) => `${round(x + ux * along - uy * across)} ${round(y + uy * along + ux * across)}`;
}

/** یک پر از نقطهٔ پایه، در جهت angle (درجه) */
export function feather(x: number, y: number, angle: number, length: number, width: number) {
  const p = basis(x, y, angle);
  return `M${p(0, 0)} C${p(length * 0.2, width)} ${p(length * 0.92, width * 1.05)} ${p(length, width * 0.1)} C${p(length * 1.03, -width * 0.45)} ${p(length * 0.72, -width * 0.8)} ${p(length * 0.3, -width * 0.8)} C${p(length * 0.15, -width * 0.7)} ${p(length * 0.05, -width * 0.3)} ${p(0, 0)} Z`;
}

/** خط میانی پر که به آن بافت می‌دهد */
export function rachis(x: number, y: number, angle: number, length: number) {
  const p = basis(x, y, angle);
  return `M${p(length * 0.04, 0)} L${p(length * 0.9, 0)}`;
}

/** تغییر روشنایی و اشباع یک رنگ oklch */
export function shade(color: string, dL: number, dC = 0) {
  const match = color.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
  if (!match) return color;
  const [, l, c, h] = match;
  const clamp = (n: number, max: number) => Math.round(Math.min(max, Math.max(0, n)) * 1000) / 1000;
  return `oklch(${clamp(Number(l) + dL, 0.99)} ${clamp(Number(c) + dC, 0.37)} ${h})`;
}

export type FeatherSpec = { d: string; rib: string };

/** بادبزنی از پرها با زاویه و طول تدریجی */
export function fan(
  count: number,
  base: (i: number) => [number, number],
  angle: (i: number) => number,
  length: (i: number) => number,
  width: number,
): FeatherSpec[] {
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = base(i);
    return { d: feather(x, y, angle(i), length(i), width), rib: rachis(x, y, angle(i), length(i)) };
  });
}
