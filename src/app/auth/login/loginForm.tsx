"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { loginUser } from "@/lib/react-query/fetchers";
import { queryKeys } from "@/lib/react-query/keys";
import { useCreatePaymentSession } from "@/lib/react-query/mutations";
import { queryClient } from "@/lib/react-query/queryClient";
import { loginSchema } from "@/lib/zodSchema";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const configId = useSearchParams().get("id");
  const router = useRouter();
  const { mutate: createPaymentSession, isPending: isCreatingPaymentSession } =
    useCreatePaymentSession();

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ data, messsage }) => {
      console.log({ data, messsage, configId });
      if (data.emailVerified && !configId) {
        queryClient.setQueryData(queryKeys.currentUser, data);
        toast({
          title: messsage,
          description: "You have successfully logged in.",
        });
        router.push("/");
      } else if (configId && data.emailVerified) {
        queryClient.setQueryData(queryKeys.currentUser, data);
        toast({
          title: messsage,
          description: "You have successfully logged in.",
        });
        createPaymentSession({ configId });
      } else if (!data.emailVerified && configId) {
        // need to verify email before checkout
        localStorage.setItem("configurationId", configId);
        router.push(
          "/auth/register/verify-email?email=" + encodeURIComponent(data.email),
        );
      } else {
        router.push(
          "/auth/register/verify-email?email=" + encodeURIComponent(data.email),
        );
      }

      if (configId) {
      }
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description:
          error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  return (
    <form
      id="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="username">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="gap-1">
                <FieldLabel htmlFor={field.name}>Username/Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="john_doe"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="password">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="gap-1">
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="••••••••"
                  autoComplete="off"
                  type="password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <Field orientation="horizontal" className="mt-7 mb-4">
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          variant="default"
          disabled={isPending || isCreatingPaymentSession}
          isLoading={isPending || isCreatingPaymentSession}
        >
          Login
        </Button>
      </Field>
    </form>
  );
}
