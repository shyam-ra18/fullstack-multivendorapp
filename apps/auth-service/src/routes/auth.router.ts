import { Router } from "express";
import {
  getLoggedInUserInfo,
  loginUser,
  refreshToken,
  userForgotPassword,
  userRegistration,
  userResetPassword,
  verifyUser,
} from "../controllers/auth-controller";
import { verifyForgotPasswordOtp } from "../utils/auth.helper";
import { isAuthenticated } from "@packages/middleware/isAuthenticated";

const router: Router = Router();

// Post Routes
router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", verifyForgotPasswordOtp);
router.post("/user-reset-password", userResetPassword);

// Get Routes
router.get("/logged-in-user", isAuthenticated, getLoggedInUserInfo);

export default router;
