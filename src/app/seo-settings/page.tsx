import TopBar from "@/components/TopBar";
import SeoSettingsView from "@/views/SeoSettingsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="SEO Settings"
        subtitle="Global metadata, indexing & schema"
        breadcrumb={["Workspace", "SEO", "Settings"]}
      />
      <SeoSettingsView />
    </>
  );
}
