import TopBar from "@/components/TopBar";
import KeywordsView from "@/views/KeywordsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Keywords"
        subtitle="Tracking 1,284 keywords across 4 search engines"
        breadcrumb={["Workspace", "SEO", "Keywords"]}
      />
      <KeywordsView />
    </>
  );
}
