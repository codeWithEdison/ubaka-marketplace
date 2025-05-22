import { useQuery } from "@tanstack/react-query";

export function useApiQuery<T>(
    queryKey: [string, ...any[]],
    queryFn: () => Promise<T>,
    options?: {
        enabled?: boolean;
    }
) {
    return useQuery({
        queryKey,
        queryFn,
        enabled: options?.enabled ?? true,
    });
} 