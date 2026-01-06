import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface CartPageProps {
  cart: Array<{ productId: string; quantity: number }>;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCurrentPage: (page: "home" | "product" | "cart" | "admin" | "orders") => void;
}

export function CartPage({ 
  cart, 
  removeFromCart, 
  updateCartQuantity, 
  clearCart,
  setCurrentPage 
}: CartPageProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const createOrder = useMutation(api.orders.createOrder);

  // Get product details for cart items
  const cartWithProducts = cart.map(item => {
    const product = useQuery(api.products.getProduct, { productId: item.productId as any });
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
      setCurrentPage("orders");
    } catch (error) {
      toast.error("Failed to place order: " + (error as Error).message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-8">Add some products to get started</p>
        <button
          onClick={() => setCurrentPage("home")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartWithProducts.map((item) => (
              <div key={item.productId} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-4">
                  {item.product!.imageUrl && (
                    <img 
                      src={item.product!.imageUrl} 
                      alt={item.product!.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.product!.name}</h3>
                    <p className="text-gray-400">${item.product!.price} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product!.stock}
                      className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white w-8 h-8 rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${(item.product!.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr className="border-gray-700" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Shipping Address</label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut || !shippingAddress.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            {isCheckingOut ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
