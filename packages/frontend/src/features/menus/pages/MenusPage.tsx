import { useState } from "react";
import { MdAdd, MdArrowBack, MdDelete, MdRestaurantMenu } from "react-icons/md";
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
import { useCreateMenu, useDeleteMenu, useMenus } from "../hooks/useMenus";

interface Menu {
  id: string;
  name: string;
  isActive: boolean;
  _count?: { items: number };
}

const MenusPage = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { data: menus, isLoading } = useMenus(restaurantId || "");
  const createMenu = useCreateMenu();
  const deleteMenu = useDeleteMenu();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    try {
      await createMenu.mutateAsync({ restaurantId, data: { name, isActive } });
      toast.success("Menu created successfully!");
      setName("");
      setIsActive(true);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create menu:", error);
      toast.error("Failed to create menu");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      try {
        await deleteMenu.mutateAsync(id);
        toast.success("Menu deleted successfully!");
      } catch (error) {
        console.error("Failed to delete menu:", error);
        toast.error("Failed to delete menu");
      }
    }
  };

  return (
    <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/restaurants")}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <MdArrowBack className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">Restaurant Menus</h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Manage menus for this restaurant. Each menu can contain multiple items.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="text-sm w-full sm:w-auto">
              <MdAdd className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Menu</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Create New Menu</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new menu for your restaurant (e.g., Breakfast, Lunch, Dinner).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Menu Name
                </Label>
                <Input
                  id="name"
                  className="text-sm md:text-base"
                  placeholder="Breakfast Menu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm">
                    Active Menu
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Active menus are visible to customers</p>
                </div>
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMenu.isPending} className="text-sm w-full sm:w-auto">
                  {createMenu.isPending ? "Creating..." : "Create Menu"}
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
      ) : menus && menus.length > 0 ? (
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu: Menu) => (
            <Card key={menu.id}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <MdRestaurantMenu className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="truncate">{menu.name}</span>
                  </CardTitle>
                  <Badge variant={menu.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                    {menu.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="text-xs md:text-sm">{menu._count?.items || 0} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                <Button className="w-full text-sm" onClick={() => navigate(`/menus/${menu.id}/items`)}>
                  Manage Items
                </Button>
                <Button
                  variant="destructive"
                  className="w-full text-sm"
                  onClick={() => handleDelete(menu.id)}
                  disabled={deleteMenu.isPending}
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
            <CardTitle className="text-base md:text-lg">No menus yet</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Create your first menu to start adding items (e.g., Breakfast, Lunch, Dinner)
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default MenusPage;
