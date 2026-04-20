'use client';

import Link from 'next/link';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle, FileText, AlertTriangle, Shield, Bell, Check } from 'lucide-react';

// Icon mapping for notification types
const typeIcons: Record<string, React.ElementType> = {
  CV_COMPLETED: CheckCircle,
  CV_FAILED: XCircle,
  CV_UPLOADED: FileText,
  VOTE_RECEIVED: AlertTriangle,
  PROFILE_UPDATED: Shield,
  SECURITY_ALERT: Shield,
};

const typeColors: Record<string, string> = {
  CV_COMPLETED: 'text-emerald-500',
  CV_FAILED: 'text-destructive',
  CV_UPLOADED: 'text-blue-500',
  VOTE_RECEIVED: 'text-yellow-500',
  PROFILE_UPDATED: 'text-purple-500',
  SECURITY_ALERT: 'text-orange-500',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minutos`;
  if (diffHours < 24) return `hace ${diffHours} horas`;
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString('es-AR');
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  
  const notifications = data?.data || [];
  const unreadCount = data?.pagination?.unreadCount || 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground mt-1">
                  {unreadCount} sin leer
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 bg-muted" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No tenés notificaciones
              </h2>
              <p className="text-muted-foreground">
                Cuando ocurra algo relevante, va a aparecer acá.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell;
              const colorClass = typeColors[notification.type] || 'text-muted-foreground';
              
              return (
                <Card 
                  key={notification.id} 
                  className={`bg-card hover:bg-secondary/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'border-l-4 border-l-foreground' : ''
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-foreground ${!notification.isRead ? 'font-bold' : ''}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-foreground" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}