import { addToast } from "@heroui/react";
import { ToastOptions, ToastType } from "@/types";
import { translations } from "@/utils";

const toastConfigs = {
  success: {
    color: 'success' as const,
    title: translations.toast.success,
    duration: 5000,
  },
  danger: {
    color: 'danger' as const,
    title: translations.toast.error,
    duration: 7000,
  },
  warning: {
    color: 'warning' as const,
    title: translations.toast.warning,
    duration: 6000,
  },
};

export const showToast = {
    success: (description: string, options?: Partial<ToastOptions>) => {
      return addToast({
        ...toastConfigs.success,
        ...options,
        description,
      });
    },
  
    danger: (description: string, options?: Partial<ToastOptions>) => {
      return addToast({
        ...toastConfigs.danger,
        ...options,
        description,
      });
    },
  
    warning: (description: string, options?: Partial<ToastOptions>) => {
      return addToast({
        ...toastConfigs.warning,
        ...options,
        description,
      });
    },
  
    custom: (type: ToastType, description: string, options?: Partial<ToastOptions>) => {
      return addToast({
        ...toastConfigs[type],
        ...options,
        description,
      });
    },
  };
  
  export default showToast;