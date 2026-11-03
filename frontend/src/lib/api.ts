/** درخواست‌های سمت مرورگر به جنگو؛ از طریق rewrite روی همین دامنه می‌روند */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields: Record<string, string> = {},
    readonly data: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

const csrfToken = () => document.cookie.match(/(?:^|;\s*)biard_csrf=([^;]+)/)?.[1];

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstMessage(value[0]);
  return undefined;
}

export async function api<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { method = "GET", body } = options;
  if (process.env.NEXT_PUBLIC_DEMO_MODE) {
    const { demoApi } = await import("./demo/browser-api");
    return (await demoApi(path, method, body as Record<string, unknown> | undefined)) as T;
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const token = csrfToken();
    if (token) headers["X-CSRFToken"] = token;
  }

  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.", 0);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (response.ok) return data as T;

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const message = firstMessage(value);
    if (message && key !== "detail" && key !== "code") fields[key] = message;
  }
  const detail = typeof data.detail === "string" ? data.detail : undefined;
  throw new ApiError(detail ?? Object.values(fields)[0] ?? "مشکلی پیش آمد. دوباره تلاش کنید.", response.status, fields, data);
}
