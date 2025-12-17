import React from "react";
import { MdAdd, MdArrowBack, MdCategory, MdDelete } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { useCategoriesByRestaurant, useCreateCategory, useDeleteCategory } from "../hooks/useCategories";

interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  items: { id: string }[];
}

const CategoriesPage = React.memo(
  () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const { data: categories, isLoading } = useCategoriesByRestaurant(restaurantId || "");
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory(restaurantId || "");

    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [isActive, setIsActive] = React.useState(true);

    const handleSubmit = React.useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId) return;

        await createCategory.mutateAsync({
          restaurantId,
          name,
          description: description || undefined,
        });

        setName("");
        setDescription("");
        setIsActive(true);
        setOpen(false);
      },
      [restaurantId, name, description, createCategory],
    );

    const handleDelete = React.useCallback(
      async (id: string) => {
        if (globalThis.confirm("Are you sure you want to delete this category? All items in it will be deleted.")) {
          await deleteCategory.mutateAsync(id);
        }
      },
      [deleteCategory],
    );

    const handleBack = React.useCallback(() => navigate("/restaurants"), [navigate]);
    const handleManageItems = React.useCallback(
      (categoryId: string) => navigate(`/categories/${categoryId}/items`),
      [navigate],
    );

    return (
      <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-8 pt-4 md:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 md:h-10 md:w-10">
                <MdArrowBack className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">Categories</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage categories for this restaurant. Each category can contain multiple menu items.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="text-sm w-full sm:w-auto">
                <MdAdd className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Category</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Create New Category</DialogTitle>
                <DialogDescription className="text-sm">
                  Add a new category for your menu (e.g., Appetizers, Main Course, Desserts).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Category Name
                  </Label>
                  <Input
                    id="name"
                    className="text-sm md:text-base"
                    placeholder="Appetizers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="description"
                    className="text-sm md:text-base"
                    placeholder="Start your meal with our delicious appetizers"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="text-sm">
                      Active Category
                    </Label>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Active categories are visible to customers
                    </p>
                  </div>
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCategory.isPending} className="text-sm w-full sm:w-auto">
                    {createCategory.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="p-4">
                  <Skeleton className="h-4 w-[150px] md:w-[200px]" />
                  <Skeleton className="h-3 w-20 md:w-[100px]" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-9 md:h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: CategoryItem) => (
              <Card key={category.id}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <MdCategory className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="truncate">{category.name}</span>
                    </CardTitle>
                    <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs md:text-sm">{category.items?.length || 0} items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0">
                  <Button className="w-full text-sm" onClick={() => handleManageItems(category.id)}>
                    Manage Items
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full text-sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteCategory.isPending}
                  >
                    <MdDelete className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-base md:text-lg">No categories yet</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Create your first category to start adding menu items (e.g., Appetizers, Main Course, Desserts)
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    );
  },
  () => true,
);

CategoriesPage.displayName = "CategoriesPage";

export default CategoriesPage;
