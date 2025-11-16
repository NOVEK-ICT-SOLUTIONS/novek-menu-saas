import type { MenusService } from "@modules/menus/menus.service";
import type { NextFunction, Request, Response } from "express";

export class MenusController {
  constructor(private menusService: MenusService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;
      const ownerId = req.user?.userId;
      const menus = await this.menusService.getAllMenus(restaurantId, ownerId);
      res.status(200).json({ status: "success", data: { menus } });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const menu = await this.menusService.getMenuById(id, ownerId);
      res.status(200).json({ status: "success", data: { menu } });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { restaurantId } = req.params;
      const ownerId = req.user?.userId;
      const menu = await this.menusService.createMenu(restaurantId, ownerId, req.body);
      res.status(201).json({ status: "success", data: { menu } });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const menu = await this.menusService.updateMenu(id, ownerId, req.body);
      res.status(200).json({ status: "success", data: { menu } });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      await this.menusService.deleteMenu(id, ownerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
