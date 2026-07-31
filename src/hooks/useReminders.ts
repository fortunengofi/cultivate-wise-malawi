import { useCallback, useEffect, useState } from "react";

export interface Reminder {
  id: string;
  crop: string;
  task: string;
  window: string;
  dueAt: number;      // epoch ms
  notified?: boolean;
}

const KEY = "farmlink-reminders";

function load(): Reminder[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((r) => r && typeof r === "object" && r.task)
      .map((r, i) => ({
        id: r.id ?? `${r.crop ?? "crop"}-${r.task}-${i}`,
        crop: r.crop ?? "Maize",
        task: r.task,
        window: r.window ?? "",
        dueAt: typeof r.dueAt === "number" ? r.dueAt : Date.now() + 86400000,
        notified: !!r.notified,
      }));
  } catch {
    return [];
  }
}

function save(list: Reminder[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export type NotifPermission = "default" | "granted" | "denied" | "unsupported";

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(load);
  const [permission, setPermission] = useState<NotifPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
  );

  useEffect(() => { save(reminders); }, [reminders]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) { setPermission("unsupported"); return "unsupported" as const; }
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const fire = useCallback((r: Reminder) => {
    const body = `${r.crop}: ${r.task}${r.window ? ` (${r.window})` : ""}`;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Farm Link reminder", { body, icon: "/icon-192.png", tag: r.id });
    }
  }, []);

  // check due reminders on mount and every minute
  useEffect(() => {
    const tick = () => {
      setReminders((prev) => {
        let changed = false;
        const next = prev.map((r) => {
          if (!r.notified && r.dueAt <= Date.now()) { fire(r); changed = true; return { ...r, notified: true }; }
          return r;
        });
        return changed ? next : prev;
      });
    };
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, [fire]);

  const addReminder = useCallback((r: Omit<Reminder, "id" | "notified">) => {
    const id = `${r.crop}-${r.task}-${r.dueAt}`;
    setReminders((prev) => [...prev.filter((x) => !(x.crop === r.crop && x.task === r.task)), { ...r, id }]);
    return id;
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const testNotification = useCallback(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Farm Link", { body: "Reminders are switched on. We will alert you when a task is due.", icon: "/icon-192.png" });
      return true;
    }
    return false;
  }, []);

  return { reminders, addReminder, removeReminder, permission, requestPermission, testNotification };
}
