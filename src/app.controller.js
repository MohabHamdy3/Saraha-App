import path from "path"
import dotenv from "dotenv"
dotenv.config({path : path.resolve("src/config/.env")})
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
import connectDB from "./DB/connectionDB.js";
import messageRouter from "./modules/message/message.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalErrorHandling } from "./middleware/globalErrorHandling.js";
import cors from "cors";    
import morgan from "morgan";
import helmet from "helmet";
import OTPLimiter from "./middleware/OTPexpiry.js";

const whitelist = [process.env.CLIENT_URL , process.env.ADMIN_URL , process.env.WEB_CLIENT_URL,undefined ]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const bootstrap = ()=> {
    app.use(helmet());
    app.use(OTPLimiter);
    app.use(cors(corsOptions));
    app.use(express.json());
    connectDB();
    app.use("uploads", express.static("uploads"));
    app.use("/users", userRouter);
    app.use("/messages", messageRouter);
    app.use("/*demo" , (req, res, next) => {
        throw new Error(`Route not found: ${req.originalUrl}` , {
            cause : 404,
        })
    })
    app.use(morgan("dev")); 

    app.use(globalErrorHandling);
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default bootstrap;