import api from "./setting/apiInstance";

export const createOrder = async (orderData) => {
  const { data } = await api.post("/api/orders", orderData);
  return data;
};

export const getAllOrders = async (filters = {}) => {
  const { data } = await api.get("/api/orders", {
    params: filters,
  });
  return data.orders;
};

export const getUserOrders = async () => {
  const { data } = await api.get("/api/orders/user");
  return data.orders;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/api/orders/${id}/status`, { status });
  return data.order;
};

export const cancelOrder = async (id) => {
  const { data } = await api.put(`/api/orders/${id}/cancel`);
  return data.order;
};