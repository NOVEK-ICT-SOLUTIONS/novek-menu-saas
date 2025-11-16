import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { MdAdd, MdArrowBack, MdDelete, MdEdit, MdFastfood } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useMenu } from "@/features/menus/hooks/useMenus";
import { cn } from "@/lib/utils";
import { useCreateMenuItem, useDeleteMenuItem, useMenuItems, useUpdateMenuItem } from "../hooks/useMenuItems";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrl?: string;
  isAvailable: boolean;
  category?: { id: string; name: string };
  menu?: { restaurantId: string };
}

const MenuItemsPage = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  const { data: menuItems, isLoading } = useMenuItems(menuId || "");
  const { data: menu } = useMenu(menuId || "");
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  // Get restaurant from menu or fallback to first menu item
  const restaurantId = menu?.restaurantId || menuItems?.[0]?.menu?.restaurantId;
  const categoriesData = useCategories(restaurantId);
  const categories = Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
  const createCategory = categoriesData.createCategory;

  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true });
    setOpen(false);
    setEditingItem(null);
    setCategoryOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. EditingItem:", editingItem);
    console.log("Form data:", formData);

    if (!menuId || !restaurantId) {
      console.error("Missing menuId or restaurantId", { menuId, restaurantId });
      toast.error("Cannot save - missing required data");
      return;
    }

    try {
      // Find or create category
      let categoryId: string | undefined;
      if (formData.category) {
        const existingCategory = categories.find((cat) => cat.name.toLowerCase() === formData.category.toLowerCase());

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          console.log("Creating new category:", formData.category);
          const newCategory = await createCategory({
            restaurantId,
            data: { name: formData.category },
          });
          categoryId = newCategory.id;
        }
      }

      const itemData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        categoryId,
        imageUrl: formData.imageUrl || undefined,
        isAvailable: formData.isAvailable,
      };

      console.log("Item data to save:", itemData);

      if (editingItem) {
        console.log("Updating item with ID:", editingItem);
        await updateMenuItem.mutateAsync({
          id: editingItem,
          data: itemData,
        });
        toast.success("Item updated successfully!");
      } else {
        console.log("Creating new item");
        await createMenuItem.mutateAsync({
          menuId,
          data: itemData,
        });
        toast.success("Item created successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save menu item:", error);
      toast.error(editingItem ? "Failed to update item" : "Failed to create item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    console.log("Editing item:", item);
    setEditingItem(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category?.name || "",
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    });
    setOpen(true);
    console.log("Dialog opened, editingItem:", item.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem.mutateAsync(id);
        toast.success("Item deleted successfully!");
      } catch (error) {
        console.error("Failed to delete item:", error);
        toast.error("Failed to delete item");
      }
    }
  };

  return (
    <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 md:h-10 md:w-10">
              <MdArrowBack className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">Menu Items</h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Add and manage items for this menu with prices and descriptions.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                setFormData({ name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true });
                setCategoryOpen(false);
              }}
              className="text-sm w-full sm:w-auto"
            >
              <MdAdd className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Item</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">{editingItem ? "Edit" : "Create"} Menu Item</DialogTitle>
              <DialogDescription className="text-sm">
                {editingItem ? "Update the menu item details." : "Add a new item to your menu."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Item Name
                </Label>
                <Input
                  id="name"
                  className="text-sm md:text-base"
                  placeholder="Cheeseburger"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="text-sm md:text-base"
                  placeholder="A delicious burger with cheese, lettuce, and tomato"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Category (optional)</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between text-sm"
                    >
                      {formData.category || "Select or type category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search or create category..."
                        value={formData.category}
                        onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                      />
                      <CommandList>
                        <CommandEmpty>Press Enter to create "{formData.category}"</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.name}
                              onSelect={(currentValue: string) => {
                                setFormData({ ...formData, category: currentValue });
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.category === category.name ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Type a new category name to create it (e.g., Appetizers, Pizzas, Desserts)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm">
                  Image URL (optional)
                </Label>
                <Input
                  id="imageUrl"
                  className="text-sm md:text-base"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  className="text-sm md:text-base"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isAvailable" className="text-sm">
                    Available
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Item is visible and available to customers</p>
                </div>
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={resetForm} className="text-sm w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMenuItem.isPending || updateMenuItem.isPending}
                  className="text-sm w-full sm:w-auto"
                >
                  {createMenuItem.isPending || updateMenuItem.isPending
                    ? "Saving..."
                    : editingItem
                      ? "Update Item"
                      : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="space-y-2 md:space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 md:h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : menuItems && menuItems.length > 0 ? (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <MdFastfood className="h-4 w-4 md:h-5 md:w-5" />
              All Menu Items
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{menuItems.length} items in this menu</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            <div className="md:hidden space-y-2 p-3">
              {menuItems.map((item: MenuItem) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      {item.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.category.name}
                        </Badge>
                      )}
                    </div>
                    <span className="font-medium text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
                  </div>
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-xs">
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="h-8 text-xs">
                        <MdEdit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMenuItem.isPending}
                        className="h-8 text-xs"
                      >
                        <MdDelete className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item: MenuItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="outline">{item.category.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No category</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {item.description || <span className="text-muted-foreground italic">No description</span>}
                    </TableCell>
                    <TableCell className="text-right font-medium">${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.isAvailable ? "default" : "secondary"}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <MdEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMenuItem.isPending}
                        >
                          <MdDelete className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">No items yet</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Create your first menu item to get started (e.g., Burger, Pizza, Salad)
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default MenuItemsPage;
