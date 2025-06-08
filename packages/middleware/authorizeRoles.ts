import { UnauthorizedError } from "@packages/error-handler";
import { NextFunction, Response } from "express";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.role !== "seller") {
      return next(
        new UnauthorizedError("Access denied! Seller account required.")
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.role !== "user") {
      return next(
        new UnauthorizedError("Access denied! User account required.")
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
