import api from "./axios";
import type { LoginResponse, User } from "./types";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile");

    return response.data.user;
  },
};