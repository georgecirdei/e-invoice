"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { notificationService } from "@/services/notification.service"
import type { Notification } from "@/types/notification"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  IconBell,
  IconCheck,
  IconFileInvoice,
  IconCreditCard,
  IconUsers,
  IconAlertTriangle,
  IconInfoCircle,
  IconBuilding,
} from "@tabler/icons-react"

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadUnreadCount()
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadRecentNotifications()
    }
  }, [isOpen])

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to load unread count:", err)
    }
  }

  const loadRecentNotifications = async () => {
    try {
      const result = await notificationService.getAll({
        page: 1,
        limit: 5,
      })
      setNotifications(result.notifications)
    } catch (err) {
      console.error("Failed to load notifications:", err)
    }
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await notificationService.markAsRead(id)
      await loadRecentNotifications()
      await loadUnreadCount()
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      await loadRecentNotifications()
      await loadUnreadCount()
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconClass = "size-4"
    if (type.includes("INVOICE")) return <IconFileInvoice className={iconClass} />
    if (type.includes("PAYMENT")) return <IconCreditCard className={iconClass} />
    if (type.includes("CUSTOMER")) return <IconUsers className={iconClass} />
    if (type.includes("ORGANIZATION")) return <IconBuilding className={iconClass} />
    if (type.includes("COMPLIANCE")) return <IconAlertTriangle className={iconClass} />
    if (type.includes("SYSTEM")) return <IconInfoCircle className={iconClass} />
    return <IconBell className={iconClass} />
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  {index > 0 && <Separator />}
                  <Link
                    href={notification.link || "/notifications"}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id, {} as any)
                      }
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-3 p-3 hover:bg-accent transition-colors cursor-pointer">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          !notification.isRead
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          <IconCheck className="size-3" />
                        </Button>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </ScrollArea>

            <DropdownMenuSeparator />
            <div className="p-2 flex gap-2">
              <Link href="/notifications" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  View All
                </Button>
              </Link>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <IconCheck className="size-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

