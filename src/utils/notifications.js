import logger from './logger.js';

/**
 * Supported notification channels.
 * New channels can be added without breaking consumers.
 */
export const NotificationChannel = Object.freeze({
    USER: 'user',
    SYSTEM: 'system',
});

/**
 * Dispatches a notification event.
 * This is intentionally minimal and acts as a stable abstraction
 * for future integrations (email, push, in-app, queues, etc).
 */
export const notify = async ({
    channel,
    userId = null,
    event,
    payload = {},
}) => {
    if (!channel || !event) {
        logger.warn('Notification skipped due to missing channel or event', {
            channel,
            event,
            userId,
        });
        return;
    }

    logger.info('Notification dispatched', {
        channel,
        event,
        userId,
        payload,
    });
};

/**
 * Convenience helper for user-scoped notifications.
 */
export const notifyUser = async (userId, event, payload = {}) =>
    notify({
        channel: NotificationChannel.USER,
        userId,
        event,
        payload,
    });
