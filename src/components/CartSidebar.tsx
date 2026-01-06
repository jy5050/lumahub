import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

type Page = "home" | "product" | "cart" | "admin" | "orders";

interface CartSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cart: Array<{ productId: string; quantity: number }>;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrentPage: (page: Page) => void;
}

export function CartSidebar({ 
  isOpen,
  setIsOpen,
  cart, 
  removeFromCart, 
  updateCartQuantity, 
  clearCart,
  setCurrentPage 
}: CartSidebarProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const createOrder = useMutation(api.orders.createOrder);

  // Get all products at once instead of calling useQuery in a loop
  const allProducts = useQuery(api.products.listProducts);

  // Create cart with products by matching IDs
  const cartWithProducts = cart.map(item => {
    const product = allProducts?.find(p => p._id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  const total = cartWithProducts.reduce((sum, item) => {
    return sum + (item.product!.price * item.quantity);
  }, 0);

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    try {
      await createOrder({
        items: cart.map(item => ({
          productId: item.productId as any,
          quantity: item.quantity,
        })),
        shippingAddress,
      });
      
      clearCart();
      setShippingAddress("");
      toast.success("Order placed successfully!");
      setIsOpen(false);
      setCurrentPage("orders");
    } catch (error) {
      toast.error("Failed to place order: " + (error as Error).message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Show loading state while products are being fetched
  if (allProducts === undefined) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Loading */}
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-4">Your cart is empty</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setCurrentPage("home");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartWithProducts.map((item) => (
                    <div key={item.productId} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        {item.product!.imageUrl && (
                          <img 
                            src={item.product!.imageUrl} 
                            alt={item.product!.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.product!.name}</h3>
                          <p className="text-gray-400 text-sm">${item.product!.price}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded flex items-center justify-center text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.product!.stock}
                                className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white w-6 h-6 rounded flex items-center justify-center text-sm"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Shipping Address</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your full shipping address..."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm"
                    rows={3}
                  />
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !shippingAddress.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  {isCheckingOut ? "Processing..." : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
