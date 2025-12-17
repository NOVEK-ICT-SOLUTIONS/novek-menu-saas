import { AlertCircle, ArrowLeft, Loader2, QrCode } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useRestaurantDetail } from "../hooks/useRestaurants";

const AdminRestaurantDetailPage = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();

  const { data: restaurant, isLoading, isError, error } = useRestaurantDetail(restaurantId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "This restaurant does not exist or has been deleted."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/restaurants")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const totalItems = restaurant.categories.reduce((sum, c) => sum + c._count.items, 0);
  const activeCategories = restaurant.categories.filter((c) => c.isActive).length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <button
        type="button"
        onClick={() => navigate("/admin/restaurants")}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Restaurants
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{restaurant.name}</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Detailed restaurant profile and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Total Categories</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{restaurant.categories.length}</div>
          <div className="text-xs text-gray-500 mt-1">Menu sections</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Active Categories</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-green-600">{activeCategories}</div>
          <div className="text-xs text-gray-500 mt-1">Currently visible</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Total Items</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">Menu items</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">QR Code</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">
            {restaurant.qrCodeUrl ? (
              <span className="text-green-600">Active</span>
            ) : (
              <span className="text-gray-400">None</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">Scan status</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Restaurant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <div className="text-xs md:text-sm font-medium text-gray-600">Slug</div>
            <code className="text-xs md:text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">{restaurant.slug}</code>
          </div>
          <div>
            <div className="text-xs md:text-sm font-medium text-gray-600">Restaurant ID</div>
            <code className="text-xs md:text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block break-all">{restaurant.id}</code>
          </div>
          <div>
            <div className="text-xs md:text-sm font-medium text-gray-600">Created Date</div>
            <div className="text-sm text-gray-900 mt-1">
              {new Date(restaurant.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-xs md:text-sm font-medium text-gray-600">QR Code Status</div>
            <div className="mt-1">
              {restaurant.qrCodeUrl ? (
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <QrCode className="h-4 w-4" />
                  Generated
                </span>
              ) : (
                <span className="text-sm text-gray-500">Not generated</span>
              )}
            </div>
          </div>
        </div>
        {restaurant.qrCodeUrl && (
          <div className="pt-4 border-t">
            <div className="text-xs md:text-sm font-medium text-gray-600 mb-2">QR Code</div>
            <img src={restaurant.qrCodeUrl} alt="QR Code" className="w-32 h-32 border rounded-lg" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg md:text-xl font-semibold">Categories ({restaurant.categories.length})</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Menu sections like "Appetizers", "Main Course", "Desserts" - Each category contains menu items
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">Name</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">Items</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">Status</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">Sort Order</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {restaurant.categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-6 md:py-8 text-center text-sm text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                restaurant.categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-600">{category._count.items}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      {category.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-600">{category.sortOrder}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantDetailPage;
