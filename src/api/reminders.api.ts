import { apiClient } from "./client";
import type {
  IReminder,
  ICreateReminderPayload,
  IRemindersListResponse,
  IRemindersQuery,
} from "@app-types/reminder.types";

export async function getReminders(
  params: IRemindersQuery = {},
): Promise<IRemindersListResponse> {
  const { data } = await apiClient.get<IRemindersListResponse>("/reminders", {
    params,
  });
  return data;
}

export async function getReminder(id: string): Promise<IReminder> {
  const { data } = await apiClient.get<IReminder>(`/reminders/${id}`);
  return data;
}

export async function createReminder(
  payload: ICreateReminderPayload,
): Promise<IReminder> {
  const { data } = await apiClient.post<IReminder>("/reminders", payload);
  return data;
}

export async function updateReminder(
  id: string,
  payload: Partial<{ remindAt: string; offsetDays: number; title: string; body: string; data: Record<string, unknown> }>,
): Promise<IReminder> {
  const { data } = await apiClient.patch<IReminder>(`/reminders/${id}`, payload);
  return data;
}

export async function deleteReminder(id: string): Promise<void> {
  await apiClient.delete(`/reminders/${id}`);
}
