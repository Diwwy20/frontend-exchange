import api from "./setting/apiInstance";

export const getUserWallets = async () => {
  const { data } = await api.get("/api/wallets");
  return data.wallets;
};

export const getWalletByCurrency = async (currency) => {
  const { data } = await api.get(`/api/wallets/${currency}`);
  return data.wallet;
};

export const createWallet = async (currencyData) => {
  const { data } = await api.post("/api/wallets", currencyData);
  return data.wallet;
};

export const updateWalletBalance = async (balanceData) => {
  const { data } = await api.put("/api/wallets/balance", balanceData);
  return data.wallet;
};

export const transferFunds = async (transferData) => {
  const { data } = await api.post("/api/wallets/transfer", transferData);
  return data.transaction;
};


export const getAllBalances = async () => {
  try {
    const wallets = await getUserWallets();

    const balances = wallets.reduce((acc, wallet) => {
      acc[wallet.currency] = wallet.balance;
      return acc;
    }, {});
    
    const supportedCurrencies = ["BTC", "ETH", "XRP", "DOGE"];
    supportedCurrencies.forEach(currency => {
      if (balances[currency] === undefined) {
        balances[currency] = 0;
      }
    });

    return balances;
  } catch (error) {
    return { BTC: 0, ETH: 0, XRP: 0, DOGE: 0 };
  }
};