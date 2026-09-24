import { api } from "./client";
import type { AccountType, AuthResponse } from "../types";

export function me() {
  return api<AuthResponse>("/api/auth/me/");
}

export function login(email: string, password: string) {
  return api<AuthResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function signup(name: string, email: string, password: string, accountType: AccountType) {
  return api<AuthResponse>("/api/auth/signup/", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      account_type: accountType
    })
  });
}

export function logout() {
  return api<{ ok: boolean }>("/api/auth/logout/", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  return api<{ ok: boolean }>("/api/auth/password/", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
}
