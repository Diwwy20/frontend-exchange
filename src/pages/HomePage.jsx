import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { formatCryptoAmount } from "@/constants/currency";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const { balances, isLoading, currencies } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.email}</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Wallet</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currencies.map((currency) => (
              <Card key={currency.value} className="p-4">
                <div className="flex items-center mb-2">
                  <img
                    src={currency.icon}
                    alt={currency.label}
                    className="w-8 h-8 mr-2"
                  />
                  <h3 className="text-lg font-medium">{currency.label}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {formatCryptoAmount(balances[currency.value], currency.value)}{" "}
                  {currency.value}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/market">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Buy & Sell</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Trade cryptocurrencies with other users using fiat currencies
            </p>
          </Card>
        </Link>

        <Link to="/transfer">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Transfer</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Send cryptocurrency to other users or external wallets
            </p>
          </Card>
        </Link>

        <Link to="/orders">
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">My Orders</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your active buy and sell orders
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
