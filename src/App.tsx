import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { toast } from "sonner";
import { HomePage } from "./components/HomePage";
import { ProductPage } from "./components/ProductPage";
import { AdminPanel } from "./components/AdminPanel";
import { OrdersPage } from "./components/OrdersPage";
import { AdminInitializer } from "./components/AdminInitializer";
import { CartSidebar } from "./components/CartSidebar";

type Page = "home" | "product" | "cart" | "admin" | "orders";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        setIsCartOpen={setIsCartOpen}
      />
      <main className="container mx-auto px-4 py-8">
        <Content 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedProductId={selectedProductId}
          setSelectedProductId={setSelectedProductId}
          addToCart={addToCart}
        />
      </main>
      
      <CartSidebar
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        cart={cart}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        clearCart={clearCart}
        setCurrentPage={setCurrentPage}
      />
      
      <Toaster theme="dark" />
    </div>
  );
}

function Header({ 
  currentPage, 
  setCurrentPage, 
  cartItemCount,
  setIsCartOpen
}: { 
  currentPage: Page; 
  setCurrentPage: (page: Page) => void;
  cartItemCount: number;
  setIsCartOpen: (open: boolean) => void;
}) {
  const userRole = useQuery(api.users.getUserRole);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 
            className="text-2xl font-bold cursor-pointer hover:text-gray-300"
            onClick={() => setCurrentPage("home")}
          >
            Lumahub
          </h1>
          <Authenticated>
            <nav className="flex space-x-6">
              <button
                onClick={() => setCurrentPage("home")}
                className={`hover:text-gray-300 ${currentPage === "home" ? "text-blue-400" : ""}`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage("orders")}
                className={`hover:text-gray-300 ${currentPage === "orders" ? "text-blue-400" : ""}`}
              >
                My Orders
              </button>
              {userRole === "admin" && (
                <button
                  onClick={() => setCurrentPage("admin")}
                  className={`hover:text-gray-300 ${currentPage === "admin" ? "text-blue-400" : ""}`}
                >
                  Admin
                </button>
              )}
            </nav>
          </Authenticated>
        </div>
        
        <div className="flex items-center space-x-4">
          <Authenticated>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-gray-300"
            >
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </Authenticated>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

function Content({ 
  currentPage, 
  setCurrentPage, 
  selectedProductId, 
  setSelectedProductId,
  addToCart
}: {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  addToCart: (productId: string, quantity?: number) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Unauthenticated>
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold mb-8">Welcome to Lumahub</h1>
          <p className="text-xl text-gray-400 mb-8">Sign in to start shopping</p>
          <div className="max-w-md mx-auto">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <AdminInitializer />
        {currentPage === "home" && (
          <HomePage 
            setCurrentPage={setCurrentPage}
            setSelectedProductId={setSelectedProductId}
            addToCart={addToCart}
          />
        )}
        {currentPage === "product" && selectedProductId && (
          <ProductPage 
            productId={selectedProductId}
            setCurrentPage={setCurrentPage}
            addToCart={addToCart}
          />
        )}
        {currentPage === "admin" && <AdminPanel />}
        {currentPage === "orders" && <OrdersPage />}
      </Authenticated>
    </div>
  );
}
