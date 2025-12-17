import React from "react";
import { MdAdd, MdArrowBack, MdDelete, MdEdit, MdFastfood } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { ImageUpload } from "@/components/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCategory } from "@/features/categories/hooks/useCategories";
import { useCreateMenuItem, useDeleteMenuItem, useMenuItemsByCategory, useUpdateMenuItem } from "../hooks/useMenuItems";

interface FormData {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  isAvailable: true,
};

const MenuItemsPage = React.memo(
  () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const { data: menuItems, isLoading } = useMenuItemsByCategory(categoryId || "");
    const { data: category } = useCategory(categoryId || "");
    const createMenuItem = useCreateMenuItem();
    const updateMenuItem = useUpdateMenuItem(categoryId || "");
    const deleteMenuItem = useDeleteMenuItem(categoryId || "");

    const [open, setOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_DATA);

    const resetForm = React.useCallback(() => {
      setFormData(INITIAL_FORM_DATA);
      setOpen(false);
      setEditingItem(null);
    }, []);

    const handleSubmit = React.useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId) return;

        const itemData = {
          name: formData.name,
          description: formData.description || undefined,
          price: Number.parseFloat(formData.price),
          imageUrl: formData.imageUrl || undefined,
          isAvailable: formData.isAvailable,
        };

        if (editingItem) {
          await updateMenuItem.mutateAsync({ id: editingItem, data: itemData });
        } else {
          await createMenuItem.mutateAsync({ categoryId, ...itemData });
        }
        resetForm();
      },
      [categoryId, formData, editingItem, updateMenuItem, createMenuItem, resetForm],
    );

    const handleEdit = React.useCallback(
      (item: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        isAvailable: boolean;
      }) => {
        setEditingItem(item.id);
        setFormData({
          name: item.name,
          description: item.description || "",
          price: item.price.toString(),
          imageUrl: item.imageUrl || "",
          isAvailable: item.isAvailable,
        });
        setOpen(true);
      },
      [],
    );

    const handleDelete = React.useCallback(
      async (id: string) => {
        if (globalThis.confirm("Are you sure you want to delete this item?")) {
          await deleteMenuItem.mutateAsync(id);
        }
      },
      [deleteMenuItem],
    );

    const handleBack = React.useCallback(() => navigate(-1), [navigate]);

    const handleOpenNew = React.useCallback(() => {
      setEditingItem(null);
      setFormData(INITIAL_FORM_DATA);
    }, []);

    const updateField = React.useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    return (
      <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-8 pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 md:h-10 md:w-10">
                <MdArrowBack className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">{category?.name || "Menu Items"}</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Add and manage items for this category with prices and descriptions.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNew} className="text-sm w-full sm:w-auto">
                <MdAdd className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Item</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">{editingItem ? "Edit" : "Create"} Menu Item</DialogTitle>
                <DialogDescription className="text-sm">
                  {editingItem ? "Update the menu item details." : "Add a new item to this category."}
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
                    onChange={(e) => updateField("name", e.target.value)}
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
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Image (optional)</Label>
                  <ImageUpload
                    value={formData.imageUrl || undefined}
                    onChange={(url) => updateField("imageUrl", url || "")}
                    disabled={createMenuItem.isPending || updateMenuItem.isPending}
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
                    onChange={(e) => updateField("price", e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isAvailable" className="text-sm">
                      Available
                    </Label>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Item is visible and available to customers
                    </p>
                  </div>
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => updateField("isAvailable", checked)}
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
              <CardDescription className="text-xs md:text-sm">
                {menuItems.length} items in this category
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="md:hidden space-y-2 p-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                        <span className="font-medium text-sm">{item.price.toFixed(2)} Birr</span>
                      </div>
                    </div>
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
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <MdFastfood className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {item.description || <span className="text-muted-foreground italic">No description</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.price.toFixed(2)} Birr</TableCell>
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
  },
  () => true,
);

MenuItemsPage.displayName = "MenuItemsPage";

export default MenuItemsPage;
