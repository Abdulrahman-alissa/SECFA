import { apiClient } from "@/lib/apiClient";

/**
 * Authentication Service
 * Handles all authentication business logic
 * Can be replaced with Node.js + Express implementation later
 */

export const authService = {
  async signup(email: string, password: string, fullName: string, phone?: string) {
    // Validate inputs
    if (!email || !password || !fullName) {
      throw new Error("All required fields must be filled");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Call API - all new users are automatically assigned "student" role
    const { data, error } = await apiClient.signup(email, password, {
      full_name: fullName,
      phone: phone || null,
      role: "student"
    });

    if (error) throw error;
    return data;
  },

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const { data, error } = await apiClient.login(email, password);
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await apiClient.logout();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    if (!email) {
      throw new Error("Email is required");
    }

    const { error } = await apiClient.resetPassword(email);
    if (error) throw error;
  }
};
