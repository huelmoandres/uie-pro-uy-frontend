import { useMutation } from "@tanstack/react-query";
import { contactSupport } from "@api/support.api";
import type { IContactSupportRequest } from "@api/support.api";

export const useSupportMutation = () => {
  return useMutation({
    mutationFn: (data: IContactSupportRequest) => contactSupport(data),
  });
};
