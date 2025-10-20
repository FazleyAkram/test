'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification, ConfirmDialog } from '@/components/NotificationSystem';

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  removeNotification: (id: string) => void;
  confirmDialog: ConfirmDialogState;
  showConfirmDialog: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: undefined,
    onCancel: undefined
  });

  const showNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showConfirmDialog = useCallback((dialog: Omit<ConfirmDialogState, 'isOpen'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...dialog,
        isOpen: true,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
  };

  const handleCancel = () => {
    if (confirmDialog.onCancel) {
      confirmDialog.onCancel();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        confirmDialog,
        showConfirmDialog
      }}
    >
      {children}
      
      {/* Render notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
      
      {/* Render confirm dialog */}
      <ConfirmDialog
        {...confirmDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience functions for common notification types
export function useNotificationHelpers() {
  const { showNotification, showConfirmDialog } = useNotifications();

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    showNotification({ type: 'success', title, message, duration });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    showNotification({ type: 'error', title, message, duration });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    showNotification({ type: 'warning', title, message, duration });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    showNotification({ type: 'info', title, message, duration });
  }, [showNotification]);

  const confirm = useCallback(async (title: string, message: string, type: 'danger' | 'warning' | 'info' = 'danger') => {
    return await showConfirmDialog({ title, message, type });
  }, [showConfirmDialog]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirm
  };
}
