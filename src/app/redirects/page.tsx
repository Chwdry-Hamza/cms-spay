import TopBar from "@/components/TopBar";
import RedirectsView from "@/views/RedirectsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Redirects"
        subtitle="184 active redirects"
        breadcrumb={["Workspace", "SEO", "Redirects"]}
      />
      <RedirectsView />
    </>
  );
}
