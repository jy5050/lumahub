import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

type Page = "home" | "product" | "cart" | "admin" | "orders";

interface ProductPageProps {
  productId: string;
  setCurrentPage: (page: Page) => void;
  addToCart: (productId: string, quantity: number) => void;
}

export function ProductPage({ productId, setCurrentPage, addToCart }: ProductPageProps) {
  const product = useQuery(api.products.getProduct, { productId: productId as any });
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product && quantity > 0 && quantity <= product.stock) {
      addToCart(productId, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    }
  };

  if (product === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button
          onClick={() => setCurrentPage("home")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setCurrentPage("home")}
        className="mb-6 text-blue-400 hover:text-blue-300 flex items-center"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-400 mb-6 text-lg leading-relaxed">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-3xl font-bold text-blue-400">${product.price}</span>
          </div>

          <div className="mb-6">
            <span className="text-sm text-gray-400">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
