import { Link } from "react-router-dom";
import { X, Home, TrendingUp, Wallet, RefreshCcw, List } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform transition duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:w-auto lg:hidden`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            CryptoExchange
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-4 py-5">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-300 font-medium text-lg">
                {user?.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.email}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>

            <Link
              to="/market"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Market
            </Link>

            <Link
              to="/wallet"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Wallet className="mr-3 h-5 w-5" />
              Wallet
            </Link>

            <Link
              to="/transfer"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <RefreshCcw className="mr-3 h-5 w-5" />
              Transfer
            </Link>

            <Link
              to="/orders"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <List className="mr-3 h-5 w-5" />
              Orders
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
