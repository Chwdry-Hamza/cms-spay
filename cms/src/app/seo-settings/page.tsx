import TopBar from "@/components/TopBar";
import SeoSettingsView from "@/views/SeoSettingsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="SEO Settings"
        subtitle="Landing-page metadata, Open Graph & per-section schema"
        breadcrumb={["Admin", "SEO Settings"]}
      />
      <SeoSettingsView />
    </>
  );
}
