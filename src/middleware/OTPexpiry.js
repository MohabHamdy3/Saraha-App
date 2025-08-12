import rateLimit from "express-rate-limit";


const OTPLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Too many OTP requests from this IP, please try again later" },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      status: "fail",
      message: options.message
    });
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});


export default OTPLimiter;
