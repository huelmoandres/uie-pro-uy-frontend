import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { ReminderService } from "@services";
import { useAccessPolicy } from "./useAccessPolicy";

/**
 * Returns a Set of expedition IUEs that have at least one SCHEDULED reminder.
 * Uses the `data.params.iue` field stored by buildCreateReminderPayload /
 * buildCreateFixedReminderPayload when creating reminders.
 * TanStack Query deduplicates this request across all callers.
 */
export function usePendingReminderIues(): Set<string> {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { hasPremiumAccess } = useAccessPolicy();

  const { data } = useQuery({
    queryKey: [...ReminderService.queryKeys.lists(), "pending-iues", userId],
    queryFn: () => ReminderService.getAll({ status: "SCHEDULED", limit: 100 }),
    staleTime: 1000 * 60 * 2,
    enabled: !!userId && hasPremiumAccess,
  });

  return useMemo(() => {
    if (!data?.data) return new Set<string>();
    const iues = new Set<string>();
    for (const reminder of data.data) {
      const params = (reminder.data as { params?: { iue?: string } } | null)
        ?.params;
      if (params?.iue) iues.add(params.iue);
    }
    return iues;
  }, [data?.data]);
}
