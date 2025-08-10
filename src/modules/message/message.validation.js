import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";

export const createMessageSchema = {
    body: Joi.object().keys({
        content: Joi.string().min(2).max(500).required(),
        userId: generalRules.id.required()
    }).required(),
    headers : generalRules.headers.required()
}

export const getMessageSchema = {
    params: Joi.object().keys({
        id: generalRules.id.required()
    }).required()
}