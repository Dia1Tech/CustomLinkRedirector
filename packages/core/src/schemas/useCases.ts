import Joi from "joi";

export const redirectPathSchema = Joi.object({
    code: Joi.string().required(),
});