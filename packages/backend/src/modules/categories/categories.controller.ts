import type { CategoriesService } from "@modules/categories/categories.service";
import type { NextFunction, Request, Response } from "express";

export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;
      const ownerId = req.user?.userId;
      const categories = await this.categoriesService.getAllCategories(restaurantId, ownerId);
      res.status(200).json({ status: "success", data: { categories } });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const category = await this.categoriesService.getCategoryById(id, ownerId);
      res.status(200).json({ status: "success", data: { category } });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;
      const ownerId = req.user?.userId;
      const category = await this.categoriesService.createCategory(restaurantId, ownerId, req.body);
      res.status(201).json({ status: "success", data: { category } });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const category = await this.categoriesService.updateCategory(id, ownerId, req.body);
      res.status(200).json({ status: "success", data: { category } });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      await this.categoriesService.deleteCategory(id, ownerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
