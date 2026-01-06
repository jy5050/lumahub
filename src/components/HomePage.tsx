import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type Page = "home" | "product" | "cart" | "admin" | "orders";

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
  setSelectedProductId: (id: string) => void;
  addToCart: (productId: string, quantity?: number) => void;
}

export function HomePage({ setCurrentPage, setSelectedProductId, addToCart }: HomePageProps) {
  const products = useQuery(api.products.listProducts);

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage("product");
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
    toast.success("Added to cart!");
  };

  if (products === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Products</h1>
        <p className="text-gray-400">Discover our amazing collection</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-xl">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-400">${product.price}</span>
                  <span className="text-sm text-gray-400">Stock: {product.stock}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProduct(product._id)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
