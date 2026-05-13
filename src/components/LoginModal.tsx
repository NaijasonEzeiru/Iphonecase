import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Image from "next/image";
import LoginForm from "@/app/auth/login/loginForm";
import RegisterForm from "@/app/auth/register/registerForm";
import { Button } from "./ui/button";
import { useCurrentUser } from "@/lib/react-query/hooks";
import VerifyCode from "./verifyEmail";
import { useSearchParams } from "next/navigation";

const LoginModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [showLogin, setShowLogin] = useState(true);
  const configId = useSearchParams().get("id");
  // const toggleForm = () => setShowLogin((prev) => !prev);
  const { data: user } = useCurrentUser();
  const [email, setEmail] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!isOpen) {
  //     setEmail(null);
  //     setShowLogin(true);
  //   }
  // }, [isOpen]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="absolute z-[9999999]">
        <DialogHeader>
          <div className="relative mx-auto w-24 h-24 mb-2">
            <Image
              src="/snake-1.png"
              alt="snake image"
              className="object-contain"
              fill
            />
          </div>
          <DialogTitle className="text-3xl text-center font-bold tracking-tight text-gray-900">
            {showLogin ? "Log in" : "Sign up"} to continue
          </DialogTitle>
          <DialogDescription className="text-base text-center py-2">
            <span className="font-medium text-zinc-900">
              Your configuration was saved!
            </span>{" "}
            Please login or create an account to complete your purchase.
          </DialogDescription>
        </DialogHeader>
        {(user?.email && !user?.emailVerified) || email ? (
          <VerifyCode email={email || user!.email} configId={configId} />
        ) : showLogin ? (
          <>
            <LoginForm />
            <div className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="hover:underline underline-offset-4 text-primary px-0"
                onClick={() => setShowLogin(false)}
              >
                Sign up
              </Button>
            </div>
          </>
        ) : (
          <>
            <RegisterForm setEmail={setEmail} />
            <div className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Button
                variant="link"
                className="hover:underline underline-offset-4 text-primary px-0"
                onClick={() => setShowLogin(true)}
              >
                Sign in
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
