import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Download } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Understand your patterns and trends
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Summary Placeholder */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Weekly Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            View your weekly investment patterns and identify your most
            consistent areas.
          </p>
        </Card>

        {/* Trend Charts Placeholder */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Trend Analysis</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualize how your investments in different life areas evolve over
            time.
          </p>
        </Card>

        {/* Export Placeholder */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Export Data</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Download your life investment data for further analysis or backup.
          </p>
        </Card>
      </div>

      {/* Additional placeholder sections */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          More insights and analytics features are on the way, including:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>• Category-specific trends and correlations</li>
          <li>• Mood and energy pattern recognition</li>
          <li>• Minimum Viable Day streak tracking</li>
          <li>• Monthly reports and reflections</li>
        </ul>
      </Card>
    </div>
  );
}

