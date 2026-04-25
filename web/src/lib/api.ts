import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = "ApiError";
  }
}

export interface LinkOut {
  id: number;
  code: string;
  target_url: string;
  short_url: string;
  is_custom: boolean;
  is_active: boolean;
  has_password: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkStats {
  code: string;
  total_clicks: number;
  unique_visitors: number;
  last_clicked_at: string | null;
  top_referrers: [string | null, number][];
  top_browsers: [string | null, number][];
  top_os: [string | null, number][];
  clicks_by_day: [string, number][];
}

export interface UserOut {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface CreateLinkBody {
  target_url: string;
  custom_alias?: string;
  expires_at?: string | null;
  password?: string | null;
}

export interface UpdateLinkBody {
  target_url?: string;
  is_active?: boolean;
  expires_at?: string | null;
}

function authHeader(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg ?? "").join(", ");
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  async register(email: string, password: string): Promise<UserOut> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handle<UserOut>(res);
  },

  async login(email: string, password: string): Promise<Token> {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return handle<Token>(res);
  },

  async createLink(body: CreateLinkBody, token?: string | null): Promise<LinkOut> {
    const res = await fetch(`${API_URL}/api/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: JSON.stringify(body),
    });
    return handle<LinkOut>(res);
  },

  async listLinks(token: string): Promise<LinkOut[]> {
    const res = await fetch(`${API_URL}/api/links`, {
      headers: authHeader(token),
    });
    return handle<LinkOut[]>(res);
  },

  async getLink(code: string, token?: string | null): Promise<LinkOut> {
    const res = await fetch(`${API_URL}/api/links/${encodeURIComponent(code)}`, {
      headers: authHeader(token),
    });
    return handle<LinkOut>(res);
  },

  async updateLink(code: string, body: UpdateLinkBody, token: string): Promise<LinkOut> {
    const res = await fetch(`${API_URL}/api/links/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(token) },
      body: JSON.stringify(body),
    });
    return handle<LinkOut>(res);
  },

  async deleteLink(code: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/links/${encodeURIComponent(code)}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
    return handle<void>(res);
  },

  async getStats(code: string, token: string): Promise<LinkStats> {
    const res = await fetch(`${API_URL}/api/links/${encodeURIComponent(code)}/stats`, {
      headers: authHeader(token),
    });
    return handle<LinkStats>(res);
  },

  qrUrl(code: string): string {
    return `${API_URL}/api/links/${encodeURIComponent(code)}/qr`;
  },

  async unlock(code: string, password: string): Promise<{ target_url: string }> {
    const res = await fetch(`${API_URL}/api/links/${encodeURIComponent(code)}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return handle<{ target_url: string }>(res);
  },
};
