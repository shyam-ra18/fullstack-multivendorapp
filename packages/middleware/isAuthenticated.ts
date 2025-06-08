import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      req.cookies["access_Token"] || req.cookies["seller_access_Token"];
    const headerToken = req.headers.authorization?.split(" ")[1];
    const token = accessToken || headerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access! Token missing.",
      });
    }

    // Verify token
    const decoded: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_JWT_SECRET_KEY as string
    ) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access! Invalid token.",
      });
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account;
    }

    if (!account) {
      return res
        .status(401)
        .json({ success: false, message: "Account not found." });
    }

    req.role = decoded.role;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Unauthorized Access! Token expired, invalid, or internal error.",
      error: (error as Error).message,
    });
  }
};
