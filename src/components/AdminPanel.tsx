import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const userRole = useQuery(api.users.getUserRole);

  if (userRole !== "admin") {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="mb-8">
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-2 px-4 font-medium ${
              activeTab === "products" 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-4 font-medium ${
              activeTab === "orders" 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {activeTab === "products" && <ProductsTab />}
      {activeTab === "orders" && <OrdersTab />}
    </div>
  );
}

function ProductsTab() {
  const products = useQuery(api.products.getAllProducts);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          {showAddForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showAddForm && <AddProductForm onSuccess={() => setShowAddForm(false)} />}

      {products === undefined ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductRow key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    stock: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addProduct = useMutation(api.products.addProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl || undefined,
        stock: parseInt(formData.stock),
      });
      
      setFormData({ name: "", description: "", price: "", imageUrl: "", stock: "" });
      toast.success("Product added successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add product: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            rows={3}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductRow({ product }: { product: any }) {
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const handleToggleActive = async () => {
    try {
      await updateProduct({
        productId: product._id,
        isActive: !product.isActive,
      });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ productId: product._id });
        toast.success("Product deleted");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-400 text-sm mb-2">{product.description}</p>
          <div className="flex space-x-4 text-sm">
            <span>Price: ${product.price}</span>
            <span>Stock: {product.stock}</span>
            <span className={product.isActive ? "text-green-400" : "text-red-400"}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleActive}
            className={`py-1 px-3 rounded text-sm ${
              product.isActive 
                ? "bg-yellow-600 hover:bg-yellow-700" 
                : "bg-green-600 hover:bg-green-700"
            } text-white transition-colors`}
          >
            {product.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const orders = useQuery(api.orders.getAllOrders);

  if (orders === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">All Orders</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-400">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-gray-400">Customer: {order.customerEmail}</p>
                  <p className="text-gray-400">Total: ${order.total}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  order.status === "pending" ? "bg-yellow-600" :
                  order.status === "completed" ? "bg-green-600" :
                  "bg-red-600"
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-400">
                      Product ID: {item.productId} - Quantity: {item.quantity} - Price: ${item.price}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Shipping Address:</h4>
                <p className="text-sm text-gray-400">{order.shippingAddress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
