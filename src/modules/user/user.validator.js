import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";
import { userGender } from "../../DB/models/user.model.js";

// validate the data
export const signUpSchema ={
    body : Joi.object({
    name : Joi.string().min(3).max(30).alphanum().required(),
    email : generalRules.email.required(),
    password : generalRules.password.required(),
    confirmPassword : Joi.string().valid(Joi.ref('password')).required(),
    phone : Joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
    age : Joi.number().min(18).max(60).integer().required(),
    gender : Joi.string().valid(userGender.male , userGender.female).required(),
  }).required(),
  headers : generalRules.headers.required(),
  file : generalRules.file.required(),
  // files: Joi.array().items(generalRules.file.required()),
}

export const signInSchema = {
  body : Joi.object({
    email : generalRules.email.required(),
    password : generalRules.password.required(),
  }).required(),
  headers : generalRules.headers.required(),
}

export const updatePasswordShema = {
  body : Joi.object({
    oldPassword : generalRules.password.required(),
    newPassword : generalRules.password.required(),
    confirmPassword : Joi.string().valid(Joi.ref('newPassword')).required(),
  }).required(),
  headers : generalRules.headers.required(),
}

export const forgotPasswordSchema = {
  body : Joi.object({
    email : generalRules.email.required(),
  }).required(),
  headers : generalRules.headers.required(),
}

export const resetPasswordSchema = {
  body : Joi.object({
    email : generalRules.email.required(),
    otp : Joi.string().pattern(/^[0-9]{6}$/).required(),
    newPassword : generalRules.password.required(),
    confirmPassword : Joi.string().valid(Joi.ref('newPassword')).required(),
  }).required(),
  headers : generalRules.headers.required(),
}

export const updateProfileSchema = {
  body : Joi.object({
    name : Joi.string().min(3).max(30).alphanum(),
    email : generalRules.email,
    phone : Joi.string().pattern(/^01[0125][0-9]{8}$/),
    age : Joi.number().min(18).max(60).integer(),
    gender : Joi.string().valid(userGender.male , userGender.female),
  }),
  headers : generalRules.headers,
}


export const freezeProfileSchema = {
  params : Joi.object({
    id : generalRules.id
  })
}

export const unFreezeProfileSchema = new Object(freezeProfileSchema)
