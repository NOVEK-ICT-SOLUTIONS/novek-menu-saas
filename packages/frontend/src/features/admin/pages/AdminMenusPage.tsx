import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useAdminMenus } from "../services";

const AdminMenusPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: menus, isLoading } = useAdminMenus();

  const filteredMenus = menus?.filter(
    (menu) =>
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const activeMenus = menus?.filter((m) => m.isActive).length || 0;
  const totalItems = menus?.reduce((sum, m) => sum + m._count.menuItems, 0) || 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Menus Management</h1>
        <p className="text-gray-600 mt-2">View all menus across restaurants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Total Menus</div>
          <div className="text-3xl font-bold mt-2">{menus?.length || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Active Menus</div>
          <div className="text-3xl font-bold mt-2">{activeMenus}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Total Items</div>
          <div className="text-3xl font-bold mt-2">{totalItems}</div>
        </div>
      </div>

      {/* Menus Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Menus</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Menu Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Restaurant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMenus?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No menus found
                  </td>
                </tr>
              ) : (
                filteredMenus?.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{menu.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{menu.restaurant.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          menu.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {menu.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{menu._count.menuItems}</td>
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
    </div>
  );
};

export default AdminMenusPage;
