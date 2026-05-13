"use client";
"use no memo";

import { useEffect, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { formatCountdown } from "@/lib/utils";
import { verifyCode } from "@/lib/react-query/fetchers";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query/queryClient";
import { queryKeys } from "@/lib/react-query/keys";
import { ApiError } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCreatePaymentSession } from "@/lib/react-query/mutations";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const VerifyEmailSchema = z.object({
  OTP: z.string().length(6, { message: "Must contain exactly 6 digits" }),
});

export default function VerifyCode({
  email,
  configId,
}: {
  email: string;
  configId?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [canRequest, setCanRequest] = useState(false);
  const [countdown, setCountdown] = useState(90);
  const [lastSubmittedOtp, setLastSubmittedOtp] = useState<string | null>(null);
  const router = useRouter();

  const { mutate: createPaymentSession, isPending: isCreatingPaymentSession } =
    useCreatePaymentSession();

  const form = useForm<z.infer<typeof VerifyEmailSchema>>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: { OTP: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: verifyCode,
    onError: (err: ApiError) => {
      toast({
        variant: "destructive",
        title: err.error?.message || "Failed to verify code",
        description: "Please check the code and try again.",
      });
      form.setError("OTP", {
        message: err?.error?.message || "Invalid verification code",
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.currentUser, data.data);
      console.log({ data });
      toast({
        title: "Email verified successfully!",
        description: "Thank you for verifying your email.",
      });
      if (configId) {
        createPaymentSession({ configId });
      } else {
        router.push("/");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });

  const otp = form.watch("OTP");

  // ⏱ Countdown
  useEffect(() => {
    if (!countdown) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanRequest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // 🚀 AUTO SUBMIT WHEN OTP IS COMPLETE
  useEffect(() => {
    if (otp?.length === 6 && !isPending && otp !== lastSubmittedOtp) {
      setLastSubmittedOtp(otp);
      form.handleSubmit((data) => {
        mutate({ code: data.OTP, email });
      })();
    }
  }, [otp]);

  async function resendVerification() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const response = await res.json();

      if (!res.ok) {
        toast({
          title: "Failed to resend verification code",
          description: response?.error?.message || "something_wrong",
          variant: "destructive",
        });
        return;
      }

      setCountdown(90);
      setCanRequest(false);
      toast({
        title: "Verification code sent",
        description: "Please check your email for the new verification code.",
      });
    } catch (err) {
      toast({
        title: "Failed to resend verification code",
        variant: "destructive",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }

  //   if (!isLoading)
  //     return (
  //       <svg
  //         className="animate-spin block size-9 mx-auto text-primary my-4"
  //         xmlns="http://www.w3.org/2000/svg"
  //         width="24"
  //         height="24"
  //         viewBox="0 0 24 24"
  //         fill="none"
  //         stroke="currentColor"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       >
  //         <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  //       </svg>
  //     );

  return (
    <>
      <p className="text-muted-foreground text-sm text-center">
        Enter the code sent to{" "}
        <span className="text-primary font-medium">{email}</span>
      </p>

      <Form {...form}>
        <fieldset disabled={isPending}>
          <form className="grid gap-4 my-2">
            <FormField
              control={form.control}
              name="OTP"
              render={({ field }) => (
                <FormItem className="mx-auto">
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      inputMode="numeric"
                      pattern={REGEXP_ONLY_DIGITS}
                      {...field}
                    >
                      <InputOTPGroup className="gap-2 sm:gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="border border-black rounded text-center size-9 sm:size-10"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <p className="text-destructive text-sm">
                    {form.formState.errors.OTP?.message
                      ? form.formState.errors.OTP.message
                      : null}
                  </p>
                  <FormDescription>
                    If you didn't get the email in your inbox, check the spam
                    folder too.
                  </FormDescription>

                  <FormDescription className="flex gap-2 items-center">
                    Didn't get the email?
                    <Button
                      variant="link"
                      className="px-1"
                      disabled={loading || !canRequest}
                      onClick={resendVerification}
                    >
                      {loading
                        ? "Sending..."
                        : canRequest
                          ? "Request New Code"
                          : `Request in ${formatCountdown(countdown)}`}
                    </Button>
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Optional: visual feedback only
            {(isPending || isCreatingPaymentSession) && (
              <Button disabled className="w-full">
                <LoaderIcon className="animate-spin" />
              </Button>
            )} */}
          </form>
        </fieldset>

        {/* <FormDescription>
          <Button variant="link" className="px-1" onClick={() => setPage(1)}>
            {o("change_email")}
          </Button>
        </FormDescription> */}
      </Form>
    </>
  );
}
