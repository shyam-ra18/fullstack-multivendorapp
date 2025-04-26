import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@packages/error-handler";
import {
  registrationSchema,
  verifyLoginSchema,
  verifyUserSchema,
} from "./validation";
import crypto from "crypto";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "@packages/libs/prisma";

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  // const { name, email, password, phone_number, country } = data;
  const fullData = { ...data, userType };

  const result = registrationSchema.safeParse(fullData);

  if (!result.success) {
    const issues = result.error.format();
    throw new ValidationError("Validation error", issues);
  }
};

export const validateVerifyUser = (data: any) => {
  const result = verifyUserSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.format();
    throw new ValidationError("Validation error", issues);
  }
};

export const validateLoginUser = (data: any) => {
  const result = verifyLoginSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.format();
    throw new ValidationError("Validation error", issues);
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  const optLock = await redis.get(`otp_lock:${email}`); // wrong otp
  const otpSpamLock = await redis.get(`otp_spam_lock:${email}`); // trying to spam email
  const otpCooldown = await redis.get(`otp_cooldown:${email}`);

  if (optLock) {
    return next(
      new ValidationError(
        "Account is locked due to multiple attempts! try after 30 minutes"
      )
    );
  }

  if (otpSpamLock) {
    return next(
      new ValidationError(
        "Too many OTP requests , please try again after 1 hour"
      )
    );
  }

  if (otpCooldown) {
    return next(
      new ValidationError("Please wait 1 minute before requesting a new OTP!")
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`; // number of otp requests

  const otpRequestCount = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequestCount >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 60 * 60); //Lock for 1 hour
    return next(
      new ValidationError(
        "Too many OTP requests , please try again after 1 hour"
      )
    );
  }
  await redis.set(otpRequestKey, otpRequestCount + 1, "EX", 60 * 60); // Track requests for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, "Verification code", template, { name, otp });
  await redis.set(`opt:${email}`, otp, "EX", 60 * 5);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`opt:${email}`);

  if (!storedOtp) {
    throw new ValidationError("Invalid or Expired OTP!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`; // number of otp requests
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 60 * 30); // Lock for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Too many incorrect attempts. Your account is locked for 30 minutes!"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 60 * 5);
    throw new ValidationError(
      `Invalid OTP! You have ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError("Please provide email address and otp");
    }

    await verifyOtp(email, otp, next);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Please provide email address");
    }

    // Find user/seller in db
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ValidationError("User not found");
    }

    // check Otp restrictions
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    // Generate OTP and send to email
    await sendOtp(user.name, email, `forgot-password-user-mail`);

    return res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};
