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

  return (
    <div className="p-8 space-y-8">
      <button
        type="button"
        onClick={() => navigate("/admin/restaurants")}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Restaurants
      </button>

      <div>
        <h1 className="text-4xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-600 mt-2">Detailed restaurant profile and analytics</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📚 Understanding the Structure:</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Menus:</strong> Different collections (e.g., "Breakfast Menu", "Dinner Menu", "Drinks") - Each menu
            contains menu items
          </p>
          <p>
            <strong>Categories:</strong> Ways to organize items (e.g., "Appetizers", "Main Course", "Desserts") - Used
            to group items within menus
          </p>
          <p>
            <strong>Menu Items:</strong> The actual dishes/products that customers see (e.g., "Margherita Pizza",
            "Caesar Salad")
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Total Menus</div>
          <div className="text-3xl font-bold mt-2">{restaurant.menus.length}</div>
          <div className="text-xs text-gray-500 mt-1">Collections of items</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Active Menus</div>
          <div className="text-3xl font-bold mt-2 text-green-600">
            {restaurant.menus.filter((m) => m.isActive).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Currently visible to customers</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Categories</div>
          <div className="text-3xl font-bold mt-2">{restaurant.categories.length}</div>
          <div className="text-xs text-gray-500 mt-1">Ways to group items</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Total Items</div>
          <div className="text-3xl font-bold mt-2">
            {restaurant.menus.reduce((sum, m) => sum + m._count.menuItems, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Actual dishes/products</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Restaurant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-600">Slug</div>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">{restaurant.slug}</code>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Owner Email</div>
            <div className="text-sm text-gray-900 mt-1">{restaurant.owner.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Created Date</div>
            <div className="text-sm text-gray-900 mt-1">
              {new Date(restaurant.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">QR Code Status</div>
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
            <div className="text-sm font-medium text-gray-600 mb-2">QR Code</div>
            <img src={restaurant.qrCodeUrl} alt="QR Code" className="w-32 h-32 border rounded-lg" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Menus ({restaurant.menus.length})</h2>
          <p className="text-sm text-gray-600 mt-1">
            Different collections like "Breakfast", "Lunch", "Dinner", "Drinks" - Each menu contains multiple items
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {restaurant.menus.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No menus found
                  </td>
                </tr>
              ) : (
                restaurant.menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{menu.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{menu._count.menuItems}</td>
                    <td className="px-6 py-4">
                      {menu.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(menu.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Categories ({restaurant.categories.length})</h2>
          <p className="text-sm text-gray-600 mt-1">
            Ways to organize items like "Appetizers", "Main Course", "Desserts" - Used to group items within menus
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {restaurant.categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                restaurant.categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{category._count.menuItems}</td>
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
