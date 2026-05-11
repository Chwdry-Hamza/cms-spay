import TopBar from "@/components/TopBar";
import AnalyticsView from "@/views/AnalyticsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Landing analytics"
        subtitle="Performance & engagement across the SPay landing page"
        breadcrumb={["Workspace", "Analytics"]}
      />
      <AnalyticsView />
    </>
  );
}
