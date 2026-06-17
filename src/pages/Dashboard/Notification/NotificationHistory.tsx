import { useState, useEffect } from "react";
import {
  Clock,
  Save,
  Edit,
  X,
  Eye,
  CheckCircle,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import {
  getNotificationHistory,
  getOverallAnalytics,
  stopNotification,
  retryFailedNotifications,
  getDeliveryLogs,
  updateNotification,
  getNotificationAnalytics,
} from "../../../api/notification.api.js";

interface Notification {
  id: string;
  title: string;
  status: string;
  sent: number;
  opened: number;
  openRate: number;
  date: string;
  message?: {
    title: string;
    body: string;
    cta?: string;
    image?: string;
  };
}

interface NotificationHistoryProps {
  onStop?: (notificationId: string) => void;
  onRetry?: (notificationId: string) => void;
  onView?: (notificationId: string) => void;
  onEdit?: (notificationId: string) => void;
}

export default function NotificationHistory({
  onStop,
  onRetry,
  onView,
  onEdit,
}: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState({
    usersReceiving: 0,
    openCount: 0,
    openRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  // Selected notification details
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notificationDetails, setNotificationDetails] = useState<any>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    cta: "",
    image: "",
  });

  // Fetch notifications with filters
  const fetchNotifications = async (
    status: string = "",
    page: number = 1,
    limit: number = 20
  ) => {
    try {
      setLoading(true);
      const response:any = await getNotificationHistory(
        status,
        page,
        limit
      );

      if (response.success) {
        const notifs = response.data.notifications.map((n: any) => ({
          id: n._id,
          title: n.message.title,
          status: n.status,
          sent: n.analytics?.totalSent || 0,
          opened: n.analytics?.totalOpened || 0,
          openRate: n.analytics?.openRate || 0,
          date: n.scheduledDate
            ? new Date(n.scheduledDate).toISOString().split("T")[0]
            : n.createdAt
            ? new Date(n.createdAt).toISOString().split("T")[0]
            : "",
          message: n.message,
          fullData: n, // Store full notification data
        }));
         
        setNotifications(notifs);
        setPagination({
          currentPage: response.data.pagination.page,
          totalPages: response.data.pagination.pages,
          total: response.data.pagination.total,
          limit: limit,
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Failed to fetch notification history");
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response:any = await getOverallAnalytics();
      if (response.success) {
        const data = response.data;
        setAnalytics({
          usersReceiving: data.totalUsersReceiving || 0,
          openCount: data.totalOpened || 0,
          openRate: parseFloat(data.overallOpenRate) || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  // Fetch notification details including delivery logs
  const fetchNotificationDetails = async (notificationId: string) => {
    try {
      setLoading(true);

      // Fetch analytics for this specific notification
      const analyticsResponse = await getNotificationAnalytics(notificationId);

      // Fetch delivery logs
      const logsResponse:any = await getDeliveryLogs(notificationId, undefined, 1, 100);

      if (logsResponse.success) {
        setDeliveryLogs(logsResponse.data.logs);

        // Get failure summary
        const failureSummary = logsResponse.data.failureSummary || [];

        setNotificationDetails({
          analytics: analyticsResponse.data,
          logs: logsResponse.data.logs,
          failureSummary: failureSummary,
          pagination: logsResponse.data.pagination,
        });

        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching notification details:", error);
      alert("Failed to fetch notification details");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchNotifications();
    fetchAnalytics();
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchNotifications(value, 1, pagination.limit);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchNotifications(statusFilter, page, pagination.limit);
  };

  // Handle stop notification
  const handleStop = async (notificationId: string) => {
    if (window.confirm("Are you sure you want to stop this notification?")) {
      try {
        const response:any = await stopNotification(notificationId);
        if (response.success) {
          alert("Notification stopped successfully");
          fetchNotifications(statusFilter, pagination.currentPage);
        }
      } catch (error: any) {
        console.error("Error stopping notification:", error);
        alert(error.response?.data?.message || "Failed to stop notification");
      }
    }

    if (onStop) onStop(notificationId);
  };

  // Handle retry notification
  const handleRetry = async (notificationId: string) => {
    if (
      window.confirm("Are you sure you want to retry failed notifications?")
    ) {
      try {
        const response:any= await retryFailedNotifications(notificationId);
        if (response.success) {
          alert("Retry initiated successfully");
          fetchNotifications(statusFilter, pagination.currentPage);
        }
      } catch (error: any) {
        console.error("Error retrying notification:", error);
        alert(error.response?.data?.message || "Failed to retry notification");
      }
    }

    if (onRetry) onRetry(notificationId);
  };

  // Handle view notification details
  const handleView = (notification: any) => {
    setSelectedNotification(notification);
    fetchNotificationDetails(notification.id);
    if (onView) onView(notification.id);
  };

  // Handle edit notification
  const handleEdit = (notification: any) => {
    setSelectedNotification(notification);
    setEditForm({
      title: notification.message?.title || "",
      body: notification.message?.body || "",
      cta: notification.message?.cta || "",
      image: notification.message?.image || "",
    });
    setShowEditModal(true);
    if (onEdit) onEdit(notification.id);
  };

  // Submit edit form
  const handleEditSubmit = async () => {
    if (!selectedNotification) return;

    try {
      setLoading(true);
      const response:any = await updateNotification(selectedNotification.id, {
        message: {
          title: editForm.title,
          body: editForm.body,
          ctaLink: editForm.cta,
          imageUrl: editForm.image,
        },
      });

      if (response.success) {
        alert("Notification updated successfully");
        setShowEditModal(false);
        fetchNotifications(statusFilter, pagination.currentPage);
      }
    } catch (error: any) {
      console.error("Error updating notification:", error);
      alert(error.response?.data?.message || "Failed to update notification");
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Title", "Status", "Sent", "Opened", "Open Rate", "Date"];
    const rows = notifications.map((n) => [
      n.title,
      n.status,
      n.sent,
      n.opened,
      `${n.openRate}%`,
      n.date,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <ComponentCard title="Filters & Actions">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "draft", label: "Draft" },
                { value: "scheduled", label: "Scheduled" },
                { value: "sending", label: "Sending" },
                { value: "completed", label: "Completed" },
                { value: "failed", label: "Failed" },
                { value: "stopped", label: "Stopped" },
              ]}
              defaultValue={statusFilter}
              onChange={handleStatusFilterChange}
          
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || notifications.length === 0}
            startIcon={<Download className="size-4" />}
          >
            Export CSV
          </Button>
        </div>
      </ComponentCard>

      {/* Loading Indicator */}
      {loading && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Loading notifications...
        </div>
      )}

      {/* Notifications Table */}
      <ComponentCard title="Notifications History">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Title
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Sent
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Opened
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Open Rate
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    No notifications found
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
                  <tr key={notif.id} className="align-middle">
                    <td className="px-3 py-2 text-xs text-gray-800 dark:text-white/90">
                      {notif.title}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          notif.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : notif.status === "scheduled"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : notif.status === "sending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                            : notif.status === "failed"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            : notif.status === "draft"
                            ? "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400"
                            : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400"
                        }`}
                      >
                        {notif.status === "completed" && (
                          <CheckCircle className="size-3" />
                        )}
                        {notif.status === "scheduled" && (
                          <Clock className="size-3" />
                        )}
                        {notif.status === "draft" && (
                          <Save className="size-3" />
                        )}
                        {notif.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {notif.sent.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {notif.opened.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {notif.openRate.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {notif.date || "N/A"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          startIcon={<Eye className="size-3" />}
                          onClick={() => handleView(notif)}
                        >
                          View
                        </Button>
                        {notif.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<Edit className="size-3" />}
                              onClick={() => handleEdit(notif)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<X className="size-3" />}
                              onClick={() => handleStop(notif.id)}
                            >
                              Stop
                            </Button>
                          </>
                        )}
                        {notif.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<RotateCcw className="size-3" />}
                            onClick={() => handleRetry(notif.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.total
              )}{" "}
              of {pagination.total} notifications
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
                startIcon={<ChevronLeft className="size-4" />}
              >
                Previous
              </Button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                endIcon={<ChevronRight className="size-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </ComponentCard>

      {/* Overall Analytics */}
      <ComponentCard title="Overall Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Users Receiving Notifications
            </div>
            <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {analytics.usersReceiving.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Users Opening Notifications
            </div>
            <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {analytics.openCount.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Overall Open Rate
            </div>
            <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {analytics.openRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && notificationDetails && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50  p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto  hide-scrollbar shadow-[0_0_4px_rgba(255,255,255,0.15)]
   z-100 rounded-lg bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Notification Level Details: {selectedNotification.title}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Statistics Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Users Receiving
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {notificationDetails.analytics?.totalDelivered || 0}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Users Opened
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {notificationDetails.analytics?.totalOpened || 0}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Open Rate
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {notificationDetails.analytics?.openRate?.toFixed(2) || 0}%
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Failed
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {notificationDetails.analytics?.totalFailed || 0}
                </div>
              </div>
            </div>

            {/* Failure Summary */}
            {notificationDetails.failureSummary &&
              notificationDetails.failureSummary.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
                    Failure Reasons
                  </h4>
                  <div className="space-y-2">
                    {notificationDetails.failureSummary.map(
                      (failure: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20"
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-gray-800 dark:text-white">
                              {failure._id || "Unknown Error"}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {failure.count} failures
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* User Level Delivery Logs */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
                User Level Delivery Logs
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Delivered At
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Opened At
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Retry Count
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Failure Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {deliveryLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                          No delivery logs found
                        </td>
                      </tr>
                    ) : (
                      deliveryLogs.map((log: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-xs text-gray-800 dark:text-white">
                            {log.userId?.name || log.userId?.email || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                log.status === "opened"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : log.status === "delivered"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {log.deliveredAt
                              ? new Date(log.deliveredAt).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {log.openedAt
                              ? new Date(log.openedAt).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {log.retryCount || 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400">
                            {log.failureReason || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {showEditModal && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Edit Notification
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Notification title"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="edit-body">Body</Label>
                <TextArea
                  rows={4}
                  value={editForm.body}
                  onChange={(v) => setEditForm({ ...editForm, body: v })}
                  placeholder="Notification message"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="edit-cta">CTA / Deep Link (Optional)</Label>
                <Input
                  id="edit-cta"
                  value={editForm.cta}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cta: e.target.value })
                  }
                  placeholder="app://screen/game"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="edit-image">Image URL (Optional)</Label>
                <Input
                  id="edit-image"
                  type="url"
                  value={editForm.image}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={handleEditSubmit}
                  disabled={loading || !editForm.title || !editForm.body}
                  className="flex-1"
                >
                  {loading ? "Updating..." : "Update Notification"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
