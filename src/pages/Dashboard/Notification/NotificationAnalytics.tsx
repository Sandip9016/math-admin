import  { useState, useEffect } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import ComponentCard from "../../../components/common/ComponentCard";
import DatePicker from "../../../components/form/date-picker";
import Button from "../../../components/ui/button/Button";
import { getOverallAnalytics } from "../../../api/notification.api.js";

interface AnalyticsData {
  totalSent: number;
  avgPerUser: number;
  usersReceiving: number;
  openCount: number;
  openRate: number;
  scheduledToday: number;
  scheduledTomorrow: number;
  scheduledDayAfter: number;
}

interface NotificationAnalyticsProps {
  analytics?: AnalyticsData;
}

export default function NotificationAnalytics({
  analytics: initialAnalytics,
}: NotificationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(
    initialAnalytics || {
      totalSent: 0,
      avgPerUser: 0,
      usersReceiving: 0,
      openCount: 0,
      openRate: 0,
      scheduledToday: 0,
      scheduledTomorrow: 0,
      scheduledDayAfter: 0,
    }
  );
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Fetch analytics with optional date range
  const fetchAnalytics = async (start?: string | null, end?: string | null) => {
    try {
      setLoading(true);
      const response:any = await getOverallAnalytics(start??undefined, end??undefined);
      console.log(response)

      if (response.success) {
        const data = response.data;
        setAnalytics({
          totalSent: data.totalNotificationsSent || 0,
          avgPerUser: parseFloat(data.avgNotificationsPerUser) || 0,
          usersReceiving: data.totalUsersReceiving || 0,
          openCount: data.totalOpened || 0,
          openRate: parseFloat(data.overallOpenRate) || 0,
          scheduledToday: data.scheduledToday || 0,
          scheduledTomorrow: data.scheduledTomorrow || 0,
          scheduledDayAfter: data.scheduledDayAfter || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      alert("Failed to fetch analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load analytics on mount
  useEffect(() => {
    if (!initialAnalytics) {
      fetchAnalytics();
    }
  }, []);

  // Handle date range filter
  const handleApplyDateFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchAnalytics(dateRange.startDate, dateRange.endDate);
    } else {
      alert("Please select both start and end dates");
    }
  };

  // Reset date filter
  const handleResetFilter = () => {
    setDateRange({ startDate: null, endDate: null });
    fetchAnalytics();
  };

  return (
    <div className="space-y-4">
      {/* Date Range Filter */}
      <ComponentCard title="Filter by Date Range">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-400">
              Start Date
            </label>
            <DatePicker
              id="analytics-start-date"
              placeholder="Select start date"
              onChange={(dates) => {
                const d = Array.isArray(dates) ? dates[0] : undefined;
                setDateRange({
                  ...dateRange,
                  startDate: d ? new Date(d).toISOString() : null,
                });
              }}
              
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-400">
              End Date
            </label>
            <DatePicker
              id="analytics-end-date"
              placeholder="Select end date"
              onChange={(dates) => {
                const d = Array.isArray(dates) ? dates[0] : undefined;
                setDateRange({
                  ...dateRange,
                  endDate: d ? new Date(d).toISOString() : null,
                });
              }}
              
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyDateFilter}
              disabled={loading || !dateRange.startDate || !dateRange.endDate}
              startIcon={<Calendar className="size-4" />}
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilter}
              
              startIcon={<RefreshCw className="size-4" />}
            >
              Reset
            </Button>
          </div>
        </div>
        {(dateRange.startDate || dateRange.endDate) && (
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            {dateRange.startDate && dateRange.endDate ? (
              <>
                Showing data from{" "}
                <span className="font-medium">
                  {new Date(dateRange.startDate).toLocaleDateString()}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {new Date(dateRange.endDate).toLocaleDateString()}
                </span>
              </>
            ) : (
              "Showing all-time data"
            )}
          </div>
        )}
      </ComponentCard>

      {/* Loading Indicator */}
      {loading && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Loading analytics...
        </div>
      )}

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "No. of Notifications Sent",
            value: analytics.totalSent.toLocaleString(),
            color: "blue",
          },
          {
            label: "Avg Notifications per User",
            value: analytics.avgPerUser.toFixed(2),
            color: "green",
          },
          {
            label: "No. of Users receiving Notification",
            value: analytics.usersReceiving.toLocaleString(),
            color: "purple",
          },
          {
            label: "Open Count / Rate",
            value: `${analytics.openCount.toLocaleString()} / ${analytics.openRate.toFixed(
              2
            )}%`,
            color: "orange",
          },
        ].map((stat, i) => (
          <ComponentCard key={i} title={stat.label}>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                {stat.value}
              </div>
              <div
                className={`size-10 rounded-full ${
                  stat.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-500/10"
                    : stat.color === "green"
                    ? "bg-green-100 dark:bg-green-500/10"
                    : stat.color === "purple"
                    ? "bg-purple-100 dark:bg-purple-500/10"
                    : "bg-orange-100 dark:bg-orange-500/10"
                }`}
              ></div>
            </div>
          </ComponentCard>
        ))}
      </div>

      {/* Scheduled Notifications */}
      <ComponentCard title="No. of Notifications scheduled">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Today
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white/90">
              {analytics.scheduledToday}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Tomorrow
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white/90">
              {analytics.scheduledTomorrow}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {new Date(Date.now() + 86400000).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Day After
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white/90">
              {analytics.scheduledDayAfter}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {new Date(Date.now() + 172800000).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Performance Summary */}
      <ComponentCard title="Performance Summary">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Delivery Success Rate
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {analytics.totalSent > 0
                ? (
                    (analytics.usersReceiving / analytics.totalSent) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Average Opens per Notification
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {analytics.totalSent > 0
                ? (analytics.openCount / analytics.totalSent).toFixed(2)
                : 0}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Scheduled
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {analytics.scheduledToday +
                analytics.scheduledTomorrow +
                analytics.scheduledDayAfter}
            </span>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
