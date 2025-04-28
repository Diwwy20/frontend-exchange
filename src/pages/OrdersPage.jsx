import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserOrders, createOrder, cancelOrder } from "@/services/orders";
import { useWallet } from "@/context/WalletContext";
import {
  CRYPTO_CURRENCIES,
  FIAT_CURRENCIES,
  formatCryptoAmount,
  formatCurrency,
} from "@/constants/currency";
import { toast } from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const { balances } = useWallet();
  const [activeTab, setActiveTab] = useState("active");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const [orderType, setOrderType] = useState("BUY");
  const [currency, setCurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [fiat, setFiat] = useState("THB");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: getUserOrders,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Order created successfully");
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      setOrderDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create order");
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });

  const resetForm = () => {
    setOrderType("BUY");
    setCurrency("BTC");
    setAmount("");
    setPrice("");
    setFiat("THB");
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!amount || !price) {
      toast.error("Please fill all fields");
      return;
    }

    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(price);

    if (
      isNaN(numAmount) ||
      isNaN(numPrice) ||
      numAmount <= 0 ||
      numPrice <= 0
    ) {
      toast.error("Invalid amount or price");
      return;
    }

    if (orderType === "SELL" && (balances[currency] || 0) < numAmount) {
      toast.error(`Insufficient ${currency} balance`);
      return;
    }

    createOrderMutation.mutate({
      type: orderType,
      currency,
      amount: numAmount,
      pricePerCoin: numPrice,
      fiat,
    });
  };

  const handleCancelOrder = (orderId) => {
    cancelOrderMutation.mutate(orderId);
  };

  const filteredOrders =
    orders?.filter((order) => {
      if (activeTab === "active") return order.status === "ACTIVE";
      if (activeTab === "completed") return order.status === "COMPLETED";
      if (activeTab === "cancelled") return order.status === "CANCELLED";
      return true;
    }) || [];

  const calculateTotal = () => {
    if (!amount || !price) return 0;
    return parseFloat(amount) * parseFloat(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Order</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Order</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateOrder} className="space-y-4 pt-4">
              {/* Order Type & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger id="orderType">
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Cryptocurrency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CRYPTO_CURRENCIES.map((crypto) => (
                        <SelectItem key={crypto.value} value={crypto.value}>
                          {crypto.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter ${currency} amount`}
                  required
                />
                {orderType === "SELL" && (
                  <p className="text-sm text-gray-500">
                    Available:{" "}
                    {formatCryptoAmount(balances[currency] || 0, currency)}{" "}
                    {currency}
                  </p>
                )}
              </div>

              {/* Price & Fiat */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Coin</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiat">Fiat Currency</Label>
                  <Select value={fiat} onValueChange={setFiat}>
                    <SelectTrigger id="fiat">
                      <SelectValue placeholder="Select fiat" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIAT_CURRENCIES.map((fiatCurrency) => (
                        <SelectItem
                          key={fiatCurrency.value}
                          value={fiatCurrency.value}
                        >
                          {fiatCurrency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Total */}
              <div className="pt-2 pb-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium">
                    {formatCurrency(calculateTotal(), fiat)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending
                    ? "Creating..."
                    : "Create Order"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="active"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Orders</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No {activeTab} orders found
              </div>
            ) : (
              <div className="overflow-x-auto">{renderOrderTable()}</div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderOrderTable() {
    return (
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Currency</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Price Per Coin</th>
            <th className="px-6 py-3">Total</th>
            <th className="px-6 py-3">Created At</th>
            {activeTab === "active" && <th className="px-6 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 text-center">{order.type}</td>
              <td className="px-6 py-4 text-center">{order.currency}</td>
              <td className="px-6 py-4 text-center">
                {formatCryptoAmount(order.amount, order.currency)}
              </td>
              <td className="px-6 py-4 text-center">
                {formatCurrency(order.pricePerCoin, order.fiat)}
              </td>
              <td className="px-6 py-4 text-center">
                {formatCurrency(order.amount * order.pricePerCoin, order.fiat)}
              </td>
              <td className="px-6 py-4 text-center">
                {new Date(order.createdAt).toLocaleString()}
              </td>
              {activeTab === "active" && (
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancelOrderMutation.isPending}
                  >
                    Cancel
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
};

export default OrdersPage;
