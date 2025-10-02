import React from "react";
import {TopBar} from "@/app/components/TopBar";

export default function TodoListLayout({children}: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col p-4">
			<div className="container mx-auto max-w-3xl pt-4">
				<TopBar/>
				{children}
			</div>
		</div>
	)
}