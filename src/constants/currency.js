export const CRYPTO_CURRENCIES = [
  { value: "BTC", label: "Bitcoin", icon: "/icons/btc.svg" },
  { value: "ETH", label: "Ethereum", icon: "/icons/eth.svg" },
  { value: "XRP", label: "Ripple", icon: "/icons/xrp.svg" },
  { value: "DOGE", label: "Dogecoin", icon: "/icons/doge.svg" },
];

export const FIAT_CURRENCIES = [
  { value: "THB", label: "Thai Baht", symbol: "฿ " },
  { value: "USD", label: "US Dollar", symbol: "$ " },
];

// Format currency with proper symbol and decimals
export const formatCurrency = (amount, currency) => {
  const currencyInfo = FIAT_CURRENCIES.find(c => c.value === currency);
  const symbol = currencyInfo ? currencyInfo.symbol : '';
  
  return `${symbol}${parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Format crypto amount with proper decimals
export const formatCryptoAmount = (amount, currency) => {
  const decimals = currency === 'BTC' ? 8 : 6;
  return parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};