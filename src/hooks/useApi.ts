import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export function useApiQuery<T = unknown>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: any = {}
) {
  return useQuery<T>({
    queryKey,
    queryFn,
    ...options,
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while fetching data',
        variant: 'destructive',
      });

      if (options.onError) {
        options.onError(error);
      }
    },
  });
}

export function useApiMutation<T, V>(
  mutationFn: (data: V) => Promise<T>,
  options: any = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onError: (error: any, variables, context) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving data',
        variant: 'destructive',
      });

      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }

      // Invalidate queries if specified
      if (options.invalidateQueries) {
        const queries = Array.isArray(options.invalidateQueries)
          ? options.invalidateQueries
          : [options.invalidateQueries];

        queries.forEach((query: string | string[]) => {
          queryClient.invalidateQueries({ queryKey: Array.isArray(query) ? query : [query] });
        });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
}
