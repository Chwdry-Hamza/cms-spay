import TopBar from "@/components/TopBar";
import DashboardView from "@/views/DashboardView";

export default function Home() {
  return (
    <>
      <TopBar
        title="Welcome back, Elena"
        subtitle="Here's what's happening on spay.com today."
        breadcrumb={["Workspace", "Dashboard"]}
      />
      <DashboardView />
    </>
  );
}
