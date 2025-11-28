"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearDayEntry } from "@/app/actions/dayEntry";

interface UseDeleteDayOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteDay(options?: UseDeleteDayOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const deleteDay = (date: string) => {
    startTransition(async () => {
      try {
        await clearDayEntry(date);
        router.refresh();
        toast.success("Day deleted successfully.");
        options?.onSuccess?.();
      } catch (error) {
        toast.error("Failed to delete day. Please try again.");
        console.error(error);
        options?.onError?.(error);
      }
    });
  };

  return { deleteDay, isPending };
}

