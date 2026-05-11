import TopBar from "@/components/TopBar";
import SectionsView from "@/views/SectionsView";

export const metadata = {
  title: "Sections · Spay CMS",
};

export default function SectionsPage() {
  return (
    <>
      <TopBar
        title="Sections"
        subtitle="Every detected component from your spay-website codebase, ready to manage."
        breadcrumb={["Workspace", "Sections"]}
      />
      <SectionsView />
    </>
  );
}
