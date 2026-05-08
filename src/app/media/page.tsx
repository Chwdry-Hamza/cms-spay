import TopBar from "@/components/TopBar";
import MediaView from "@/views/MediaView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Media library"
        subtitle="4.2 GB used of 50 GB"
        breadcrumb={["Workspace", "Media"]}
      />
      <MediaView />
    </>
  );
}
