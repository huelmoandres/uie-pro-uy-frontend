import { apiClient } from "./client";

export interface IContactSupportRequest {
  name: string;
  email: string;
  message: string;
}

export async function contactSupport(
  data: IContactSupportRequest,
): Promise<void> {
  await apiClient.post<{ message: string }>("/support/contact", data);
}
