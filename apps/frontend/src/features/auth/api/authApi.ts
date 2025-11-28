/**
 * Auth API - Now using Firebase Authentication
 * This layer maintains the same interface for components while using Firebase under the hood
 */
import * as firebaseAuth from "@/services/firebaseAuth.service";
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  User,
} from "../types";

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const user = await firebaseAuth.loginWithEmail(
    credentials.email,
    credentials.password,
  );
  return { user, message: "Login successful" };
}

export async function register(data: RegisterRequest): Promise<{ message: string }> {
  const result = await firebaseAuth.registerWithEmail(data);
  return { message: result.message };
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
  return await firebaseAuth.resetPassword(data.email);
}

export async function getCurrentUser(): Promise<User> {
  const user = await firebaseAuth.getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function resetPassword(): Promise<{ message: string }> {
  // Firebase handles password reset via email link, not token
  // This function is kept for backward compatibility but not used with Firebase
  throw new Error("Password reset should be done via email link");
}

export async function logout(): Promise<void> {
  await firebaseAuth.logoutUser();
}
