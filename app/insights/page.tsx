import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { getInsightsData } from "@/app/actions/insights";
import { InsightsPageClient } from "./InsightsPageClient";

export default async function InsightsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/handler/sign-in");
  }

  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const data = await getInsightsData({
    from: thirtyDaysAgo,
    to: today,
  });

  return (
    <InsightsPageClient 
      initialData={data} 
      initialRange="last-30-days" 
    />
  );
}

