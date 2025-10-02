"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Avatar,
} from "@heroui/react";
import { translations } from "@/utils";
import Logo from "@/assets";
import Image from "next/image";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/16/solid";
import { routes } from "@/routes/routes";

export const TopBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const t = translations;
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(routes.login);
  };

  const isAuthenticatedStyle = isAuthenticated
    ? "flex justify-between py-7 md:py-10 px-2 md:px-0"
    : "flex justify-center py-7 md:py-10 px-2 md:px-0";

  return (
    <div className={isAuthenticatedStyle}>
      <div className="flex items-center gap-4">
        <Image src={Logo} alt="Logo" width={40} />
        <span className="text-2xl font-bold align-middle">{t.app.title}</span>
      </div>
      {isAuthenticated && (
        <Dropdown>
          <DropdownTrigger>
            <button
              className="p-0 h-auto min-w-0 bg-transparent hover:bg-transparent cursor-pointer text-start"
            >
              <div className="flex gap-2">
                <Avatar name={user?.name} />
                <div className="flex flex-col gap-2 hidden md:block">
                  <div className="text-sm font-bold">{user?.name}</div>
                  <div className="text-sm">{user?.email}</div>
                </div>
              </div>
            </button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="logout"
              onPress={handleLogout}
              className="text-primary"
              startContent={
                <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
              }
            >
              {t.button.logout}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
};
