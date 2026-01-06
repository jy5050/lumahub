import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function AdminInitializer() {
  const userRole = useQuery(api.users.getUserRole);
  const initializeAdmin = useMutation(api.users.initializeAdminUser);
  const [isInitializing, setIsInitializing] = useState(false);

  // Only show if user has no role assigned (getUserRole returns "customer" by default, so check for null specifically)
  if (userRole === undefined || userRole === "admin") {
    return null;
  }

  // Check if this is truly a new user by seeing if they have any role at all
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  // Show admin initializer only if user exists but has default customer role
  // This suggests they might be the first user
  if (!loggedInUser) {
    return null;
  }

  const handleInitializeAdmin = async () => {
    setIsInitializing(true);
    try {
      await initializeAdmin({});
      toast.success("You are now an admin! The page will refresh to show admin features.");
      // Force a page refresh to update the UI
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("Admin already exists")) {
        toast.info("An admin already exists for this store.");
      } else {
        toast.error("Failed to initialize admin: " + errorMessage);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-2">First Time Setup</h3>
      <p className="text-blue-200 mb-4">
        Welcome to Lumahub! It looks like this is a new store. Click below to become the first admin and start adding products.
      </p>
      <button
        onClick={handleInitializeAdmin}
        disabled={isInitializing}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
      >
        {isInitializing ? "Setting up..." : "Become Admin"}
      </button>
    </div>
  );
}
