"use client";
import { useCurrentUser, useLogout } from "@/lib/react-query/hooks";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

export default function NavMenu() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate, isPending } = useLogout();

  console.log({ user, isLoading });

  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  return (
    <div className="h-full flex items-center space-x-4">
      {user ? (
        <>
          {/* <Link
            href="/api/auth/logout"
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Sign out
          </Link> */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mutate()}
            disabled={isLoading || isPending}
            isLoading={isPending}
            loadingText="Signing out"
          >
            Sign out
          </Button>
          {isAdmin ? (
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "sm",
                variant: "ghost",
              })}
            >
              Dashboard ✨
            </Link>
          ) : null}
          <Link
            href="/configure/upload"
            className={buttonVariants({
              size: "sm",
              className: "hidden sm:flex items-center gap-1",
            })}
          >
            Create case
            <ArrowRight className="ml-1.5 h-5 w-5" />
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/auth/register"
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Sign up
          </Link>

          <Link
            href="/auth/login"
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Login
          </Link>

          <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

          <Link
            href="/configure/upload"
            className={buttonVariants({
              size: "sm",
              className: "hidden sm:flex items-center gap-1",
            })}
          >
            Create case
            <ArrowRight className="ml-1.5 h-5 w-5" />
          </Link>
        </>
      )}
    </div>
  );
}
