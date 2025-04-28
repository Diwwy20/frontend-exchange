import { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBalances } from "@/services/wallet";
import images from "@/constants/images";
import { useAuth } from "@/context/AuthContext";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    accessToken,
  } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (accessToken) {
      queryClient.invalidateQueries({ queryKey: ["walletBalances"] });
    }
  }, [accessToken, queryClient]);

  const {
    data: balances = {
      BTC: 0,
      ETH: 0,
      XRP: 0,
      DOGE: 0,
    },
    isLoading: balancesLoading,
    refetch: refetchBalances,
    error,
  } = useQuery({
    queryKey: ["walletBalances", user?.id || user?.email],
    queryFn: getAllBalances,
    enabled: isAuthenticated && !authLoading && !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const currencies = [
    {
      value: "BTC",
      label: "Bitcoin",
      icon: images.bitcoin,
    },
    {
      value: "ETH",
      label: "Ethereum",
      icon: images.ethereum,
    },
    {
      value: "XRP",
      label: "Ripple",
      icon: images.ripple,
    },
    {
      value: "DOGE",
      label: "Dogecoin",
      icon: images.dogecoin,
    },
  ];

  const value = {
    balances,
    currencies,
    refetchBalances,
    isLoading: balancesLoading,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
