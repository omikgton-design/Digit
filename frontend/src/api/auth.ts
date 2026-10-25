import { api } from "./client";
import type { AccountType, AuthResponse } from "../types";

export function me() {
  return api<AuthResponse>("/api/auth/me/");
}

export type LoginCredentials = { email?: string; registerNumber?: string };

// Хувь хүн: имэйл + нууц үг. Байгууллага: регистр + нууц үг.
export function login(credentials: LoginCredentials, password: string, remember = true) {
  return api<AuthResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email || undefined,
      register_number: credentials.registerNumber || undefined,
      password,
      remember
    })
  });
}

export function signup(name: string, email: string, password: string, accountType: AccountType, registerNumber?: string) {
  return api<AuthResponse>("/api/auth/signup/", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      account_type: accountType,
      register_number: registerNumber || undefined
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

export function requestPasswordReset(email: string) {
  return api<{ message: string }>("/api/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function confirmPasswordReset(uid: string, token: string, password: string) {
  return api<{ message: string }>("/api/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify({ uid, token, password })
  });
}
