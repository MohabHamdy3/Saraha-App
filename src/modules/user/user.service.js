import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import userModel, {
  userProvider,
  userRoles,
} from "../../DB/models/user.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import {
  generateToken,
  verifyToken,
  Encrypt,
  Decrypt,
  Hash,
  compare,
  eventEmitter,
} from "../../utils/index.js";
import { customAlphabet, nanoid } from "nanoid";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../../utils/cloudinary/index.js";

export const signUp = async (req, res, next) => {
  const { name, email, password, phone, age, gender } = req.body;

  // Check if user email already exists
  const existingUser = await userModel.findOne({ email });
  console.log(existingUser);

  if (existingUser) {
    throw new Error("User with this email already exists", {
      cause: 400,
    });
  }
  // if(!req?.file){
  //   throw new Error("profile picture is required" , {
  //     cause : 400,
  //   })
  // }
  // if (!req?.files?.length) {
  //   throw new Error("profile picture is required", {
  //     cause: 400,
  //   });
  // }

  // // Hash the password
  const hashedPassword = await Hash({
    plainText: password,
    SIGNATURE: +process.env.SALT_ROUNDS,
  });
  // // Encrypt the phone number
  const encryptedPhone = await Encrypt({
    plainText: phone,
    SECRET_KEY: process.env.SECRET_KEY,
  });
  // send link to confirm email
  eventEmitter.emit("sendEmail", { email });

// for single of attachment
  const { path } = req.file;
  const uploadResult = await cloudinary.uploader.upload(path, {
    resource_type: "auto",
    folder: "users",
    use_filename: true,
    unique_filename: false,
  });
  const {secure_url , public_id} = uploadResult;

// for array of attachments
  // let uploadedImages = [];
  // let arrPath = [];

  // for (const file of req.files) {
  //   const uploadResult = await cloudinary.uploader.upload(file.path, {
  //     resource_type: "auto",
  //     folder: "users",
  //     use_filename: true,
  //     unique_filename: false,
  //   });
  //   uploadedImages.push(uploadResult.secure_url); // or the full object if you prefer
  //   arrPath.push(file.path);
  // }

  // Create new user
  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
    age,
    gender,
    coverImage: "",
    image: [secure_url , public_id] ,
  });

  return res.status(201).json({
    message: "User created successfully",
    status: 201,
    data: newUser,
  });
};

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  if (!token) {
    throw new Error("token not found", {
      cause: 401,
    });
  }

  const decoded = await verifyToken({
    token,
    SIGNATURE: process.env.SIGNATURE,
  });
  const user = await userModel.findOne({
    email: decoded.email,
    confirmed: false,
  });
  if (!user) {
    throw new Error("user not exist or already confirmed", {
      cause: 404,
    });
  }
  user.confirmed = true;
  await user.save();
};
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  // Find user by email
  const user = await userModel.findOne({ email, confirmed: true });
  if (!user) {
    throw new Error("Invalid email or not confirmed yet", {
      cause: 400,
    });
  }
  // Check password
  const isMatch = await compare({
    plainText: password,
    cipherText: user.password,
  });
  if (!isMatch) {
    throw new Error("Invalid password", {
      cause: 400,
    });
  }
  // Generate JWT token

  const access_token = await generateToken({
    payload: { id: user._id, email: email },
    SIGNATURE:
      user.role == userRoles.admin
        ? process.env.ACCESS_TOKEN_ADMIN
        : process.env.ACCESS_TOKEN_USER,
    options: { expiresIn: "1h", jwtid: nanoid() },
  });
  const refresh_token = await generateToken({
    payload: { id: user._id, email: email },
    SIGNATURE:
      user.role == userRoles.admin
        ? process.env.REFRESH_TOKEN_ADMIN
        : process.env.REFRESH_TOKEN_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });
  return res.status(200).json({
    message: "Login successful",
    status: 200,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
      },
      access_token,
      refresh_token,
    },
  });
};

export const loginwithGoogle = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client(process.env.WEB_CLIENT_ID);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { email, email_verified, picture, name } = await verify();
  // Find user by email
  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({
      name,
      email,
      image: picture,
      confirmed: email_verified,
      provider: userProvider.google,
    });
  }
  if (user.provider !== userProvider.google) {
    throw new Error("User not found , please login with email", {
      cause: 404,
    });
  }

  // Generate JWT token
  const access_token = await generateToken({
    payload: { id: user._id, email: email },
    SIGNATURE:
      user.role == userRoles.admin
        ? process.env.ACCESS_TOKEN_ADMIN
        : process.env.ACCESS_TOKEN_USER,
    options: { expiresIn: "1h", jwtid: nanoid() },
  });
  const refresh_token = await generateToken({
    payload: { id: user._id, email: email },
    SIGNATURE:
      user.role == userRoles.admin
        ? process.env.REFRESH_TOKEN_ADMIN
        : process.env.REFRESH_TOKEN_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });
  return res.status(200).json({
    message: "Login successful",
    status: 200,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
      },
      access_token,
      refresh_token,
    },
  });
};

// get profile for the owner user
export const getProfile = async (req, res, next) => {
  // Find user by id
  const user = await userModel.findById(req.user.id);
  if (!user) {
    throw new Error("User not found", {
      cause: 404,
    });
  }

  // // decrypt the phone number
  const decryptedPhone = await Decrypt({
    cipherText: user.phone,
    SECRET_KEY: process.env.SECRET_KEY,
  });
  // Return user details
  return res.status(200).json({
    message: "User retrieved successfully",
    status: 200,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: decryptedPhone,
      age: user.age,
    },
  });
};

// get profile for users
export const getProfileData = async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel
    .findById(id)
    .select("name email age gender image");
  if (!user) {
    throw new Error("User not found", {
      cause: 404,
    });
  }
  return res.status(200).json({
    message: "User retrieved successfully",
    status: 200,
    data: user,
  });
};

export const logoutUser = async (req, res, next) => {
  const revokeToken = await revokeTokenModel.create({
    tokenId: req.decoded.jti,
    expiredAt: req.decoded.exp,
  });

  return res.status(200).json({
    message: "Logout successful",
    status: 200,
    data: {
      revokeToken,
    },
  });
};

export const refreshToken = async (req, res, next) => {
  const rawHeader = req.headers.token || req.headers.authorization;
  const [prefix, token] = rawHeader?.split(" ") || [];
  if (!token || !prefix) {
    throw new Error("Unauthorized", {
      cause: 401,
    });
  }
  let signature = "";
  if (prefix == "Bearer") {
    signature = process.env.REFRESH_TOKEN_USER;
  } else if (prefix == "admin") {
    signature = process.env.REFRESH_TOKEN_ADMIN;
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
  // Generate JWT token
  const access_token = await generateToken({
    payload: { id: user._id, email: user.email },
    SIGNATURE:
      user.role == userRoles.admin
        ? process.env.ACCESS_TOKEN_ADMIN
        : process.env.ACCESS_TOKEN_USER,
    options: { expiresIn: "1h", jwtid: nanoid() },
  });
  const refresh_token = await generateToken({
    payload: { id: user._id, email: user.email },
    SIGNATURE:
      user.role == userRoles.admin
        ? process.env.REFRESH_TOKEN_ADMIN
        : process.env.REFRESH_TOKEN_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  return res.status(200).json({
    message: "Login successful",
    status: 200,
    data: {
      access_token,
      refresh_token,
    },
  });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  console.log("User in updatePassword:", req.user);

  const comparedPassword = await compare({
    plainText: oldPassword,
    cipherText: req.user.password,
  });

  if (!comparedPassword) {
    throw new Error("old password is incorrect", {
      cause: 400,
    });
  }
  if (newPassword !== confirmPassword) {
    throw new Error("new password and confirm password does not match", {
      cause: 400,
    });
  }

  const hashedPassword = await Hash({
    plainText: newPassword,
    SIGNATURE: +process.env.SALT_ROUNDS,
  });
  req.user.password = hashedPassword;
  await req.user.save();
  await revokeTokenModel.create({
    tokenId: req?.decoded?.jti,
    expiredAt: req?.decoded?.exp,
  });
  return res.status(200).json({
    message: "Password updated successfully",
    status: 200,
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("user not found", {
      cause: 404,
    });
  }
  // create otp
  const otp = customAlphabet("1234567890", 6)();

  eventEmitter.emit("forgetPassword", { email, otp });

  const hashedOtp = await Hash({
    plainText: otp,
    SIGNATURE: +process.env.SALT_ROUNDS,
  });
  user.otp = hashedOtp;
  await user.save();

  return res.status(200).json({
    message: "Otp sent successfully",
    status: 200,
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  const user = await userModel.findOne({ email, otp: { $exists: true } });
  if (!user) {
    throw new Error("user not found with otp", {
      cause: 404,
    });
  }

  const comparedOtp = await compare({ plainText: otp, cipherText: user.otp });
  if (!comparedOtp) {
    throw new Error("otp is incorrect", {
      cause: 400,
    });
  }
  if (newPassword !== confirmPassword) {
    throw new Error("new password and confirm password does not match", {
      cause: 400,
    });
  }

  const hashedPassword = await Hash({
    plainText: newPassword,
    SIGNATURE: +process.env.SALT_ROUNDS,
  });
  await user.updateOne({ password: hashedPassword, $unset: { otp: "" } });
  return res.status(200).json({
    message: "Password updated successfully",
    status: 200,
  });
};

export const updateProfile = async (req, res, next) => {
  const { name, email, phone, age, gender } = req.body;
  if (name) req.user.name = name;
  if (age) req.user.age = age;
  if (gender) req.user.gender = gender;

  if (phone) {
    const encryptedPhone = await Encrypt({
      plainText: phone,
      SECRET_KEY: process.env.SECRET_KEY,
    });
    req.user.phone = encryptedPhone;
  }
  if (email) {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists", {
        cause: 400,
      });
    }
    // send link to confirm email
    eventEmitter.emit("sendEmail", { email });
    req.user.email = email;
    req.user.confirmed = false;
  }
  await req.user.save();
  return res.status(200).json({
    message: "Profile updated successfully",
    status: 200,
    data: req.user,
  });
};

export const freezeProfile = async (req, res, next) => {
  const { id } = req.params;

  if (id && req.user.role !== userRoles.admin) {
    throw new Error("You are not authorized to perform this action", {
      cause: 403,
    });
  }

  const user = await userModel.updateOne(
    {
      _id: id || req.user.id,
      isFrozen: { $exists: false },
    },
    {
      isFrozen: true,
      frozenBy: id || req.user.id,
    },
    {
      $inc: { __v: 1 },
    }
  );

  return res.status(200).json({
    message: "Profile frozen successfully",
    status: 200,
    data: user,
  });
};

export const unFreezeProfile = async (req, res, next) => {
  const { id } = req.params;

  if (id && req.user.role !== userRoles.admin) {
    throw new Error("You are not authorized to perform this action", {
      cause: 403,
    });
  }

  const user = await userModel.updateOne(
    {
      _id: id || req.user.id,
      isFrozen: { $exists: true },
    },
    {
      $unset: { isFrozen: "" },
      $unset: { frozenBy: "" },
    },
    {
      $inc: { __v: 1 },
    }
  );

  return res.status(200).json({
    message: "Profile unfrozen successfully",
    status: 200,
    data: user,
  });
};


export const updateProfileImage = async (req, res, next) => {
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path, {
      folder: "users/profileImage",
      allowed_formats: ["jpg", "png", "jpeg"],
    });
    if (!secure_url || !public_id) {
      throw new Error("Failed to upload image", {
        cause: 400,
      });
    }
    const user = await userModel.findByIdAndUpdate(
      { _id: req.user.id },
      {
        image: { secure_url, public_id },
      }
    );
    if (!user) {
      throw new Error("Failed to update profile image", {
        cause: 400,
      });
    }
    await cloudinary.uploader.destroy(user.image.public_id);
    return res.status(200).json({
      message: "Profile image updated successfully",
      status: 200,
      user,
      data: user,
      secure_url,
      public_id,
    });
};