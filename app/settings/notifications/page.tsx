import { getNotificationPrefs } from "@/actions/preferences";
import { NotificationsForm } from "./notifications-form";

export default async function NotificationsPage() {
  const savedPrefs = await getNotificationPrefs();
  return <NotificationsForm savedPrefs={savedPrefs} />;
}
