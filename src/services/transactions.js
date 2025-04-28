import api from "./setting/apiInstance";

export const createTransaction = async (transactionData) => {
  const { data } = await api.post("/api/transactions", transactionData);
  return data.transaction;
};

export const getUserTransactions = async () => {
  const { data } = await api.get("/api/transactions");
  return {
    sent: data.sentTransactions,
    received: data.receivedTransactions,
  };
};

export const getTransactionById = async (id) => {
  const { data } = await api.get(`/api/transactions/${id}`);
  return data.transaction;
};

export const tradeCrypto = async (tradeData) => {
  const { data } = await api.post("/api/transactions/trade", tradeData);
  return data;
};