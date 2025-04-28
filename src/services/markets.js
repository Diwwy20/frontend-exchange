import api from "./setting/apiInstance";

export const getMarketData = async (currency) => {
  const { data } = await api.get(`/api/market/${currency}`);
  return data.marketData;
};

export const getBuyOrders = async (currency) => {
  const { data } = await api.get(`/api/market/${currency}/buy`);
  return data.orders;
};

export const getSellOrders = async (currency) => {
  const { data } = await api.get(`/api/market/${currency}/sell`);
  return data.orders;
};