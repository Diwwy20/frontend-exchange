import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner fixed bottom-0 w-full">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} CryptoExchange. All rights reserved.
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>By Diw Sirawit Developer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
