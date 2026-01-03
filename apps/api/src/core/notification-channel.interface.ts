export interface NotificationMessage {
    title?: string;
    content: string;
    url?: string;
    metadata?: Record<string, any>;
}

export interface NotificationChannel {
    /**
     * Unique channel identifier (e.g., 'telegram', 'email')
     */
    channel: string;

    /**
     * Send a notification
     */
    send(
        recipient: string,
        message: NotificationMessage,
        config?: Record<string, any>
    ): Promise<boolean>;

    /**
     * Check if the channel is configured and ready
     */
    isReady(): boolean;
}


