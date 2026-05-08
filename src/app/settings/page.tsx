import TopBar from "@/components/TopBar";
import SettingsView from "@/views/SettingsView";

export default function Page() {
  return (
    <>
      <TopBar title="Settings" breadcrumb={["Workspace", "Settings"]} />
      <SettingsView />
    </>
  );
}
