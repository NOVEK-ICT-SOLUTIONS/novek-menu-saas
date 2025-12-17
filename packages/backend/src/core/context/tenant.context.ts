import { AsyncLocalStorage } from "node:async_hooks";

interface TenantContext {
  userId: string;
  email: string;
  role: string;
}

const asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

export const tenantContext = {
  run: <T>(context: TenantContext, fn: () => T): T => {
    return asyncLocalStorage.run(context, fn);
  },

  runAsync: <T>(context: TenantContext, fn: () => Promise<T>): Promise<T> => {
    return asyncLocalStorage.run(context, fn);
  },

  get: (): TenantContext | undefined => {
    return asyncLocalStorage.getStore();
  },

  getOrThrow: (): TenantContext => {
    const context = asyncLocalStorage.getStore();
    if (!context) {
      throw new Error("Tenant context not initialized - this endpoint requires authentication");
    }
    return context;
  },

  getUserId: (): string => {
    return tenantContext.getOrThrow().userId;
  },

  getEmail: (): string => {
    return tenantContext.getOrThrow().email;
  },

  getRole: (): string => {
    return tenantContext.getOrThrow().role;
  },

  isAuthenticated: (): boolean => {
    return asyncLocalStorage.getStore() !== undefined;
  },

  isAdmin: (): boolean => {
    const context = asyncLocalStorage.getStore();
    return context?.role === "ADMIN";
  },
} as const;
