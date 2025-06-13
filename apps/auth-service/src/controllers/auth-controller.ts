import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateLoginUser,
  validateRegistrationData,
  validateVerifySeller,
  validateVerifyShop,
  validateVerifyUser,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ValidationError } from "@packages/error-handler";
import { setCookie } from "../utils/cookies/setCookie";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
// <---------- USER CONTROLLERS ---------->

// Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    return res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};
// Verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    validateVerifyUser(req.body);

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("User already exists with this email!");
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};
// Login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    validateLoginUser(req.body);

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ValidationError("User not found!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid email or password!");
    }

    // Generate access and refresh token
    const accessToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      process.env.ACCESS_TOKEN_JWT_SECRET_KEY as string,
      {
        expiresIn: "30m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      process.env.REFRESH_TOKEN_JWT_SECRET_KEY as string,
      {
        expiresIn: "7d",
      }
    );

    // Store the refresh & access token in the httpOnly secure cookies
    setCookie(res, "access_Token", accessToken);
    setCookie(res, "refresh_Token", refreshToken);

    return res.status(200).json({
      message: "User logged in successfully!",
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};
// Refresh token user
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_Token;
    if (!refreshToken) {
      throw new ValidationError("Unauthorized! no refresh token found.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_JWT_SECRET_KEY as string
    ) as { id: string; role: string };

    if (!decoded || !decoded?.id || !decoded?.role) {
      throw new ValidationError("Forbidden! Invalid refresh token.");
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new ValidationError("Forbidden! User/Seller not found.");
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_JWT_SECRET_KEY as string,
      { expiresIn: "30m" }
    );
    setCookie(res, "access_Token", newAccessToken);

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};
// Get logged in user info
export const getLoggedInUserInfo = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req?.user;
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};
// User forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await handleForgotPassword(req, res, next, "user");
  } catch (error) {
    return next(error);
  }
};
// Verify forgot password OTP
export const verifyUserForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyForgotPasswordOtp(req, res, next);
  } catch (error) {
    return next(error);
  }
};
// User reset password
export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      throw new ValidationError(
        "Please provide email address and new password"
      );
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ValidationError("User not found");
    }

    // Compare new password with old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      throw new ValidationError("New password cannot be same as old password");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: {
        password: hashedNewPassword,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    return next(error);
  }
};

// <---------- SELLER CONTROLLERS ---------->

// Seller registration
export const sellerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    return res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    next(error);
  }
};
// Verify seller with otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone, country } = req.body;
    validateVerifySeller(req.body);

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phone,
        country,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, openingHours, website, category, sellerId } =
      req.body;
    validateVerifyShop(req.body);

    const shopData: any = {
      name,
      bio,
      address,
      openingHours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    return res
      .status(201)
      .json({ success: true, shop, message: "Shop created!" });
  } catch (error) {
    next(error);
  }
};
// Create stripe connect account link
export const stripeConnectAccountLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      throw new ValidationError("Seller id is required!");
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      throw new ValidationError("Seller not found!");
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: seller.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: process.env.STRIPE_CONNECT_REDIRECT_URL as string,
      return_url: process.env.STRIPE_CONNECT_REDIRECT_URL as string,
      type: "account_onboarding",
    });

    return res.status(200).json({ success: true, url: accountLink.url });
  } catch (error) {
    next(error);
  }
};
// Login Seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    validateLoginUser(req.body);

    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      throw new ValidationError("Seller not found!");
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password!);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid email or password!");
    }

    // Generate access and refresh token
    const accessToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      process.env.ACCESS_TOKEN_JWT_SECRET_KEY as string,
      {
        expiresIn: "30m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      process.env.REFRESH_TOKEN_JWT_SECRET_KEY as string,
      {
        expiresIn: "7d",
      }
    );

    // Store the refresh & access token in the httpOnly secure cookies
    setCookie(res, "seller_access_Token", accessToken);
    setCookie(res, "seller_refresh_Token", refreshToken);

    return res.status(200).json({
      message: "Seller logged in successfully!",
      success: true,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
// Get logged in Seller info
export const getLoggedInSellerInfo = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req?.seller;
    return res.status(200).json({ success: true, seller });
  } catch (error) {
    return next(error);
  }
};
