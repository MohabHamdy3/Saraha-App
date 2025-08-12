import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validator.js";
import { validation ,authorization , authentication } from "../../middleware/index.js";
import { userRoles } from "../../DB/models/user.model.js";
import { allowedExtensions, MulterHost } from "../../middleware/multer.js";
import messageRouter from "../message/message.controller.js";
import helmet from "helmet";
import OTPLimiter from "../../middleware/OTPexpiry.js";

const userRouter = Router({caseSensitive: true});
userRouter.use(helmet());
userRouter.use("/:id/messages", messageRouter);
userRouter.post("/signup",MulterHost({ customPath : "users" , customExtensions : [...allowedExtensions.images, ...allowedExtensions.documents]}).single("attachment"), validation(UV.signUpSchema), US.signUp );
userRouter.patch("/confirmEmail/:token" ,US.confirmEmail);
userRouter.post("/login",validation(UV.signInSchema), US.loginUser );
userRouter.post("/loginWithGoogle", US.loginwithGoogle );
userRouter.get("/profile" ,authentication , authorization([userRoles.user]), US.getProfile);
userRouter.get("/profile/:id" , US.getProfileData);
userRouter.post("/logout", authentication, authorization([userRoles.user]), US.logoutUser);
userRouter.post("/refreshToken", US.refreshToken);
userRouter.patch("/updatePassword" ,OTPLimiter ,validation(UV.updatePasswordShema),authentication, US.updatePassword);
userRouter.patch("/forgetPassword" ,OTPLimiter ,validation(UV.forgotPasswordSchema), US.forgetPassword);
userRouter.patch("/resetPassword" ,OTPLimiter ,validation(UV.resetPasswordSchema), US.resetPassword);
userRouter.patch("/updateProfile" , validation(UV.updateProfileSchema) , authentication, authorization([userRoles.user]), US.updateProfile);
userRouter.patch("/updateProfileImage" , authentication, MulterHost({ customPath : "users" , customExtensions : [...allowedExtensions.images, ...allowedExtensions.documents]}).single("attachment") ,validation(UV.updateProfileImageSchema), US.updateProfileImage);
userRouter.patch("/freeze/{:id}" , validation(UV.freezeProfileSchema) , authentication ,  US.freezeProfile);
userRouter.patch("/unFreeze/{:id}" , validation(UV.freezeProfileSchema) , authentication, US.unFreezeProfile);

export default userRouter;
    