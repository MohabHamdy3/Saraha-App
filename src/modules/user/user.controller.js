import { Router } from "express";
import { signUp, loginUser, getProfile, confirmEmail, logoutUser, refreshToken, updatePassword, forgetPassword, resetPassword, updateProfile, getProfileData, freezeProfile, unFreezeProfile, loginwithGoogle } from "./user.service.js";
import { forgotPasswordSchema, freezeProfileSchema, resetPasswordSchema, signInSchema, signUpSchema, updatePasswordShema, updateProfileSchema } from "./user.validator.js";
import { validation ,authorization , authentication } from "../../midddleware/index.js";
import { userRoles } from "../../DB/models/user.model.js";
import { allowedExtensions, MulterHost } from "../../midddleware/multer.js";

const userRouter = Router();

userRouter.post("/signup",MulterHost({ customPath : "users" , customExtensions : [...allowedExtensions.images, ...allowedExtensions.documents]}).single("attachment"), validation(signUpSchema), signUp );
userRouter.patch("/confirmEmail/:token" ,confirmEmail);
userRouter.post("/login",validation(signInSchema), loginUser );
userRouter.post("/loginWithGoogle", loginwithGoogle );
userRouter.get("/profile" ,authentication,authorization([userRoles.user]), getProfile);
userRouter.get("/profile/:id" , getProfileData);
userRouter.post("/logout", authentication, authorization([userRoles.user]), logoutUser);
userRouter.post("/refreshToken", refreshToken);
userRouter.patch("/updatePassword" , validation(updatePasswordShema),authentication, updatePassword); 
userRouter.patch("/forgetPassword" , validation(forgotPasswordSchema), forgetPassword); 
userRouter.patch("/resetPassword" , validation(resetPasswordSchema), resetPassword);
userRouter.patch("/updateProfile" , validation(updateProfileSchema) , authentication, authorization([userRoles.user]), updateProfile);
userRouter.patch("/freeze/{:id}" , validation(freezeProfileSchema) , authentication ,  freezeProfile);
userRouter.patch("/unFreeze/{:id}" , validation(freezeProfileSchema) , authentication, unFreezeProfile);

export default userRouter;
    