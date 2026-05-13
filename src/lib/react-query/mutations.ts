import { useMutation } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { queryClient } from "./queryClient";
import { logoutUser } from "./fetchers";
import { createCheckoutSession } from "@/app/configure/preview/actions";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function useLogout() {
  return useMutation({
    mutationFn: logoutUser,
    onMutate: async (_, context) => {
      await context.client.cancelQueries({ queryKey: queryKeys.currentUser });
      const prevUser = context.client.getQueryData(queryKeys.currentUser);
      context.client.setQueryData(queryKeys.currentUser, null);
      return { prevUser };
    },
    onSuccess: () => {
      toast({ title: "Logout Successful" });
    },
    onError: (_err, _, context) => {
      if (context?.prevUser) {
        queryClient.setQueryData(queryKeys.currentUser, context.prevUser);
      }
      toast({
        title: "Logout Failed",
        description: "something went wrong on our end. please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useCreatePaymentSession() {
  const router = useRouter();
  return useMutation({
    mutationKey: ["get-checkout-session"],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) router.push(url);
      else throw new Error("Unable to retrieve payment URL.");
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive",
      });
    },
  });
}
