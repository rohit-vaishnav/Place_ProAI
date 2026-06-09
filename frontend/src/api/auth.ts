import { apiRequest, setToken } from "./client";
import { UserRole } from "../types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export async function login(email: string, password: string) {
  console.log("LOGIN START");

  const result = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    auth: false,
  });

  console.log("LOGIN RESPONSE:", result);

  setToken(result.token);

  return result;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  location?: string;
  officerPasscode?: string;
  adminPasscode?: string;
  studentProfile?: Record<string, unknown>;
}): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
  setToken(result.token);
  return result;
}

export async function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}

export function logout() {
  setToken(null);
  localStorage.removeItem("placely_cur_user");
}
