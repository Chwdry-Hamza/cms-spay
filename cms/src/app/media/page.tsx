import TopBar from "@/components/TopBar";
import MediaView from "@/views/MediaView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Media library"
        subtitle="Images & assets referenced by your landing-page sections"
        breadcrumb={["Workspace", "Media"]}
      />
      <MediaView />
    </>
  );
}
