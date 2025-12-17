import { Router } from "express";
import { adminRouter } from "./admin.routes.ts";
import { authRouter } from "./auth.routes.ts";
import { categoriesRouter } from "./categories.routes.ts";
import { menuItemsRouter } from "./menu-items.routes.ts";
import { publicRouter } from "./public.routes.ts";
import { restaurantsRouter } from "./restaurants.routes.ts";
import { uploadRouter } from "./upload.routes.ts";

export const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/restaurants", restaurantsRouter);
v1Router.use("/categories", categoriesRouter);
v1Router.use("/items", menuItemsRouter);
v1Router.use("/public", publicRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/upload", uploadRouter);
