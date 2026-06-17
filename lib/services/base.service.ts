import { ServiceError, StellarServiceError } from '../types'

/**
 * Level 2 Architecture Sync: Base Service Abstraction
 * Provides standardized enterprise features: Logging, Error Translation, and Lifecycle hooks.
 */
export abstract class BaseService {
    protected readonly serviceName: string

    constructor(serviceName: string) {
        this.serviceName = serviceName
    }

    /**
     * Standardized error handling to map internal errors to user-friendly messages
     * as defined in issue-27.md Error Code Mapping.
     */
    protected handleError(error: any, context: string): never {
        console.error(`[${this.serviceName}] Error in ${context}:`, error)

        if (error instanceof ServiceError) {
            throw error
        }

        // Map typical network/logic errors to custom domain errors
        const message = error?.message || 'An unexpected service error occurred'
        throw new StellarServiceError(`[${this.serviceName}] ${message}`)
    }

    /**
     * Performance tracking for "Next Level" observability
     */
    protected async withPerformanceTracking<T>(
        operationName: string,
        operation: () => Promise<T>
    ): Promise<T> {
        const start = performance.now()
        try {
            return await operation()
        } finally {
            const end = performance.now()
            console.debug(`[${this.serviceName}] ${operationName} took ${(end - start).toFixed(2)}ms`)
        }
    }
}
