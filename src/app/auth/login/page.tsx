import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./loginForm";
import Link from "next/dist/client/link";
import { Suspense } from "react";

export default function FieldInput() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-8.6rem)] px-2.5">
      <Card className="border-border max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
          <div className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="hover:underline underline-offset-4 text-primary"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
