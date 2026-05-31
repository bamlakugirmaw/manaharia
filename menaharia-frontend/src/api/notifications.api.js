import { api, unwrap } from '../lib/api';

/**
 * Notifications API  (requires auth)
 * POST /v1/notifications — SendNotificationDto
 */
export const sendNotification = (data) =>
    api.post('/notifications', data).then(unwrap);

export const notificationsApi = { sendNotification };
