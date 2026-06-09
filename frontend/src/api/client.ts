const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "placely_token";

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  retries?: number;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, retries = 1, headers, ...rest } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) reqHeaders.Authorization = `Bearer ${token}`;
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...rest, headers: reqHeaders });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const body = isJson ? await res.json() : null;

      if (!res.ok) {
        throw new ApiError(
          body?.message || `Request failed (${res.status})`,
          res.status,
          body?.errors
        );
      }

      // Standardized API wraps in { success, data }; AI routes return raw JSON
      if (body && typeof body === "object" && "success" in body && "data" in body) {
        return body.data as T;
      }
      return body as T;
    } catch (err) {
      lastError = err;
      if (attempt < retries && err instanceof TypeError) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

/** Paginated list helper — backend returns array in `data` */
export async function apiList<T>(path: string, options?: RequestOptions): Promise<T[]> {
  const result = await apiRequest<T[]>(path, options);
  return Array.isArray(result) ? result : [];
}
