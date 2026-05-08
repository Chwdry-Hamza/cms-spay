import TopBar from "@/components/TopBar";
import SitemapView from "@/views/SitemapView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Sitemap"
        subtitle="Auto-generated · last updated 2h ago"
        breadcrumb={["Workspace", "SEO", "Sitemap"]}
      />
      <SitemapView />
    </>
  );
}
