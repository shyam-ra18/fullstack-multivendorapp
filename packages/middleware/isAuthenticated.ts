import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.access_Token ?? req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized Access! Token missing." });
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
      return res
        .status(401)
        .json({ message: "Unauthorized Access! Invalid token." });
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!account) {
      return res.status(401).json({ message: "Account not found." });
    }

    req.user = account;
    return next();
  } catch (error) {
    //   return res.status(401).json({ message: "Unauthorized Access! Token expired or Invalid." });
    return next(error);
  }
};
