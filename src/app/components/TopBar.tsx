'use client'

import {useAuth} from "@/contexts/AuthContext";
import {User} from "@heroui/react";
import {translations} from "@/utils";
import Logo from '@/assets'
import Image from "next/image";

export const TopBar = () => {

	const {user} = useAuth();
	const t = translations;

	return (
		<div className="flex justify-between py-5">
			<div className="flex items-center gap-4">
				<Image src={Logo} alt="Logo" width={40} />
				<span className="text-2xl font-bold align-middle">
				{t.app.title}
				</span>
			</div>
			<User name={user?.name} description={user?.email}/>
		</div>
	)
}