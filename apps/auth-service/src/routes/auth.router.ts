import { Router } from "express";
import {
  loginUser,
  refreshToken,
  userForgotPassword,
  userRegistration,
  userResetPassword,
  verifyUser,
} from "../controllers/auth-controller";
import { verifyForgotPasswordOtp } from "../utils/auth.helper";

const router: Router = Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", verifyForgotPasswordOtp);
router.post("/user-reser-password", userResetPassword);

export default router;
