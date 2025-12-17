import React from "react";
import { MdEmail, MdFeedback, MdLocationOn, MdMenu, MdPhone, MdRestaurant } from "react-icons/md";
import { useParams } from "react-router-dom";
import { type Category, type MenuItem, useRestaurantBySlug } from "../services";

const CustomerMenuPage = React.memo(
  () => {
    const { slug } = useParams<{ slug: string }>();
    const [showMenu, setShowMenu] = React.useState(false);

    const { data: restaurant, isLoading, isError } = useRestaurantBySlug(slug || "");

    const handleShowMenu = React.useCallback(() => setShowMenu(true), []);
    const handleHideMenu = React.useCallback(() => setShowMenu(false), []);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto" />
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

    const activeCategories = restaurant.categories
      .filter((cat: Category) => cat.isActive)
      .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder);
    const hasItems = activeCategories.some((cat: Category) => cat.items.some((item: MenuItem) => item.isAvailable));

    const primaryColor = restaurant.primaryColor || "#ea580c";
    const bgColor = restaurant.backgroundColor || "#ffffff";

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
          {restaurant.headerImageUrl && <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />}

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
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

                <div className="p-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleShowMenu}
                    disabled={!hasItems}
                    className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                      !hasItems ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl transform hover:scale-105"
                    }`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MdMenu className="h-6 w-6" />
                    {!hasItems ? "No Menu Available" : "View Menu"}
                  </button>

                  {restaurant.location && (
                    <button
                      type="button"
                      onClick={() =>
                        globalThis.open(
                          `https://maps.google.com/?q=${encodeURIComponent(restaurant.location || "")}`,
                          "_blank",
                        )
                      }
                      className="w-full py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-3 hover:shadow-md"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      <MdLocationOn className="h-5 w-5" />
                      Location
                    </button>
                  )}

                  {(restaurant.contactEmail || restaurant.contactPhone) && (
                    <button
                      type="button"
                      className="w-full py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-3 hover:shadow-md"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      {restaurant.contactPhone ? <MdPhone className="h-5 w-5" /> : <MdEmail className="h-5 w-5" />}
                      Contact Us
                    </button>
                  )}

                  <button
                    type="button"
                    className="w-full py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-3 hover:shadow-md"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <MdFeedback className="h-5 w-5" />
                    Feedback
                  </button>
                </div>

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
        <div className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: primaryColor }}>
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button type="button" onClick={handleHideMenu} className="text-white/90 hover:text-white text-sm">
              \u2190 Back
            </button>
            {restaurant.logoUrl && (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="h-7 w-7 rounded-full object-cover" />
            )}
            <h1 className="text-base font-semibold text-white truncate flex-1">{restaurant.name}</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
          {activeCategories.map((category: Category) => {
            const availableItems = category.items.filter((item: MenuItem) => item.isAvailable);
            if (availableItems.length === 0) return null;

            return (
              <div key={category.id} className="space-y-3">
                <div className="sticky top-[52px] bg-gray-50 py-2 -mx-4 px-4 z-30">
                  <h2 className="text-lg font-bold" style={{ color: primaryColor }}>
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  {availableItems.map((item: MenuItem) => (
                    <div key={item.id} className="bg-white rounded-lg p-3 flex gap-3 shadow-sm">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        )}
                        <div className="text-base font-bold" style={{ color: primaryColor }}>
                          {item.price.toFixed(2)} Birr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  () => true,
);

CustomerMenuPage.displayName = "CustomerMenuPage";

export default CustomerMenuPage;
