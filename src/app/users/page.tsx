import TopBar from "@/components/TopBar";
import UsersView from "@/views/UsersView";

export default function Page() {
  return (
    <>
      <TopBar
        title="Users"
        subtitle="12 of 25 seats used"
        breadcrumb={["Workspace", "Settings", "Users"]}
      />
      <UsersView />
    </>
  );
}
