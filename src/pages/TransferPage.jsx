import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useWallet } from "@/context/WalletContext";
import { createTransaction } from "@/services/transactions";
import { findUserByEmail as findUserApi } from "@/services/users";
import { formatCryptoAmount } from "@/constants/currency";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const TransferPage = () => {
  const { balances, currencies } = useWallet();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("internal");
  const [verifying, setVerifying] = useState(false);

  const [transferForm, setTransferForm] = useState({
    receiverId: "",
    receiverEmail: "",
    amount: "",
    currency: "BTC",
    externalAddress: "",
  });

  const handleTabChange = (value) => {
    setActiveTab(value);
    setTransferForm((prev) => ({
      ...prev,
      receiverId: "",
      receiverEmail: "",
      externalAddress: "",
      amount: "",
    }));
  };

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
      toast.success(`Transfer completed successfully!`);
      setTransferForm((prev) => ({
        ...prev,
        receiverId: "",
        receiverEmail: "",
        externalAddress: "",
        amount: "",
      }));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete transfer");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    if (
      parseFloat(transferForm.amount) > (balances[transferForm.currency] || 0)
    ) {
      return toast.error("Insufficient balance");
    }

    if (activeTab === "internal" && !transferForm.receiverId) {
      return toast.error("Please verify receiver email first");
    }

    if (activeTab === "external" && !transferForm.externalAddress) {
      return toast.error("Please enter external wallet address");
    }

    const transactionData = {
      amount: parseFloat(transferForm.amount),
      currency: transferForm.currency,
      receiverId:
        activeTab === "internal" ? parseInt(transferForm.receiverId) : null,
      externalAddress:
        activeTab === "external" ? transferForm.externalAddress : null,
      isExternal: activeTab === "external",
    };

    createTransactionMutation.mutate(transactionData);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const findUserByEmail = async (email) => {
    if (!isValidEmail(email)) return;
    setVerifying(true);
    try {
      const user = await findUserApi(email);
      setTransferForm((prev) => ({
        ...prev,
        receiverId: user.id.toString(),
      }));
      toast.success(`User found: ${user.email}`);
    } catch (error) {
      toast.error(error.message || "User not found");
      setTransferForm((prev) => ({
        ...prev,
        receiverId: "",
      }));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transfer Crypto</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Available Balance */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Available Balance</h2>
            <div className="space-y-4">
              {currencies.map((currency) => (
                <div key={currency.value} className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <img
                      src={currency.icon}
                      alt={currency.label}
                      className="w-6 h-6 mr-2"
                    />
                    <h3 className="font-medium">{currency.label}</h3>
                  </div>
                  <p className="text-xl font-bold">
                    {formatCryptoAmount(
                      balances[currency.value],
                      currency.value
                    )}{" "}
                    {currency.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transfer Form */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="internal">Internal Transfer</TabsTrigger>
                <TabsTrigger value="external">External Transfer</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Currency Select */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Currency
                  </label>
                  <Select
                    value={transferForm.currency}
                    onValueChange={(value) =>
                      setTransferForm((prev) => ({
                        ...prev,
                        currency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) =>
                      setTransferForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    step="0.00000001"
                    min="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available:{" "}
                    {formatCryptoAmount(
                      balances[transferForm.currency],
                      transferForm.currency
                    )}{" "}
                    {transferForm.currency}
                  </p>
                </div>

                {/* Conditional Fields */}
                <TabsContent value="internal">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Receiver Email
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={transferForm.receiverEmail}
                        onChange={(e) =>
                          setTransferForm((prev) => ({
                            ...prev,
                            receiverEmail: e.target.value,
                            receiverId: "",
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          findUserByEmail(transferForm.receiverEmail)
                        }
                        disabled={
                          !isValidEmail(transferForm.receiverEmail) || verifying
                        }
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    {transferForm.receiverId && (
                      <p className="text-sm text-green-600 mt-1">
                        Receiver verified: {transferForm.receiverEmail}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="external">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      External Wallet Address
                    </label>
                    <Input
                      type="text"
                      placeholder={`${transferForm.currency} Wallet Address`}
                      value={transferForm.externalAddress}
                      onChange={(e) =>
                        setTransferForm((prev) => ({
                          ...prev,
                          externalAddress: e.target.value,
                        }))
                      }
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Make sure the address is correct. Transfers cannot be
                      undone.
                    </p>
                  </div>
                </TabsContent>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createTransactionMutation.isPending ||
                    !transferForm.amount ||
                    (activeTab === "internal" && !transferForm.receiverId) ||
                    (activeTab === "external" && !transferForm.externalAddress)
                  }
                >
                  {createTransactionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Send Transfer"
                  )}
                </Button>
              </form>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
