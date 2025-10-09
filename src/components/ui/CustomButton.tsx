import React from "react";

import {CheckIcon, PlusIcon} from "@heroicons/react/24/solid";
import {Button} from "@heroui/react";

type CustomButtonProps = {
	title: string;
	onPress?: () => void;
	color?: "primary" | "default";
	icon?: 'plus' | 'mark'
	loading?: boolean;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
}

const iconMap = {
	plus: <PlusIcon className="w-4 h-4 md:w-4 md:h-4"/>,
	mark: <CheckIcon className="w-4 h-4 md:w-4 md:h-4" />
}

export const CustomButton = ({ title, onPress, color, icon, loading, disabled, type }: CustomButtonProps) => {
	return (
		<Button
			type={type || "button"}
			color={color || "primary"}
			size="sm"
			className="w-full md:w-auto px-5 py-2.5"
			radius="full"
			onPress={onPress}
			endContent={icon ? iconMap[icon] : null}
			isLoading={loading || false}
			isDisabled={disabled || false}
		>
			{title}
		</Button>
	)
}