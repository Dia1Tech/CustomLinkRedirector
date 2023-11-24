import Joi from 'joi';

export const createSchema = Joi.object({
    code: Joi.string().required(),
    redirectUrl: Joi.string().uri().required(),
});

export const readPathSchema = Joi.object({
    code: Joi.string().required(),
});

export const updatePathSchema = Joi.object({
    code: Joi.string().required(),
});

export const updateSchema = Joi.object({
    redirectUrl: Joi.string().uri(),
    isActive: Joi.string(),
});

export const deletePathSchema = Joi.object({
    code: Joi.string().required(),
});

export const listQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).required(),
    lastEvaluatedKey: Joi.object().optional(),
});