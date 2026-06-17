import api from "./axiosInstance";

// ============================================
// Configuration APIs
// ============================================

/**
 * Update notification configuration (max push per day)
 */
export const updateNotificationConfig = (maxPushNotificationsPerDay) => {
  console.log(maxPushNotificationsPerDay);
  return api.put("/notifications/config", {
    maxPushNotificationsPerDay,
  });
};

// ============================================
// Notification Management APIs
// ============================================

/**
 * Create a new notification
 * @param {Object} notificationData - Notification configuration
 * @param {boolean} isDraft - Whether to save as draft
 */
export const createNotification = (notificationData, isDraft = false) => {
  // Frontend already sends proper payload, just pass it directly
  const payload = {
    type: notificationData.type,
    sendType: notificationData.sendType,
    scheduledTime: notificationData.scheduledTime,
    scheduledDate: notificationData.scheduledDate,
    timezoneAware: notificationData.timezoneAware,
    isRecurring: notificationData.isRecurring,
    recurringConfig: notificationData.recurringConfig,
    audience: {
      targetType: notificationData.audience.targetType || "all",
      filters: notificationData.audience.filters,
    },
    message: {
      title: notificationData.message.title,
      body: notificationData.message.body,
      ctaLink: notificationData.message.ctaLink || null,
      imageUrl: notificationData.message.imageUrl || null,
      language: notificationData.message.language || "en",
    },
    status: isDraft ? "draft" : "scheduled",
  };

  console.log("📤 API Payload being sent:", JSON.stringify(payload, null, 2));

  return api.post("/notifications", payload);
};

/**
 * Send a scheduled notification immediately
 */
export const sendNotification = (notificationId) => {
  return api.post(`/notifications/${notificationId}/send`);
};

/**
 * Update an existing notification
 */
export const updateNotification = (notificationId, updateData) => {
  return api.put(`/notifications/${notificationId}`, updateData);
};

/**
 * Stop a scheduled/sending notification
 */
export const stopNotification = (notificationId) => {
  return api.post(`/notifications/${notificationId}/stop`);
};

/**
 * Retry failed notifications
 */
export const retryFailedNotifications = (notificationId) => {
  return api.post(`/notifications/${notificationId}/retry`);
};

// ============================================
// Analytics APIs
// ============================================

/**
 * Get overall notification analytics
 * @param {string} startDate - Optional start date filter (ISO format)
 * @param {string} endDate - Optional end date filter (ISO format)
 */
export const getOverallAnalytics = (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return api.get("/analytics/overall", { params });
};

/**
 * Get analytics for a specific notification
 */
export const getNotificationAnalytics = (notificationId) => {
  return api.get(`/notifications/${notificationId}/analytics`);
};

// ============================================
// History & Logs APIs
// ============================================

/**
 * Get notification history with pagination and filtering
 * @param {string} status - Optional status filter (draft, scheduled, completed, etc.)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 */
export const getNotificationHistory = (status = null, page = 1, limit = 20) => {
  const params = { page, limit };
  if (status) params.status = status;

  return api.get("/notifications/history", { params });
};

/**
 * Get delivery logs for a specific notification
 * @param {string} notificationId - Notification ID
 * @param {string} status - Optional status filter
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const getDeliveryLogs = (
  notificationId,
  status = null,
  page = 1,
  limit = 50,
) => {
  const params = { page, limit };
  if (status) params.status = status;

  return api.get(`/notifications/${notificationId}/logs`, {
    params,
  });
};

// ============================================
// Tracking APIs
// ============================================

/**
 * Track when a user opens a notification
 * (This would typically be called from the mobile app)
 */
export const trackNotificationOpen = (notificationId, userId) => {
  return api.post("/notifications/track/open", {
    notificationId,
    userId,
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get count of eligible users for audience filters (preview)
 * This calculates based on frontend filters before sending
 */
export const getTargetedUserCount = async (audienceConfig) => {
  try {
    // You can implement this by creating the notification as draft
    // and checking the targetedUsers count, or create a separate endpoint
    const response = await createNotification(
      {
        type: "push",
        sendTiming: "now",
        audience: audienceConfig,
        message: {
          title: "Preview",
          body: "Preview",
          language: "en",
        },
      },
      true,
    );

    return response.data.data.targetedUsers;
  } catch (error) {
    console.error("Error getting targeted user count:", error);
    return 0;
  }
};
