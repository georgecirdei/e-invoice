"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notificationService } from "@/services/notification.service"
import type { Notification, NotificationType } from "@/types/notification"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MainLayout } from "@/components/layout/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert } from "@/components/ui/Alert"
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconTrash,
  IconFileInvoice,
  IconCreditCard,
  IconUsers,
  IconAlertTriangle,
  IconInfoCircle,
  IconBuilding,
} from "@tabler/icons-react"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()
  }, [activeTab, currentPage])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await notificationService.getAll({
        page: currentPage,
        limit: 20,
        isRead: activeTab === "unread" ? false : undefined,
      })

      setNotifications(result.notifications)
      setTotalPages(result.pagination.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to load unread count:", err)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      await loadNotifications()
      await loadUnreadCount()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead()
      alert(result.message)
      await loadNotifications()
      await loadUnreadCount()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark all as read")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return

    try {
      await notificationService.delete(id)
      await loadNotifications()
      await loadUnreadCount()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete notification")
    }
  }

  const handleDeleteAllRead = async () => {
    if (!confirm("Are you sure you want to delete all read notifications?")) return

    try {
      const result = await notificationService.deleteAllRead()
      alert(result.message)
      await loadNotifications()
      await loadUnreadCount()
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete notifications")
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "size-5"
    switch (type) {
      case "INVOICE_CREATED":
      case "INVOICE_UPDATED":
      case "INVOICE_SUBMITTED":
      case "INVOICE_VALIDATED":
      case "INVOICE_REJECTED":
      case "INVOICE_CANCELLED":
        return <IconFileInvoice className={iconClass} />
      case "PAYMENT_RECEIVED":
      case "PAYMENT_OVERDUE":
        return <IconCreditCard className={iconClass} />
      case "CUSTOMER_ADDED":
      case "CUSTOMER_UPDATED":
        return <IconUsers className={iconClass} />
      case "ORGANIZATION_MEMBER_ADDED":
      case "ORGANIZATION_MEMBER_REMOVED":
        return <IconBuilding className={iconClass} />
      case "COMPLIANCE_ALERT":
      case "COMPLIANCE_DEADLINE":
        return <IconAlertTriangle className={iconClass} />
      case "SYSTEM_ANNOUNCEMENT":
        return <IconInfoCircle className={iconClass} />
      default:
        return <IconBell className={iconClass} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive"
      case "HIGH":
        return "default"
      case "MEDIUM":
        return "secondary"
      case "LOW":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with your invoice and payment activities
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <IconCheck className="mr-2 size-4" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDeleteAllRead}>
              <IconTrash className="mr-2 size-4" />
              Delete Read
            </Button>
          </div>
        </div>

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
          <TabsList>
            <TabsTrigger value="all">
              All Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <IconBellOff className="size-16 text-muted-foreground mb-4" />
                  <CardTitle className="text-xl mb-2">No notifications</CardTitle>
                  <CardDescription>
                    {activeTab === "unread"
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-colors ${
                      !notification.isRead ? "bg-muted/50 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            !notification.isRead
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-base">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <Badge variant={getPriorityColor(notification.priority) as any}>
                              {notification.priority}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {getRelativeTime(notification.createdAt)}
                            </span>

                            <div className="flex gap-2">
                              {notification.link && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (!notification.isRead) {
                                      handleMarkAsRead(notification.id)
                                    }
                                    router.push(notification.link!)
                                  }}
                                >
                                  View Details
                                </Button>
                              )}

                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <IconCheck className="size-4" />
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <IconTrash className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </MainLayout>
    </ProtectedRoute>
  )
}

