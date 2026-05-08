"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import TopBar from "@/components/TopBar";
import EditorView from "@/views/EditorView";

function EditorPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const title = params?.get("title") || "Untitled post";
  return (
    <>
      <TopBar
        title={title}
        subtitle="Auto-saved · Mira Chen"
        breadcrumb={["Workspace", "Content", "Blogs", "Editor"]}
        actions={
          <>
            <button className="btn ghost" onClick={() => router.push("/blogs")}>
              <Icon name="arrow-left" size={13} />Back
            </button>
            <button className="btn"><Icon name="eye" size={13} />Preview</button>
          </>
        }
      />
      <EditorView />
    </>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={null}>
      <EditorPageInner />
    </React.Suspense>
  );
}
