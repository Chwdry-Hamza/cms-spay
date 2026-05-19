import TopBar from "@/components/TopBar";
import RedirectsView from "@/views/RedirectsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Redirects"
        subtitle="308 redirects preserving inbound SEO equity after slug renames"
        breadcrumb={["Admin", "Redirects"]}
      />
      <RedirectsView />
    </>
  );
}
