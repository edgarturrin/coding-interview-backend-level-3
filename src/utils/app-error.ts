export class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number = 500,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id: string) {
        super(
            `${resource} with id ${id} not found`,
            'NOT_FOUND',
            404
        );
    }
}

interface ValidationErrorDetail {
    field: string;
    message: string;
}

export class ValidationError extends AppError {
    public readonly errors: ValidationErrorDetail[];

    constructor(errors: ValidationErrorDetail[]) {
        super(
            'Validation error',
            'VALIDATION_ERROR',
            400
        );
        this.errors = errors;
    }
} 