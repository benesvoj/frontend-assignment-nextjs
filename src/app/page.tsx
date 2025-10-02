'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { routes } from '@/routes/routes';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(routes.todoList);
    } else {
      router.push(routes.login);
    }
  }, [isAuthenticated, router]);

  return null;
}
