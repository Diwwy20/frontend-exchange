import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { getAllOrders, createOrder } from "@/services/orders";
import { tradeCrypto } from "@/services/transactions";
import { getMarketData } from "@/services/markets";
import { formatCryptoAmount, formatCurrency } from "@/constants/currency";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const MarketPage = () => {
  const { user } = useAuth();
  const { balances, currencies } = useWallet();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("buy");

  const [orderFilters, setOrderFilters] = useState({
    type: "SELL",
    currency: "BTC",
    fiat: "THB",
    status: "ACTIVE",
  });

  const [sellForm, setSellForm] = useState({
    currency: "BTC",
    amount: "",
    pricePerCoin: "",
    fiat: "THB",
  });
  const [buyForm, setBuyForm] = useState({
    currency: "BTC",
    amount: "",
    pricePerCoin: "",
    fiat: "THB",
  });
  const [tradeForm, setTradeForm] = useState({ orderId: null, amount: "" });

  useEffect(() => {
    setOrderFilters((prev) => ({
      ...prev,
      type: activeTab === "buy" ? "SELL" : "BUY",
    }));
  }, [activeTab]);

  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["allOrders", orderFilters],
    queryFn: () => getAllOrders(orderFilters),
  });

  const { data: marketData, isLoading: isMarketLoading } = useQuery({
    queryKey: ["marketData", orderFilters.currency],
    queryFn: () => getMarketData(orderFilters.currency),
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      toast.success("Order created successfully");
      setBuyForm((prev) => ({ ...prev, amount: "", pricePerCoin: "" }));
      setSellForm((prev) => ({ ...prev, amount: "", pricePerCoin: "" }));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create order");
    },
  });

  const tradeCryptoMutation = useMutation({
    mutationFn: tradeCrypto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalances"] }); // Add this line to refresh balances
      toast.success("Trade completed successfully");
      setTradeForm({ orderId: null, amount: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete trade");
    },
  });

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const form = activeTab === "buy" ? buyForm : sellForm;

    if (!form.amount || !form.pricePerCoin) {
      return toast.error("Please fill all required fields");
    }

    const numAmount = parseFloat(form.amount);
    const numPrice = parseFloat(form.pricePerCoin);

    if (
      isNaN(numAmount) ||
      isNaN(numPrice) ||
      numAmount <= 0 ||
      numPrice <= 0
    ) {
      return toast.error("Invalid amount or price");
    }

    createOrderMutation.mutate({
      type: activeTab.toUpperCase(),
      currency: form.currency,
      amount: numAmount,
      pricePerCoin: numPrice,
      fiat: form.fiat,
    });
  };

  const handleTrade = (orderId) => {
    if (!tradeForm.amount) {
      return toast.error("Please enter amount to trade");
    }

    const selectedOrder = orders?.find(
      (o) => o.id === (tradeForm.orderId || orderId)
    );
    if (!selectedOrder) return toast.error("Order not found");
    if (parseFloat(tradeForm.amount) > selectedOrder.amount)
      return toast.error("Exceeds available amount");

    tradeCryptoMutation.mutate({
      orderId: tradeForm.orderId || orderId,
      amount: parseFloat(tradeForm.amount),
    });
  };

  const handleCurrencyChange = (currency, type) => {
    if (type === "buy") setBuyForm((prev) => ({ ...prev, currency }));
    else setSellForm((prev) => ({ ...prev, currency }));
    setOrderFilters((prev) => ({ ...prev, currency }));
  };

  const handleFiatChange = (fiat, type) => {
    if (type === "buy") setBuyForm((prev) => ({ ...prev, fiat }));
    else setSellForm((prev) => ({ ...prev, fiat }));
    setOrderFilters((prev) => ({ ...prev, fiat }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crypto Market</h1>

      {isMarketLoading ? (
        <div className="mb-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      ) : marketData ? (
        <div className="mb-8 space-y-2 text-center">
          <p>
            Highest Buy: {formatCurrency(marketData?.highestBuy ?? 0, "XX")}
          </p>
          <p>
            Lowest Sell: {formatCurrency(marketData?.lowestSell ?? 0, "XX")}
          </p>
          <p>Spread: {formatCurrency(marketData?.spread ?? 0, "XX")}</p>
        </div>
      ) : null}

      {/* Create Order Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <Tabs
              defaultValue="buy"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value="buy">
                {renderCreateOrderForm(buyForm, "buy")}
              </TabsContent>
              <TabsContent value="sell">
                {renderCreateOrderForm(sellForm, "sell")}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Order Book Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {activeTab === "buy" ? "Sell" : "Buy"} Orders
            </h2>

            {isOrdersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">{renderOrderTable()}</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  function renderCreateOrderForm(formState, type) {
    return (
      <form onSubmit={handleCreateOrder}>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Currency</label>
            <Select
              value={formState.currency}
              onValueChange={(value) => handleCurrencyChange(value, type)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.00000001"
              min="0"
              value={formState.amount}
              onChange={(e) =>
                type === "buy"
                  ? setBuyForm({ ...buyForm, amount: e.target.value })
                  : setSellForm({ ...sellForm, amount: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1">Price per coin</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formState.pricePerCoin}
              onChange={(e) =>
                type === "buy"
                  ? setBuyForm({ ...buyForm, pricePerCoin: e.target.value })
                  : setSellForm({ ...sellForm, pricePerCoin: e.target.value })
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Placing...
              </>
            ) : (
              `Place ${type === "buy" ? "Buy" : "Sell"} Order`
            )}
          </Button>
        </div>
      </form>
    );
  }

  function renderOrderTable() {
    return (
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Available</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 text-center">
                {order.user ? order.user.email : "Unknown"}
              </td>
              <td className="px-4 py-3 text-center">
                {formatCurrency(order.pricePerCoin, order.fiat)}
                {/* {order.currency} */}
              </td>
              <td className="px-4 py-3 text-center">
                {formatCryptoAmount(order.amount, order.currency)}{" "}
                {order.currency}
              </td>
              <td className="px-4 py-3 text-right">
                {order.userId !== user.id ? (
                  <>
                    {tradeForm?.orderId === order.id ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          step="0.00000001"
                          min="0"
                          max={order.amount}
                          value={tradeForm.amount}
                          onChange={(e) =>
                            setTradeForm({
                              ...tradeForm,
                              amount: e.target.value,
                            })
                          }
                          className="w-24"
                        />
                        <Button size="sm" onClick={() => handleTrade(order.id)}>
                          Confirm
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          setTradeForm({
                            orderId: order.id,
                            amount: order.amount.toString(),
                          })
                        }
                      >
                        {activeTab === "buy" ? "Buy" : "Sell"}
                      </Button>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
};

export default MarketPage;
