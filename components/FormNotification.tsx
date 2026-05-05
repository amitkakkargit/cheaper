export type NotificationState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

interface FormNotificationProps {
  notification: NotificationState;
}

export default function FormNotification({ notification }: FormNotificationProps) {
  if (!notification) {
    return null;
  }

  return (
    <div className={`form-notification ${notification.type}`} role="status">
      {notification.message}
    </div>
  );
}
