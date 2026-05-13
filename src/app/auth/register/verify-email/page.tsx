"use client";

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VerifyCode from "@/components/verifyEmail";
import { useCurrentUser } from "@/lib/react-query/hooks";
import { notFound, useRouter, useSearchParams } from "next/navigation";

// Component that uses useSearchParams
function VerifyEmailContent() {
  const email = useSearchParams().get("email");
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  if (currentUser) {
    router.replace("/");
    return null;
  }

  if (!email) {
    return notFound();
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-8.6rem)] px-2.5">
      <Card className="border-border max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyCode email={email} />
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function FieldInput() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
