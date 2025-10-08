"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
  Spinner,
} from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import { routes } from "@/routes/routes";
import { translations } from "@/utils";
import { TopBar } from "@/components/layout/TopBar";
import { showToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, loading, isAuthenticated, error: authError } = useAuth();
  const router = useRouter();
  const t = translations;

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (isAuthenticated) {
      setIsRedirecting(true);
      router.push(routes.todoList);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t.common.error);
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push(routes.todoList);
      showToast.success(t.toast.loginSuccess);
    } else {
      setError(t.common.errorEmailOrPassword);
    }
  };

  if (loading || isRedirecting) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-4">
      <div className="container mx-auto max-w-3xl">
        <TopBar />
      </div>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg bg-white rounded-2xl">
          <CardHeader className="flex flex-col items-start gap-6 p-10">
            <h1 className="text-2xl font-bold">{t.login.title}</h1>
            <p className="text-sm text-gray-500 font-weight-400 line-height-16">
              {t.login.signIn}
            </p>
          </CardHeader>
          <CardBody className="gap-10 px-10 pb-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <Input
                  label={t.common.email}
                  type="email"
                  placeholder={t.common.placeholderEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isRequired
                  data-testid="email-input"
                />
                <Input
                  label={t.common.password}
                  type={isVisible ? "text" : "password"}
                  placeholder={t.common.placeholderPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isRequired
                  data-testid="password-input"
                  endContent={
                    <button
                      type="button"
                      onClick={toggleVisibility}
                      className="focus:outline-solid outline-transparent"
                      aria-label={t.login.togglePasswordVisibility}
                      data-testid="toggle-password-visibility"
                    >
                      {isVisible ? (
                        <EyeSlashIcon className="h-5 w-5 text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                />
                {(error || authError) && (
                  <p className="text-sm text-red-500">{error || authError}</p>
                )}
              </div>
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={loading || isRedirecting}
                data-testid="login-button"
              >
                {t.button.login}
              </Button>
            </form>
            <div className="text-center text-sm">
              {t.login.register}{" "}
              <Link
                href={routes.register}
                className="text-blue-600"
                data-testid="register-link"
              >
                {t.button.register}
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
