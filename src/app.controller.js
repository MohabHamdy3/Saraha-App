import connectDB from "./DB/connectionDB.js";
import messageRouter from "./modules/message/message.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalErrorHandling } from "./midddleware/globalErrorHandling.js";
import cors from "cors";    

var whitelist = [process.env.CLIENT_URL , process.env.ADMIN_URL , process.env.WEB_CLIENT_URL,undefined ]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const bootstrap = (app , express)=> {
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

    app.use(globalErrorHandling)
}

export default bootstrap;