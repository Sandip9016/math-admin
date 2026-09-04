import React, { useEffect, useState } from "react";
import { Send, Save, Users } from "lucide-react";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Select from "../../../components/form/Select";
import MultiSelect from "../../../components/form/MultiSelect";
import DatePicker from "../../../components/form/date-picker";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import {
  createNotification,
  updateNotificationConfig,
} from "../../../api/notification.api.js";
import { getAllUsers } from "../../../api/auth.api.js";

export default function NotificationCreate() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [maxPushPerDay, setMaxPushPerDay] = useState(0);

  const [notificationConfig, setNotificationConfig] = useState<any>({
    type: "push",
    sendTiming: "now",
    scheduleDate: "",
    scheduleTime: "",
    isTimezoneAware: false,
    isRecurring: false,
    recurringConfig: {
      time: "",
      frequency: "daily",
      startDate: "",
      endDate: "",
      isTimezoneAware: false,
    },
    audience: {
      type: "all",
      userTypes: [],
      ratingRanges: [],
      countries: [],
      joiningDateRange: { start: "", end: "" },
    },
    message: {
      title: "",
      body: "",
      cta: "",
      image: "",
      language: "en",
    },
  });

  /* ================= FETCH USERS ================= */
  const handleUsers = async () => {
    const data: any = await getAllUsers();
    if (data.success) {
      setUsers(data.users || []);
    }
  };

  useEffect(() => {
    handleUsers();
  }, []);

  const countryOptions = React.useMemo(() => {
    const uniqueCountries = new Set<string>();

    users.forEach((u) => {
      if (u?.country) {
        uniqueCountries.add(u.country);
      }
    });

    return Array.from(uniqueCountries).map((c) => ({
      value: c,
      text: c,
    }));
  }, [users]);

  /* ================= FILTER USERS ================= */
  const filteredUsers = React.useMemo(() => {
    if (notificationConfig.audience.type === "all") {
      return users;
    }

    return users.filter((user) => {
      /* ---------- USER TYPE ---------- */
      if (
        notificationConfig.audience.userTypes.length &&
        !notificationConfig.audience.userTypes.includes(
          user?.accountStatus?.state,
        )
      ) {
        return false;
      }

      /* ---------- COUNTRY ---------- */
      if (
        notificationConfig.audience.countries.length &&
        !notificationConfig.audience.countries.includes(user.country)
      ) {
        return false;
      }

      /* ---------- JOINING DATE ---------- */
      const start = notificationConfig.audience.joiningDateRange.start
        ? new Date(notificationConfig.audience.joiningDateRange.start)
        : null;

      const end = notificationConfig.audience.joiningDateRange.end
        ? new Date(notificationConfig.audience.joiningDateRange.end)
        : null;

      const joinedAt = new Date(user?.accountStatus?.changedAt);

      if (start && joinedAt < start) return false;
      if (end && joinedAt > end) return false;

      return true;
    });
  }, [users, notificationConfig.audience]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true);

      if (
        notificationConfig.sendTiming === "schedule" &&
        (!notificationConfig.scheduleDate || !notificationConfig.scheduleTime)
      ) {
        alert("Please select both date and time");
        return;
      }

      const payload = {
        type: notificationConfig.type,
        sendType: notificationConfig.sendTiming === "now" ? "now" : "scheduled",
        scheduledDate:
          notificationConfig.sendTiming === "schedule"
            ? notificationConfig.scheduleDate
            : null,
        scheduledTime:
          notificationConfig.sendTiming === "schedule"
            ? notificationConfig.scheduleTime
            : null,
        timezoneAware: notificationConfig.isTimezoneAware,
        isRecurring: notificationConfig.isRecurring,
        recurringConfig: notificationConfig.isRecurring
          ? notificationConfig.recurringConfig
          : null,
        audience: {
          targetType: notificationConfig.audience.type,
          filters:
            notificationConfig.audience.type === "filtered"
              ? {
                  userTypes: notificationConfig.audience.userTypes,
                  ratingRanges: notificationConfig.audience.ratingRanges,
                  countries: notificationConfig.audience.countries,
                  joiningDateRange:
                    notificationConfig.audience.joiningDateRange,
                }
              : null,
        },
        message: {
          title: notificationConfig.message.title,
          body: notificationConfig.message.body,
          ctaLink: notificationConfig.message.cta,
          imageUrl: notificationConfig.message.image,
          language: notificationConfig.message.language,
        },
        status: isDraft ? "draft" : "scheduled",
      };

      console.log(
        "📤 Sending payload to backend:",
        JSON.stringify(payload, null, 2),
      );

      const res = await createNotification(payload);

      if (res?.data?.success) {
        alert(
          isDraft
            ? "Notification saved as draft"
            : "Notification created successfully",
        );
        console.log("✅ Notification created:", res.data);
      }
    } catch (err: any) {
      console.error("❌ Error creating notification:", err);
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE MAX PUSH ================= */
  const handleUpdateMaxPush = async () => {
    try {
      setLoading(true);
      await updateNotificationConfig(maxPushPerDay);
      alert("Max push notifications updated");
    } catch {
      alert("Failed to update config");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      {/* Configuration */}
      <ComponentCard title="Configuration">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <div>
            <Label>Type of Notification</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "in-app", label: "In-App" },
                { value: "push", label: "Push" },
                { value: "popup", label: "Pop-up" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() =>
                    setNotificationConfig({
                      ...notificationConfig,
                      type: t.value,
                    })
                  }
                  disabled={loading}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    notificationConfig.type === t.value
                      ? "border-brand-300 bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                  } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Send Timing */}
      <ComponentCard title="When do you want to send">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setNotificationConfig({
                  ...notificationConfig,
                  sendTiming: "now",
                })
              }
              disabled={loading}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                notificationConfig.sendTiming === "now"
                  ? "border-brand-300 bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              Send Now
            </button>
            <button
              onClick={() =>
                setNotificationConfig({
                  ...notificationConfig,
                  sendTiming: "schedule",
                })
              }
              disabled={loading}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                notificationConfig.sendTiming === "schedule"
                  ? "border-brand-300 bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
            >
              Schedule
            </button>
          </div>

          {notificationConfig.sendTiming === "schedule" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Select Date</Label>
                  <DatePicker
                    id="schedule-date"
                    onChange={(dates) => {
                      const d = Array.isArray(dates) ? dates[0] : undefined;
                      setNotificationConfig({
                        ...notificationConfig,
                        scheduleDate: d ? String(d) : "",
                      });
                    }}
                    placeholder="Pick a date"
                    // disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Select Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={notificationConfig.scheduleTime}
                    onChange={(e) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        scheduleTime: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
              <Switch
                label="Timezone Aware: Send based on the time of the timezone"
                defaultChecked={notificationConfig.isTimezoneAware}
                onChange={(checked) =>
                  setNotificationConfig({
                    ...notificationConfig,
                    isTimezoneAware: checked,
                  })
                }
                disabled={loading}
              />
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Recurring */}
      <ComponentCard title="Is it Recurring">
        <div className="space-y-4">
          <Switch
            label="Enable Recurring Notifications"
            defaultChecked={notificationConfig.isRecurring}
            onChange={(checked) =>
              setNotificationConfig({
                ...notificationConfig,
                isRecurring: checked,
              })
            }
            disabled={loading}
          />
          {notificationConfig.isRecurring && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="rec-time">Select Time</Label>
                  <Input
                    id="rec-time"
                    type="time"
                    value={notificationConfig.recurringConfig.time}
                    onChange={(e) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        recurringConfig: {
                          ...notificationConfig.recurringConfig,
                          time: e.target.value,
                        },
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="rec-frequency">Select Frequency</Label>
                  <Select
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" },
                    ]}
                    defaultValue={notificationConfig.recurringConfig.frequency}
                    onChange={(value) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        recurringConfig: {
                          ...notificationConfig.recurringConfig,
                          frequency: value,
                        },
                      })
                    }
                    // disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Start Date</Label>
                  <DatePicker
                    id="rec-start"
                    onChange={(dates) => {
                      const d = Array.isArray(dates) ? dates[0] : undefined;
                      setNotificationConfig({
                        ...notificationConfig,
                        recurringConfig: {
                          ...notificationConfig.recurringConfig,
                          startDate: d ? String(d) : "",
                        },
                      });
                    }}
                    placeholder="Pick start date"
                    // disabled={loading}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <DatePicker
                    id="rec-end"
                    onChange={(dates) => {
                      const d = Array.isArray(dates) ? dates[0] : undefined;
                      setNotificationConfig({
                        ...notificationConfig,
                        recurringConfig: {
                          ...notificationConfig.recurringConfig,
                          endDate: d ? String(d) : "",
                        },
                      });
                    }}
                    placeholder="Pick end date"
                    // disabled={loading}
                  />
                </div>
              </div>
              <Switch
                label="Timezone Aware: Send based on the time of the timezone"
                defaultChecked={
                  notificationConfig.recurringConfig.isTimezoneAware
                }
                onChange={(checked) =>
                  setNotificationConfig({
                    ...notificationConfig,
                    recurringConfig: {
                      ...notificationConfig.recurringConfig,
                      isTimezoneAware: checked,
                    },
                  })
                }
                disabled={loading}
              />
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Audience */}
      <ComponentCard title="Audience Targeted">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show number of users being sent to</Label>
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 dark:bg-white/[0.03] dark:text-gray-400">
              <Users className="size-4" />
              <span>{filteredUsers.length} users</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>User Scope</Label>
              <Select
                options={[
                  { value: "all", label: "All Users" },
                  { value: "filtered", label: "Filtered Users" },
                ]}
                defaultValue={notificationConfig.audience.type}
                onChange={(value) =>
                  setNotificationConfig({
                    ...notificationConfig,
                    audience: { ...notificationConfig.audience, type: value },
                  })
                }
                // disabled={loading}
              />
            </div>
            {notificationConfig.audience.type === "filtered" && (
              <>
                <div>
                  <MultiSelect
                    label="User Type"
                    options={[
                      { value: "active", text: "Active" },
                      { value: "inactive", text: "Inactive" },
                    ]}
                    value={notificationConfig.audience.userTypes}
                    onChange={(v) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        audience: {
                          ...notificationConfig.audience,
                          userTypes: v,
                        },
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div>
                  <MultiSelect
                    label="User Rating (Range Bucket)"
                    options={[
                      { value: "0-500", text: "0 - 500" },
                      { value: "500-1000", text: "500 - 1000" },
                      { value: "1000-1500", text: "1000 - 1500" },
                      { value: "1500+", text: "1500+" },
                    ]}
                    value={notificationConfig.audience.ratingRanges}
                    onChange={(v) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        audience: {
                          ...notificationConfig.audience,
                          ratingRanges: v,
                        },
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div>
                  <MultiSelect
                    label="User Country"
                    options={countryOptions}
                    value={notificationConfig.audience.countries}
                    onChange={(v) =>
                      setNotificationConfig({
                        ...notificationConfig,
                        audience: {
                          ...notificationConfig.audience,
                          countries: v,
                        },
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Based on Joining Date</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DatePicker
                      id="join-start"
                      placeholder="Start Date"
                      onChange={(dates) => {
                        const d = Array.isArray(dates) ? dates[0] : undefined;
                        setNotificationConfig({
                          ...notificationConfig,
                          audience: {
                            ...notificationConfig.audience,
                            joiningDateRange: {
                              ...notificationConfig.audience.joiningDateRange,
                              start: d ? String(d) : "",
                            },
                          },
                        });
                      }}
                      // disabled={loading}
                    />
                    <DatePicker
                      id="join-end"
                      placeholder="End Date"
                      onChange={(dates) => {
                        const d = Array.isArray(dates) ? dates[0] : undefined;
                        setNotificationConfig({
                          ...notificationConfig,
                          audience: {
                            ...notificationConfig.audience,
                            joiningDateRange: {
                              ...notificationConfig.audience.joiningDateRange,
                              end: d ? String(d) : "",
                            },
                          },
                        });
                      }}
                      // disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </ComponentCard>

      {/* Message Details */}
      <ComponentCard title="Message Details">
        <div className="space-y-4">
          <div>
            <Label htmlFor="msg-title">Title</Label>
            <Input
              id="msg-title"
              value={notificationConfig.message.title}
              onChange={(e) =>
                setNotificationConfig({
                  ...notificationConfig,
                  message: {
                    ...notificationConfig.message,
                    title: e.target.value,
                  },
                })
              }
              placeholder="Notification title"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="msg-body">Body</Label>
            <TextArea
              rows={3}
              value={notificationConfig.message.body}
              onChange={(v) =>
                setNotificationConfig({
                  ...notificationConfig,
                  message: { ...notificationConfig.message, body: v },
                })
              }
              placeholder="Write your message"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="msg-cta">CTA / Deep Link (Optional)</Label>
              <Input
                id="msg-cta"
                value={notificationConfig.message.cta}
                onChange={(e) =>
                  setNotificationConfig({
                    ...notificationConfig,
                    message: {
                      ...notificationConfig.message,
                      cta: e.target.value,
                    },
                  })
                }
                placeholder="app://screen/game"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="msg-lang">Language</Label>
              <Select
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "hi", label: "Hindi" },
                ]}
                defaultValue={notificationConfig.message.language}
                onChange={(v) =>
                  setNotificationConfig({
                    ...notificationConfig,
                    message: { ...notificationConfig.message, language: v },
                  })
                }
                // disabled={loading}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="msg-image">Image URL (Optional)</Label>
            <Input
              id="msg-image"
              type="url"
              value={notificationConfig.message.image}
              onChange={(e) =>
                setNotificationConfig({
                  ...notificationConfig,
                  message: {
                    ...notificationConfig.message,
                    image: e.target.value,
                  },
                })
              }
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>
        </div>
      </ComponentCard>

      {/* Submit Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={() => handleSubmit(false)}
          startIcon={<Send className="size-4" />}
          className="flex-1"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          startIcon={<Save className="size-4" />}
          disabled={loading}
        >
          Save as Draft
        </Button>
      </div>

      <ComponentCard title="Max Push Configuration">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="max-push">Max Push Notifications per day</Label>
            <Input
              id="max-push"
              type="number"
              placeholder="e.g., 5"
              value={maxPushPerDay}
              onChange={(e) => setMaxPushPerDay(Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => handleUpdateMaxPush()}
            disabled={loading || !maxPushPerDay}
            className="sm:w-auto"
          >
            Update
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
