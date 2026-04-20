'use client';

import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useUnreadCount } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Notification bell with unread badge
 * Shows in dashboard header
 */
export function NotificationBell() {
  const { data: count = 0, isLoading } = useUnreadCount();
  
  return (
    <Link href="/dashboard/notifications" className="relative">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {!isLoading && count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>
    </Link>
  );
}