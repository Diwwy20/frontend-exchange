import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/setting/apiInstance";
import { refreshAccessToken, logout as logoutApi } from "@/services/users";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchUserProfile = async (token) => {
    try {
      const { data } = await api.get("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const newAccessToken = await refreshAccessToken();
        setAccessToken(newAccessToken);

        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        await fetchUserProfile(newAccessToken);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isRefreshing &&
          accessToken
        ) {
          originalRequest._retry = true;
          setIsRefreshing(true);

          try {
            const newAccessToken = await refreshAccessToken();
            setAccessToken(newAccessToken);

            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            setIsRefreshing(false);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            setIsRefreshing(false);
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, isLoading]);

  const login = async (userData, token) => {
    setAccessToken(token);

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      if (userData && Object.keys(userData).length > 0) {
        setUser(userData);

        await fetchUserProfile(token);
      } else {
        await fetchUserProfile(token);
      }
    } catch (error) {
      // console.error("Error setting up user after login:", error);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      // console.error("Logout error:", error);
    } finally {
      queryClient.clear();

      setUser(null);
      setAccessToken(null);

      delete api.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    isAuthenticated: !!accessToken,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
