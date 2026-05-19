import ContentPageEditorView from "@/views/ContentPageEditorView";

export const metadata = {
  title: "Edit page · Spay CMS",
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentPageEditorView slug={slug} />;
}
