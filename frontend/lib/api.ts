const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** JWT from a prior login, sent as `Authorization: Bearer <token>`. */
  token?: string;
}

/**
 * Thin fetch wrapper around the FastAPI backend (see backend/app/main.py -
 * every route lives under /api/v1). Handles the JSON body convention and the
 * `{"detail": "..."}` error shape FastAPI's HTTPException produces.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") {
        detail = data.detail;
      }
    } catch {
      // Response body wasn't JSON - fall back to statusText.
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
