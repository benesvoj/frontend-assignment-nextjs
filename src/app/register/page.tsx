"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Input, Button, Link } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/utils";
import { routes } from "@/routes/routes";
import { TopBar } from "@/app/components/TopBar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();
  const t = translations;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError(t.common.error);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.register.errorPasswordsDoNotMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.register.errorPasswordMustBeAtLeast6Characters);
      return;
    }

    const success = register(email, password, name);
    if (success) {
      router.push(routes.todoList);
    } else {
      setError(t.register.errorEmailAlreadyExists);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-4">
      <div className="container mx-auto max-w-3xl">
        <TopBar />
      </div>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-start gap-6 p-10">
          <h1 className="text-2xl font-bold">{t.register.title}</h1>
          <p className="text-sm text-gray-500">{t.register.signUp}</p>
        </CardHeader>
        <CardBody className="gap-10 px-10 pb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <Input
                label={t.register.name}
                type="text"
                placeholder={t.register.placeholderName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
              />
              <Input
                label={t.common.email}
                type="email"
                placeholder={t.common.placeholderEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
              />
              <Input
                label={t.common.password}
                type="password"
                placeholder={t.common.placeholderPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
              />
              <Input
                label={t.common.confirmPassword}
                type="password"
                placeholder={t.common.placeholderConfirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isRequired
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" color="primary" className="w-full">
              {t.button.register}
            </Button>
          </form>
          <div className="text-center text-sm">
            {t.register.alreadyHaveAnAccount}{" "}
            <Link href={routes.login} className="text-blue-600">
              {t.button.login}
            </Link>
          </div>
        </CardBody>
        </Card>
      </div>
    </div>
  );
}
