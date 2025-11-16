import { useState } from "react";
import { MdEmail, MdFeedback, MdLocationOn, MdMenu, MdPhone, MdRestaurant } from "react-icons/md";
import { useParams } from "react-router-dom";
import { type MenuItem, useRestaurantBySlug } from "../services";

const CustomerMenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("all");

  const { data: restaurant, isLoading, isError } = useRestaurantBySlug(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="text-gray-600 text-sm">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <MdRestaurant className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600">This restaurant doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const activeMenus = restaurant.menus.filter((menu) => menu.isActive);

  // Set default to "all" on first load
  if (activeMenus.length > 0 && !selectedMenuId) {
    setSelectedMenuId("all");
  }

  // Get items based on selected menu
  let menuItems: MenuItem[] = [];
  if (selectedMenuId === "all") {
    // Show all items from all active menus
    menuItems = activeMenus.flatMap((menu) => menu.menuItems).filter((item) => item.isAvailable);
  } else {
    // Show items from selected menu only
    const currentMenu = activeMenus.find((menu) => menu.id === selectedMenuId);
    menuItems = currentMenu?.menuItems.filter((item) => item.isAvailable) || [];
  }

  // Group items by category for organized display
  const itemsByCategory = menuItems.reduce(
    (acc, item) => {
      const categoryName = item.category?.name || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>,
  );

  const primaryColor = restaurant.primaryColor || "#ea580c";
  const bgColor = restaurant.backgroundColor || "#ffffff";

  // Show landing page
  if (!showMenu) {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: restaurant.headerImageUrl
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${restaurant.headerImageUrl})`
            : `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Blur overlay if header image exists */}
        {restaurant.headerImageUrl && <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>}

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Main Card */}
            <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
              {/* Logo Section */}
              <div
                className="p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
                }}
              >
                {restaurant.logoUrl ? (
                  <img
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    className="h-24 w-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4"
                  />
                ) : (
                  <div
                    className="h-24 w-24 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MdRestaurant className="h-12 w-12 text-white" />
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <p className="text-sm text-gray-600">Welcome to our restaurant</p>
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowMenu(true)}
                  disabled={activeMenus.length === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                    activeMenus.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl transform hover:scale-105"
                  }`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <MdMenu className="h-6 w-6" />
                  {activeMenus.length === 0 ? "No Menu Available" : "View Menu"}
                </button>

                {restaurant.location && (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://maps.google.com/?q=${encodeURIComponent(restaurant.location || "")}`,
                        "_blank",
                      )
                    }
                    className="w-full py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-3 hover:shadow-md"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                    }}
                  >
                    <MdLocationOn className="h-5 w-5" />
                    Location
                  </button>
                )}

                {(restaurant.contactEmail || restaurant.contactPhone) && (
                  <button
                    type="button"
                    className="w-full py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-3 hover:shadow-md"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                    }}
                  >
                    {restaurant.contactPhone ? <MdPhone className="h-5 w-5" /> : <MdEmail className="h-5 w-5" />}
                    Contact Us
                  </button>
                )}

                <button
                  type="button"
                  className="w-full py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-3 hover:shadow-md"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  <MdFeedback className="h-5 w-5" />
                  Feedback
                </button>
              </div>

              {/* Contact Info Footer */}
              {(restaurant.contactEmail || restaurant.contactPhone || restaurant.location) && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="space-y-2 text-sm text-gray-600">
                    {restaurant.location && (
                      <div className="flex items-center gap-2">
                        <MdLocationOn className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                        <span className="text-xs">{restaurant.location}</span>
                      </div>
                    )}
                    {restaurant.contactPhone && (
                      <div className="flex items-center gap-2">
                        <MdPhone className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                        <a href={`tel:${restaurant.contactPhone}`} className="text-xs hover:underline">
                          {restaurant.contactPhone}
                        </a>
                      </div>
                    )}
                    {restaurant.contactEmail && (
                      <div className="flex items-center gap-2">
                        <MdEmail className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                        <a href={`mailto:${restaurant.contactEmail}`} className="text-xs hover:underline">
                          {restaurant.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Powered by */}
            <p className="text-center mt-6 text-xs text-white/80">
              Powered by <span className="font-semibold">NovekMenu</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => setShowMenu(false)} className="text-white/90 hover:text-white text-sm">
            ← Back
          </button>
          {restaurant.logoUrl && (
            <img src={restaurant.logoUrl} alt={restaurant.name} className="h-7 w-7 rounded-full object-cover" />
          )}
          <h1 className="text-base font-semibold text-white truncate flex-1">{restaurant.name}</h1>
        </div>
      </div>

      {/* Menu Tabs */}
      {activeMenus.length > 0 && (
        <div className="sticky top-[52px] z-40 bg-white border-b">
          <div className="max-w-3xl mx-auto px-4 py-2">
            {activeMenus.length <= 6 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMenuId("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMenuId === "all" ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={selectedMenuId === "all" ? { backgroundColor: primaryColor } : {}}
                >
                  All Items
                </button>
                {activeMenus.map((menu) => (
                  <button
                    type="button"
                    key={menu.id}
                    onClick={() => setSelectedMenuId(menu.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedMenuId === menu.id ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    style={selectedMenuId === menu.id ? { backgroundColor: primaryColor } : {}}
                  >
                    {menu.name}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <option value="all">All Items</option>
                {activeMenus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Menu Items - Grouped by Category */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <MdRestaurant className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No items available in this menu</p>
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-3">
              <h2 className="text-base font-bold px-1" style={{ color: primaryColor }}>
                {categoryName}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 flex gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      )}
                      <div className="text-base font-bold" style={{ color: primaryColor }}>
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerMenuPage;
