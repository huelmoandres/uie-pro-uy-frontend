import {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
} from "@api/reminders.api";
import type {
  IReminder,
  ICreateReminderPayload,
  IRemindersListResponse,
  IRemindersQuery,
} from "@app-types/reminder.types";

export class ReminderService {
  static readonly queryKeys = {
    all: ["reminders"] as const,
    lists: () => [...ReminderService.queryKeys.all, "list"] as const,
    list: (params: IRemindersQuery) =>
      [...ReminderService.queryKeys.lists(), params] as const,
    detail: (id: string) =>
      [...ReminderService.queryKeys.all, "detail", id] as const,
  };

  static async getAll(
    params: IRemindersQuery,
  ): Promise<IRemindersListResponse> {
    return getReminders(params);
  }

  static async getById(id: string): Promise<IReminder> {
    return getReminder(id);
  }

  static async create(payload: ICreateReminderPayload): Promise<IReminder> {
    return createReminder(payload);
  }

  static async update(
    id: string,
    payload: Parameters<typeof updateReminder>[1],
  ): Promise<IReminder> {
    return updateReminder(id, payload);
  }

  static async remove(id: string): Promise<void> {
    return deleteReminder(id);
  }
}
