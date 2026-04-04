import { UserWithRelations } from "@/db/schema";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getCurrentUser, logoutUser } from "./fetchers";
import { useToast } from "@/components/ui/use-toast";
import { queryClient } from "./queryClient";

export function useCurrentUser() {
  return useQuery<UserWithRelations | null>({
    queryKey: queryKeys.currentUser,
    queryFn: () => getCurrentUser(),
    staleTime: 1000 * 60 * 60, // cache for 1 hour
    retry: false, // don’t spam retries if unauthenticated
  });
}

export function useLogout() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: logoutUser,
    onMutate: async (_, context) => {
      await context.client.cancelQueries({ queryKey: queryKeys.currentUser });
      const prevUser = context.client.getQueryData(queryKeys.currentUser);
      context.client.setQueryData(queryKeys.currentUser, null);
      return { prevUser };
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "destructive",
      });
    },
    onError: (_err, _, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(queryKeys.currentUser, context.prevUser);
      }
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
    },
  });
}
