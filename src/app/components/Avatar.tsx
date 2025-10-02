import { Avatar as AvatarComponent, Button } from "@heroui/react";
import { User } from "@/types";

export const Avatar = ({ user }: { user: User | null }) => {
  return (
    <Button variant="light" className="p-0 h-auto min-w-0 bg-transparent hover:bg-transparent">
      <div className="flex items-center gap-2">
        <AvatarComponent name={user?.name} />
        <div className="flex flex-col gap-2 items-start justify-center hidden md:block">
          <div className="text-sm font-bold">{user?.name}</div>
          <div className="text-sm">{user?.email}</div>
        </div>
      </div>
    </Button>
  );
};
