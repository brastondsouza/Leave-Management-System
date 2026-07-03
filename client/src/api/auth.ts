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

  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/auth/users");

    return response.data.users;
  },

  updateUser: async (id: string, data: any): Promise<User> => {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data.user;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};