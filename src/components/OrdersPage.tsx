import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function OrdersPage() {
  const orders = useQuery(api.orders.getUserOrders);
  const cancelOrder = useMutation(api.orders.cancelOrder);

  const handleCancelOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder({ orderId: orderId as any });
        toast.success("Order cancelled successfully");
      } catch (error) {
        toast.error("Failed to cancel order: " + (error as Error).message);
      }
    }
  };

  if (orders === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-xl mb-4">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-gray-400">
                    Placed on {new Date(order._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-sm ${
                    order.status === "pending" ? "bg-yellow-600" :
                    order.status === "completed" ? "bg-green-600" :
                    "bg-red-600"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-xl font-bold mt-2">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700 rounded p-3">
                      <div>
                        <span className="text-sm text-gray-400">Product ID: {item.productId}</span>
                      </div>
                      <div className="text-right">
                        <p>Quantity: {item.quantity}</p>
                        <p>${item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-1">Shipping Address:</h4>
                <p className="text-gray-400 bg-gray-700 rounded p-3">{order.shippingAddress}</p>
              </div>

              {order.status === "pending" && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
