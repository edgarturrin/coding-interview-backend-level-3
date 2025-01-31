import Joi from '@hapi/joi';

export const createItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Field "name" is required',
        'string.min': 'Field "name" must be at least 1 character long',
        'string.max': 'Field "name" must be less than or equal to 100 characters',
        'any.required': 'Field "name" is required'
    }),
    price: Joi.number().integer().min(0).required().messages({
        'number.base': 'Field "price" must be a number',
        'number.integer': 'Field "price" must be an integer',
        'number.min': 'Field "price" cannot be negative',
        'any.required': 'Field "price" is required'
    })
}).messages({
    'object.unknown': 'Field "{#label}" is not allowed'
});

export const updateItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).messages({
        'string.empty': 'Field "name" is required',
        'string.min': 'Field "name" must be at least 1 character long',
        'string.max': 'Field "name" must be less than or equal to 100 characters'
    }),
    price: Joi.number().integer().min(0).messages({
        'number.base': 'Field "price" must be a number',
        'number.integer': 'Field "price" must be an integer',
        'number.min': 'Field "price" cannot be negative'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update',
    'object.unknown': 'Field "{#label}" is not allowed'
});