import { useEffect, useState } from "react";
import { MdEmail, MdFeedback, MdImage, MdLocationOn, MdMenu, MdPalette, MdPhone, MdRestaurant } from "react-icons/md";
import {
  type Restaurant,
  type RestaurantFormData,
  useRestaurant,
  useRestaurants,
  useUpdateRestaurant,
} from "../services";

// Helper function to clean form data
const cleanFormData = (formData: RestaurantFormData): RestaurantFormData => {
  const cleanedData: RestaurantFormData = {};
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== "") {
      cleanedData[key as keyof RestaurantFormData] = value;
    }
  });
  return cleanedData;
};

const RestaurantCustomizationPage = () => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [formData, setFormData] = useState<RestaurantFormData>({});

  // Use service queries
  const { data: restaurants = [], isLoading: loadingRestaurants } = useRestaurants();
  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurant(selectedRestaurantId);

  // Update form when restaurant data changes
  useEffect(() => {
    if (restaurant) {
      setFormData({
        location: restaurant.location || "",
        contactEmail: restaurant.contactEmail || "",
        contactPhone: restaurant.contactPhone || "",
        primaryColor: restaurant.primaryColor,
        backgroundColor: restaurant.backgroundColor,
        logoUrl: restaurant.logoUrl || "",
        headerImageUrl: restaurant.headerImageUrl || "",
      });
    }
  }, [restaurant]);

  // Auto-select first restaurant
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  // Use service mutation
  const updateMutation = useUpdateRestaurant();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: selectedRestaurantId, data: cleanFormData(formData) });
  };

  const handleChange = (field: keyof RestaurantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const previewUrl = restaurant ? `/menu/${restaurant.slug}` : "#";

  if (loadingRestaurants) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <MdRestaurant className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurants Yet</h2>
          <p className="text-gray-600">Create a restaurant first to customize its appearance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 max-w-6xl mx-auto">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Restaurant Customization</h1>
        <p className="text-xs md:text-sm text-gray-600">
          Customize your restaurant's colors, images, and contact information
        </p>
      </div>

      {/* Restaurant Selector */}
      {restaurants.length > 1 && (
        <RestaurantSelector
          restaurants={restaurants}
          selectedRestaurantId={selectedRestaurantId}
          setSelectedRestaurantId={setSelectedRestaurantId}
        />
      )}

      {loadingRestaurant ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <CustomizationForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            updateMutation={updateMutation}
            previewUrl={previewUrl}
          />
          <LivePreview restaurant={restaurant} formData={formData} />
        </div>
      )}
    </div>
  );
};

// Restaurant Selector Component
const RestaurantSelector = ({
  restaurants,
  selectedRestaurantId,
  setSelectedRestaurantId,
}: {
  restaurants: Restaurant[];
  selectedRestaurantId: string;
  setSelectedRestaurantId: (id: string) => void;
}) => (
  <div className="mb-4 md:mb-6 bg-white rounded-lg border border-gray-200 p-3 md:p-4">
    <label htmlFor="restaurant-select" className="block text-sm font-medium text-gray-700 mb-2">
      Select Restaurant
    </label>
    <select
      id="restaurant-select"
      value={selectedRestaurantId}
      onChange={(e) => setSelectedRestaurantId(e.target.value)}
      className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    >
      {restaurants.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  </div>
);

// Customization Form Component
const CustomizationForm = ({
  formData,
  handleChange,
  handleSubmit,
  updateMutation,
  previewUrl,
}: {
  formData: RestaurantFormData;
  handleChange: (field: keyof RestaurantFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  updateMutation: ReturnType<typeof useUpdateRestaurant>;
  previewUrl: string;
}) => (
  <div className="space-y-4 md:space-y-6">
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <ContactSection formData={formData} handleChange={handleChange} />
      <ColorsSection formData={formData} handleChange={handleChange} />
      <ImagesSection formData={formData} handleChange={handleChange} />
      <FormActions updateMutation={updateMutation} previewUrl={previewUrl} />
    </form>
  </div>
);

// Contact Information Section
const ContactSection = ({
  formData,
  handleChange,
}: {
  formData: RestaurantFormData;
  handleChange: (field: keyof RestaurantFormData, value: string) => void;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
    <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <MdRestaurant className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
      Contact Information
    </h2>
    <div className="space-y-3 md:space-y-4">
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          <MdLocationOn className="inline h-4 w-4 mr-1" />
          Location / Address
        </label>
        <input
          id="location"
          type="text"
          value={formData.location || ""}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="123 Main Street, New York, NY 10001"
          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
          <MdEmail className="inline h-4 w-4 mr-1" />
          Contact Email
        </label>
        <input
          id="contactEmail"
          type="email"
          value={formData.contactEmail || ""}
          onChange={(e) => handleChange("contactEmail", e.target.value)}
          placeholder="info@restaurant.com"
          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
          <MdPhone className="inline h-4 w-4 mr-1" />
          Contact Phone
        </label>
        <input
          id="contactPhone"
          type="tel"
          value={formData.contactPhone || ""}
          onChange={(e) => handleChange("contactPhone", e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
    </div>
  </div>
);

// Colors Section
const ColorsSection = ({
  formData,
  handleChange,
}: {
  formData: RestaurantFormData;
  handleChange: (field: keyof RestaurantFormData, value: string) => void;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
    <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <MdPalette className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
      Brand Colors
    </h2>
    <div className="space-y-3 md:space-y-4">
      <ColorInput
        id="primaryColor"
        label="Primary Color (Buttons, Accents)"
        value={formData.primaryColor || "#ea580c"}
        onChange={(value) => handleChange("primaryColor", value)}
        hint="Used for buttons, badges, and highlighted elements"
      />
      <ColorInput
        id="backgroundColor"
        label="Background Color"
        value={formData.backgroundColor || "#ffffff"}
        onChange={(value) => handleChange("backgroundColor", value)}
        hint="Card and content background color"
      />
    </div>
  </div>
);

// Color Input Component
const ColorInput = ({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex gap-2 md:gap-3 items-center">
      <input
        id={`${id}-color`}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-16 md:h-12 md:w-20 rounded-lg border border-gray-300 cursor-pointer"
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={value}
        pattern="^#[0-9A-Fa-f]{6}$"
        className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">{hint}</p>
  </div>
);

// Images Section
const ImagesSection = ({
  formData,
  handleChange,
}: {
  formData: RestaurantFormData;
  handleChange: (field: keyof RestaurantFormData, value: string) => void;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
    <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
      <MdImage className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
      Images
    </h2>
    <div className="space-y-3 md:space-y-4">
      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Logo URL
        </label>
        <input
          id="logoUrl"
          type="url"
          value={formData.logoUrl || ""}
          onChange={(e) => handleChange("logoUrl", e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">Square image recommended (200x200px or larger)</p>
      </div>
      <div>
        <label htmlFor="headerImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Header Image URL
        </label>
        <input
          id="headerImageUrl"
          type="url"
          value={formData.headerImageUrl || ""}
          onChange={(e) => handleChange("headerImageUrl", e.target.value)}
          placeholder="https://example.com/header.jpg"
          className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">Wide image recommended (1200x400px or larger)</p>
      </div>
    </div>
  </div>
);

// Form Actions
const FormActions = ({
  updateMutation,
  previewUrl,
}: {
  updateMutation: ReturnType<typeof useUpdateRestaurant>;
  previewUrl: string;
}) => (
  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
    <button
      type="submit"
      disabled={updateMutation.isPending}
      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
    >
      {updateMutation.isPending ? "Saving..." : "Save Changes"}
    </button>
    <a
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base text-center border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 font-semibold transition-colors"
    >
      Preview Menu
    </a>
  </div>
);

// Live Preview Component
const LivePreview = ({
  restaurant,
  formData,
}: {
  restaurant: Restaurant | undefined;
  formData: RestaurantFormData;
}) => {
  const primaryColor = formData.primaryColor || "#ea580c";
  const bgColor = formData.backgroundColor || "#ffffff";

  return (
    <div className="space-y-4 md:space-y-6 lg:sticky lg:top-4 lg:self-start">
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Live Preview</h2>

        {/* Background wrapper matching customer page */}
        <div
          className="rounded-2xl p-3 md:p-6 flex items-center justify-center min-h-[400px] md:min-h-[500px]"
          style={{
            background: formData.headerImageUrl
              ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${formData.headerImageUrl})`
              : `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="w-full max-w-sm">
            {/* Main Card */}
            <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
              {/* Logo Section */}
              <div
                className="p-6 md:p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
                }}
              >
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-20 w-20 md:h-24 md:w-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-3 md:mb-4"
                  />
                ) : (
                  <div
                    className="h-20 w-20 md:h-24 md:w-24 mx-auto rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MdRestaurant className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{restaurant?.name}</h3>
                <p className="text-xs md:text-sm text-gray-600">Welcome to our restaurant</p>
              </div>

              {/* Action Buttons */}
              <div className="p-4 md:p-6 space-y-2.5 md:space-y-3">
                <div
                  className="w-full py-3 md:py-4 rounded-xl font-semibold text-white text-center text-sm md:text-base shadow-lg flex items-center justify-center gap-2 md:gap-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MdMenu className="h-5 w-5 md:h-6 md:w-6" />
                  View Menu
                </div>

                {formData.location && (
                  <div
                    className="w-full py-3 md:py-4 rounded-xl font-semibold border-2 text-center text-sm md:text-base flex items-center justify-center gap-2 md:gap-3"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <MdLocationOn className="h-4 w-4 md:h-5 md:w-5" />
                    Location
                  </div>
                )}

                {(formData.contactEmail || formData.contactPhone) && (
                  <div
                    className="w-full py-3 md:py-4 rounded-xl font-semibold border-2 text-center text-sm md:text-base flex items-center justify-center gap-2 md:gap-3"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    {formData.contactPhone ? (
                      <MdPhone className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <MdEmail className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                    Contact Us
                  </div>
                )}

                <div
                  className="w-full py-3 md:py-4 rounded-xl font-semibold border-2 text-center text-sm md:text-base flex items-center justify-center gap-2 md:gap-3"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <MdFeedback className="h-4 w-4 md:h-5 md:w-5" />
                  Feedback
                </div>
              </div>

              {/* Contact Info Footer */}
              {(formData.location || formData.contactEmail || formData.contactPhone) && (
                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 border-t border-gray-100">
                  <div className="space-y-1.5 md:space-y-2 text-sm text-gray-600">
                    {formData.location && (
                      <div className="flex items-center gap-2">
                        <MdLocationOn className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" style={{ color: primaryColor }} />
                        <span className="text-[10px] md:text-xs">{formData.location}</span>
                      </div>
                    )}
                    {formData.contactPhone && (
                      <div className="flex items-center gap-2">
                        <MdPhone className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" style={{ color: primaryColor }} />
                        <span className="text-[10px] md:text-xs">{formData.contactPhone}</span>
                      </div>
                    )}
                    {formData.contactEmail && (
                      <div className="flex items-center gap-2">
                        <MdEmail className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" style={{ color: primaryColor }} />
                        <span className="text-[10px] md:text-xs truncate">{formData.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs md:text-sm text-blue-800">
            <strong>💡 Tip:</strong> Changes are saved to your restaurant and will be visible immediately on the
            customer menu page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCustomizationPage;
