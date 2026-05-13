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
import { registerUser } from "@/lib/react-query/fetchers";
import { queryKeys } from "@/lib/react-query/keys";
import { queryClient } from "@/lib/react-query/queryClient";
import { ApiError } from "@/lib/types";
import { registerSchema } from "@/lib/zodSchema";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export default function RegisterForm({
  setEmail,
}: {
  setEmail?: Dispatch<SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const configId = useSearchParams().get("id");
  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // queryClient.setQueryData(queryKeys.currentUser, data.user);
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
      console.log({ configId, email: data.user.email });
      if (!configId) {
        router.replace(`/auth/register/verify-email?email=${data.user.email}`);
      } else {
        console.log("validate???????????");
        console.log({ setEmail });
        setEmail?.(data.user.email);
      }
    },
    onError: (error: ApiError) => {
      if (error?.errors) {
        error.errors.forEach((err) => {
          console.log({ err });
          toast({
            title: "Registration failed",
            description: err.message,
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      email: "",
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  console.log({ formErrors: form.state.errors });

  return (
    <form
      id="register-form"
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Submitting form with values:", form.state.values);
        console.log("Form errors before submission:", form.state.errors);
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
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
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
        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="gap-1">
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="john_doe@example.com"
                  autoComplete="off"
                  type="email"
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
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
        <form.Field name="passwordConfirm">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="gap-1">
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
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
          form="register-form"
          className="w-full"
          variant="default"
          disabled={isPending}
          isLoading={isPending}
        >
          Register
        </Button>
      </Field>
    </form>
  );
}
