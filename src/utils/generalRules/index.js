import Joi from "joi"
import { Types } from "mongoose"


export const customId = (value , helper) => {
    const data = Types.ObjectId.isValid(value)
    if (!data) {
        return helper.message('Invalid ID')
    }
    return value
}


export const generalRules = {
    id : Joi.string().custom(customId),
    email : Joi.string().email({tlds : {allow : true , message : 'Email must be a valid email address' }}),
    password : Joi.string().min(6).max(1024),
    headers: Joi.object({
        authorization : Joi.string().required(),
        host : Joi.string().required(),
        "user-agent" : Joi.string().required(),
        "accept" : Joi.string().required(),
        "accept-encoding" : Joi.string().required(),
        "connection" : Joi.string().required(),
        "postman-token" : Joi.string().required(),
        "cache-control" : Joi.string().required(),
        "content-type" : Joi.string().required(),
        "content-length" : Joi.string().required(),
      }),
    file : Joi.object({
        path : Joi.string().required(),
        filename : Joi.string().required(),
        mimetype : Joi.string().required(),
        size : Joi.number().positive().required(),
        destination : Joi.string().required(),
        originalname : Joi.string().required(),
        encoding : Joi.string().required(),
        fieldname : Joi.string().required()
    }).messages({
        'any.required' : 'File is required'
    })
}