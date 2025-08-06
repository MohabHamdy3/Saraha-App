import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/token/verifyToken.js";
import userModel from "../DB/models/user.model.js";
import revokeTokenModel from "../DB/models/revokeToken.model.js";

export const authentication = async (req, res, next) => {
  const rawHeader = req.headers.token || req.headers.authorization;
  const [prefix, token] = rawHeader?.split(" ") || [];
  if (!token || !prefix) {
    throw new Error("Unauthorized", {
      cause: 401,
    });
  }
  let signature = "";
  if (prefix == "Bearer") {
    signature = process.env.ACCESS_TOKEN_USER;
  } else if (prefix == "admin") {
    signature = process.env.ACCESS_TOKEN_ADMIN;
  } else {
    throw new Error("Invalid prefix token", {
      cause: 401,
    });
  }
  const decoded = await verifyToken({ token, SIGNATURE: signature });
  if (!decoded?.email) {
    throw new Error("invalid token , please login again ", {
      cause: 401,
    });
  }
  const revoked = await revokeTokenModel.findOne({ tokenId: decoded.jti });
  if (revoked) {
    throw new Error("token is revoked", {
      cause: 401,
    });
  }
  const user = await userModel.findOne({ email: decoded.email });
  if (!user) {
    throw new Error("user not exist", {
      cause: 401,
    });
  }
  req.user = user;
  req.decoded = decoded;
  return next();
};

