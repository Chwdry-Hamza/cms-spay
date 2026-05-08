import TopBar from "@/components/TopBar";
import AnalyticsView from "@/views/AnalyticsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="SEO Analytics"
        subtitle="Last 90 days · synced 12 minutes ago"
        breadcrumb={["Workspace", "Analytics"]}
      />
      <AnalyticsView />
    </>
  );
}
