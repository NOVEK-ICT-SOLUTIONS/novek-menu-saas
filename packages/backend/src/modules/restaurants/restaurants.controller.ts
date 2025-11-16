import type { RestaurantsService } from "@modules/restaurants/restaurants.service";
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from "@modules/restaurants/restaurants.types";
import type { NextFunction, Request, Response } from "express";

export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.userId;
      const restaurants = await this.restaurantsService.getAllRestaurants(ownerId);
      res.status(200).json({ status: "success", data: { restaurants } });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const restaurant = await this.restaurantsService.getRestaurantById(id, ownerId);
      res.status(200).json({ status: "success", data: { restaurant } });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const restaurant = await this.restaurantsService.getRestaurantBySlug(slug);
      
      // Track QR scan
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get("user-agent");
      await this.restaurantsService.trackQRScan(restaurant.id, ipAddress, userAgent);
      
      res.status(200).json({ status: "success", data: { restaurant } });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.userId;
      const data: CreateRestaurantRequest = req.body;
      const restaurant = await this.restaurantsService.createRestaurant(ownerId, data);
      res.status(201).json({ status: "success", data: { restaurant } });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      const data: UpdateRestaurantRequest = req.body;
      const restaurant = await this.restaurantsService.updateRestaurant(id, ownerId, data);
      res.status(200).json({ status: "success", data: { restaurant } });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;
      await this.restaurantsService.deleteRestaurant(id, ownerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user?.userId;
      const stats = await this.restaurantsService.getOwnerStats(ownerId);
      res.status(200).json({ status: "success", data: stats });
    } catch (error) {
      next(error);
    }
  };
}
