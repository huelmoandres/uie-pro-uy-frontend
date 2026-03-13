import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@context/AuthContext";
import { AgendaApi } from "@api/agenda.api";

const QUERY_KEY_BASE = ["deadline-agenda"] as const;

export function useDeadlineAgenda() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: [...QUERY_KEY_BASE, userId],
    queryFn: AgendaApi.getAgenda,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}
