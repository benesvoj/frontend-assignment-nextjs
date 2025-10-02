'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Input, Button, Link } from '@heroui/react';
import { useAuth } from '@/contexts/AuthContext';
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/16/solid";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = login(email, password);
    if (success) {
      console.log('success');
      router.push('/todolist');
    } else {
      setError('Invalid email or password');
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-white rounded-2xl">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm">Sign in to your account</p>
        </CardHeader>
        <CardBody className="gap-4 px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
            />
            <Input
              label="Password"
              type={isVisible ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              endContent={
              <button
                type="button"
                onClick={toggleVisibility}
                className="focus:outline-solid outline-transparent"
                aria-label="toggle password visibility"
              >
                {isVisible ? <EyeSlashIcon className="h-5 w-5 text-2xl text-default-400 pointer-events-none"  /> : <EyeIcon className="h-5 w-5 text-2xl text-default-400 pointer-events-none" /> }
              </button>
              }
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" color="primary" className="w-full">
              Login
            </Button>
          </form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600">
              Register
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
