import { useState } from "react";
import { MdAdd, MdDelete, MdRestaurant } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { useCreateRestaurant, useDeleteRestaurant, useRestaurants } from "../hooks/useRestaurants";

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const { data: restaurants, isLoading } = useRestaurants();
  const createRestaurant = useCreateRestaurant();
  const deleteRestaurant = useDeleteRestaurant();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRestaurant.mutateAsync({ name, slug });
      toast.success("Restaurant created successfully!");
      setName("");
      setSlug("");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Failed to create restaurant:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create restaurant";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await deleteRestaurant.mutateAsync(id);
        toast.success("Restaurant deleted successfully!");
      } catch (error) {
        console.error("Failed to delete restaurant:", error);
        toast.error("Failed to delete restaurant");
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-3 md:p-8 pt-4 md:pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight">My Restaurants</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="text-sm md:text-base">
              <MdAdd className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Restaurant</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Create New Restaurant</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new restaurant to manage your menus and items.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Restaurant Name
                </Label>
                <Input
                  id="name"
                  placeholder="My Restaurant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm md:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm">
                  URL Slug
                </Label>
                <Input
                  id="slug"
                  placeholder="my-restaurant"
                  value={slug}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-");
                    setSlug(cleaned);
                  }}
                  className="text-sm md:text-base"
                  required
                />
                <p className="text-xs md:text-sm text-muted-foreground">This will be used in your restaurant's URL</p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRestaurant.isPending} className="text-sm w-full sm:w-auto">
                  {createRestaurant.isPending ? "Creating..." : "Create Restaurant"}
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
                <Skeleton className="h-3 w-[100px] md:w-[150px]" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-9 md:h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : restaurants && restaurants.length > 0 ? (
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MdRestaurant className="h-4 w-4 md:h-5 md:w-5" />
                  {restaurant.name}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">/{restaurant.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                <Button className="w-full text-sm" onClick={() => navigate(`/restaurants/${restaurant.id}/categories`)}>
                  Manage Categories
                </Button>
                <Button
                  variant="destructive"
                  className="w-full text-sm"
                  onClick={() => handleDelete(restaurant.id)}
                  disabled={deleteRestaurant.isPending}
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
          <CardHeader>
            <CardTitle>No restaurants yet</CardTitle>
            <CardDescription>Create your first restaurant to get started!</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default RestaurantsPage;
