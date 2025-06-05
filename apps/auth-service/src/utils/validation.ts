import z from "zod";

const emailValidationRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w{2,3})+$/;

// Base schema
const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().regex(emailValidationRegex, "Invalid email format"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["user", "seller"]),
});

// Extend for "seller"
const sellerExtras = z.object({
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
});

// Discriminated union for conditional logic
export const registrationSchema = z.discriminatedUnion("userType", [
  baseSchema.extend({ userType: z.literal("user") }),
  baseSchema.extend({ userType: z.literal("seller") }).merge(sellerExtras),
]);

export const verifyUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().regex(emailValidationRegex, "Invalid email format"),
  password: z.string().min(1, "Password is required"),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const verifyLoginSchema = z.object({
  email: z.string().regex(emailValidationRegex, "Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const verifySellerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().regex(emailValidationRegex, "Invalid email format"),
  password: z.string().min(1, "Password is required"),
  otp: z.string().length(4, "OTP must be 4 digits"),
  phone: z.string(),
  country: z.string(),
});

export const verifyShopSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  address: z.string().min(1, "Address is required"),
  openingHours: z.string().min(1, "Opening hours is required"),
  website: z.string().min(1, "Website is required"),
  category: z.string().min(1, "Category is required"),
  sellerId: z.string().min(1, "Seller ID is required"),
});
