import TopBar from "@/components/TopBar";
import PagesView from "@/views/PagesView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Pages"
        subtitle="142 pages · 8 drafts · 3 scheduled"
        breadcrumb={["Workspace", "Pages"]}
      />
      <PagesView />
    </>
  );
}
