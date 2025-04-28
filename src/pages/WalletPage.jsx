import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useWallet } from "@/context/WalletContext";
import { getUserTransactions } from "@/services/transactions";
import { createWallet } from "@/services/wallet";
import { formatCryptoAmount, formatCurrency } from "@/constants/currency";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import images from "@/constants/images";

const WalletPage = () => {
  const { balances, currencies, prices, refetchBalances } = useWallet();
  const [activeTab, setActiveTab] = useState("assets");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["userTransactions"],
    queryFn: getUserTransactions,
  });

  const allTransactions = transactions
    ? [...(transactions.sent || []), ...(transactions.received || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    : [];

  const handleCreateWallet = async () => {
    if (!selectedCurrency) {
      toast.error("Please select a currency");
      return;
    }

    try {
      await createWallet({ currency: selectedCurrency });
      toast.success("Wallet created successfully");
      refetchBalances();
      setSelectedCurrency("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to create wallet");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wallet</h1>
      </div>

      {/* Tabs: Assets / Transactions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Tab: Assets */}
        <TabsContent value="assets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currencies.map((currency) => (
              <Card key={currency.value} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={currency.icon}
                    alt={currency.label}
                    className="w-10 h-10 mr-3"
                  />
                  <h3 className="text-xl font-medium">{currency.label}</h3>
                </div>
                <p className="text-2xl font-bold mb-2">
                  {formatCryptoAmount(
                    balances?.[currency.value] || 0,
                    currency.value
                  )}{" "}
                  {currency.value}
                </p>
                <p className="text-sm text-gray-500">
                  ≈{" "}
                  {formatCurrency(
                    (balances?.[currency.value] || 0) *
                      (prices?.[currency.value] || 0),
                    "USD"
                  )}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Transactions */}
        <TabsContent value="transactions">
          <Card className="overflow-hidden">
            {isTransactionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : allTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {allTransactions.map((tx) => {
                      const isSent = transactions.sent?.some(
                        (t) => t.id === tx.id
                      );
                      return (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isSent
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}
                            >
                              {isSent ? "Sent" : "Received"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={
                                  tx.currency === "BTC"
                                    ? images.bitcoin
                                    : tx.currency === "ETH"
                                    ? images.ethereum
                                    : tx.currency === "XRP"
                                    ? images.ripple
                                    : images.dogecoin
                                }
                                alt={tx.currency}
                                className="w-5 h-5 mr-2"
                              />
                              {tx.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCryptoAmount(tx.amount, tx.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.isExternal ? (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                External
                              </span>
                            ) : (
                              <span>
                                {isSent ? "To: " : "From: "}
                                {isSent
                                  ? tx.receiver?.email || "External"
                                  : tx.sender?.email}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
