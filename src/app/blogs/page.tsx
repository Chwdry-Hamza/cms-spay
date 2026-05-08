import TopBar from "@/components/TopBar";
import BlogsView from "@/views/BlogsView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Blogs"
        subtitle="38 posts across 6 categories"
        breadcrumb={["Workspace", "Content", "Blogs"]}
      />
      <BlogsView />
    </>
  );
}
