"use client";

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

export default function FieldInput() {
  const email = useSearchParams().get("email"); // to trigger redirect if not logged in

  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  if (currentUser) {
    router.replace("/");
    // toast({
    //   title: "You are already logged in",
    //   description: "You are already logged in. Redirecting to homepage.",
    // });
    return null;
  }

  if (!email) {
    return notFound();
  }

  //   if (!currentUser) {
  //     router.replace("/auth/login");
  //     toast({
  //       title: "Not logged in",
  //       description: "Please log in to verify your email.",
  //       variant: "destructive",
  //     });
  //     return null;
  //   }

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
