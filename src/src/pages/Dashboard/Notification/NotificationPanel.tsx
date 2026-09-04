import React, { useState } from "react";
import { BarChart3, History, Send } from "lucide-react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta";
import NotificationCreate from "./NotificationCreate";
import NotificationAnalytics from "./NotificationAnalytics";
import NotificationHistory from "./NotificationHistory";


export default function NotificationPanel() {
  const [activeTab, setActiveTab] = useState<
    "create" | "analytics" | "history"
  >("create");
  const [loading, setLoading] = useState(false);


  

  const handleStopNotification = (id: string) => {
    console.log("Stop notification:", id);
  };

  const handleRetryNotification = (id: string) => {
    console.log("Retry notification:", id);
  };

  const handleViewNotification = (id: string) => {
    console.log("View notification:", id);
  };

  const handleEditNotification = (id: string) => {
    console.log("Edit notification:", id);
  };
 

  const tabButton = (
    id: "create" | "analytics" | "history",
    label: string,
    Icon: React.ElementType
  ) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        activeTab === id
          ? "bg-brand-50 text-brand-600 ring-1 ring-brand-200 dark:bg-brand-500/[0.12] dark:text-brand-400"
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );

  return (
    <div>
      <PageMeta
        title="Notifications"
        description="Create, schedule, analyze, and manage notifications"
      />
      <PageBreadcrumb pageTitle="Notifications" />

      <div className="mb-6 flex items-center gap-2">
        {tabButton("create", "Create", Send)}
        {tabButton("analytics", "Analytics", BarChart3)}
        {tabButton("history", "History", History)}
      </div>

      {loading && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Loading...
        </div>
      )}

      {activeTab === "create" && (
        <NotificationCreate/>
      )}

      {activeTab === "analytics" && <NotificationAnalytics />}

      {activeTab === "history" && (
        <NotificationHistory
          onStop={handleStopNotification}
          onRetry={handleRetryNotification}
          onView={handleViewNotification}
          onEdit={handleEditNotification}
        />
      )}
    </div>
  );
}
