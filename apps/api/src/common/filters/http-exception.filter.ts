import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: 'Internal server error' };

        // Extract error message string if possible
        const errorMessage =
            typeof message === 'string'
                ? message
                : (message as any).message || 'Unknown error';

        // Log the error
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status} - ${errorMessage}`,
                exception instanceof Error ? exception.stack : '',
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url} - ${status} - ${errorMessage}`,
            );
        }

        // Standardized error response
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: errorMessage,
            error:
                exception instanceof HttpException
                    ? (message as any).error || exception.name
                    : 'Internal Server Error',
        };

        response.status(status).send(errorResponse);
    }
}
