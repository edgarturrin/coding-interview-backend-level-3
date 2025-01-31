import { Request, ResponseToolkit } from '@hapi/hapi';
import Boom from '@hapi/boom';
import { AppError } from '../../utils/app-error';
import { log } from '../../config/logger';

export const errorHandler = (request: Request, h: ResponseToolkit) => {
    const response = request.response;

    if (response instanceof Error) {
        log.error('Error handling request', {
            error: response,
            path: request.path,
            method: request.method
        });

        if (response instanceof AppError) {
            return h.response({
                error: response.code,
                message: response.message
            }).code(response.statusCode);
        }
        if (Boom.isBoom(response)) {
            // Handle Joi validation errors
            if (response.output.statusCode === 400 && response.output.payload.error === 'Bad Request') {
                return h.response({
                    errors: [{
                        field: response.output.payload.message.split('"')[1] || 'unknown',
                        message: response.output.payload.message
                    }]
                }).code(400);
            } else {
                return h.response({
                    error: response.output.payload.error,
                    message: response.message
                }).code(response.output.statusCode);
            }
        }

        return Boom.badImplementation('An unexpected error occurred');
    }

    return h.continue;
};
