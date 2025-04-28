import api from "./setting/apiInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await api.get("/api/auth/profile");
      return data.user;
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post('/api/auth/login', { email, password });
      return data;
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post('/api/auth/register', { email, password });
      return data;
    },
  });
};

export const login = async ({ email, password }) => {
    try {
        const { data } = await api.post('/api/auth/login', { email, password });
        return data;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error(error.message);
    }
};

export const signup = async ({ email, password }) => {
    try {
        const { data } = await api.post('/api/auth/register', { email, password });
        return data;
    } catch (error) {
        if (error.response && error.response.data.message) 
            throw new Error(error.response.data.message);
        throw new Error(error.message);
    }
};

export const getUserProfile = async () => {
    try {
        const { data } = await api.get('/api/auth/profile');
        return data.user;
    } catch (error) {
        if (error.response && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error(error.message);
    }
};

export const refreshAccessToken = async () => {
    try {
        const { data } = await api.post('/api/auth/refresh-token');
        return data.accessToken;
    } catch (error) {
        if (error.response && error.response.data.message) 
            throw new Error(error.response.data.message);
        throw new Error(error.message || "Error refreshing token");
    }
};

export const logout = async () => {
    try {
        const { data } = await api.post('/api/auth/logout');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Logout failed");
    }
};

export const findUserByEmail = async (email) => {
  try {
    const { data } = await api.get("/api/auth/find-by-email", { params: { email } });
    return data.user;
  } catch (error) {
    if (error.response && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message);
  }
};