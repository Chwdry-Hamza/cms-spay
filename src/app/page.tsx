import TopBar from "@/components/TopBar";
import DashboardView from "@/views/DashboardView";

export default function Home() {
  return (
    <>
      <TopBar
        title="Welcome back, Elena"
        subtitle="Here's what's happening across acme.studio today."
        breadcrumb={["Workspace", "Dashboard"]}
      />
      <DashboardView />
    </>
  );
}
