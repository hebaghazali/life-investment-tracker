import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDayEntry } from "@/app/actions/dayEntry";
import { TodayForm } from "./TodayForm";

export default async function TodayPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/handler/sign-in");
  }

  const today = new Date().toISOString().split("T")[0];
  const entry = await getDayEntry(today);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Today</h1>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      <TodayForm date={today} initialEntry={entry} />
    </div>
  );
}

