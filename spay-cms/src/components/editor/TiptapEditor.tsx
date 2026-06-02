'use client';

import React from 'react';
import { useEditor, EditorContent, type Editor as TiptapEditorType } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { cn } from '@/lib/utils';

type Props = {
  value: any;
  onChange: (json: any) => void;
  onEditor?: (editor: TiptapEditorType | null) => void;
  placeholder?: string;
  className?: string;
};

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

// The live website origin (where internal links actually resolve). Internal
// links are stored as relative paths (e.g. /privacy-policy); opening one from
// the CMS editor should point at the website, not the CMS itself.
//
// Use `||` (not `??`) so an empty-string env var also falls back, and keep a
// hard fallback at the call site so we can NEVER emit a bare relative path
// (that would open against the CMS origin, e.g. :3001).
const WEBSITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

function toWebsiteUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) return href; // external/absolute — leave as-is
  const origin = WEBSITE_ORIGIN || 'http://localhost:3000';
  if (href.startsWith('/')) return `${origin}${href}`; // internal relative path → website origin
  return href; // #anchors, mailto:, tel:, etc.
}

/**
 * Intercept a click on a link inside the editor: open it in a new tab pointed
 * at the website origin instead of letting the anchor navigate against the CMS.
 * Returns true when it handled the click (so ProseMirror treats it as consumed).
 */
function handleLinkClick(event: MouseEvent): boolean {
  const anchor = (event.target as HTMLElement | null)?.closest?.('a');
  if (!anchor) return false;
  const href = anchor.getAttribute('href') ?? '';
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }
  event.preventDefault();
  window.open(toWebsiteUrl(href), '_blank', 'noopener,noreferrer');
  return true;
}

export function TiptapEditor({ value, onChange, onEditor, placeholder = 'Write or press / for commands…', className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', class: 'text-cyan-300 underline-offset-4 hover:underline' },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'spay-table' } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value && Object.keys(value).length ? value : emptyDoc,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    // Intercept link clicks via ProseMirror's handleDOMEvents, which registers
    // a real `click` DOM listener (so preventDefault actually cancels the
    // anchor's target="_blank" navigation — handleClick fires on mouseup, too
    // late for that). Internal links are rewritten to the website origin and
    // opened in a new tab.
    editorProps: {
      handleDOMEvents: {
        click: (_view, event) => handleLinkClick(event),
        auxclick: (_view, event) => handleLinkClick(event),
      },
    },
    immediatelyRender: false,
  });

  // expose editor instance to parent so the toolbar can drive it
  React.useEffect(() => {
    onEditor?.(editor);
    return () => onEditor?.(null);
  }, [editor, onEditor]);

  // Sync external value resets (e.g. switching pages without remount).
  //
  // Defer to a microtask because TipTap v3's `setContent` calls `flushSync`
  // internally, which throws when invoked inside React's render/commit phase.
  // queueMicrotask lets the current commit finish first.
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) === JSON.stringify(value) || !value) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed) return;
      editor.commands.setContent(value, { emitUpdate: false });
    });
    return () => { cancelled = true; };
  }, [value, editor]);

  return (
    <div className={cn('spay-tiptap', className)}>
      <EditorContent editor={editor} />
      <style jsx global>{`
        .spay-tiptap .ProseMirror {
          outline: none;
          min-height: 300px;
          color: var(--spay-fg-2);
          font-size: 16px;
          line-height: 1.65;
          padding-bottom: 1rem;
        }
        .spay-tiptap .ProseMirror :first-child { margin-top: 0; }
        .spay-tiptap .ProseMirror p { margin: 0.5em 0; }
        .spay-tiptap .ProseMirror h1 {
          font-family: var(--spay-font-display);
          font-weight: 700;
          font-size: 2rem;
          letter-spacing: -0.02em;
          color: var(--spay-fg-1);
          margin: 1.2em 0 0.4em;
          line-height: 1.15;
        }
        .spay-tiptap .ProseMirror h2 {
          font-family: var(--spay-font-display);
          font-weight: 700;
          font-size: 1.5rem;
          letter-spacing: -0.015em;
          color: var(--spay-fg-1);
          margin: 1em 0 0.4em;
          line-height: 1.2;
        }
        .spay-tiptap .ProseMirror h3 {
          font-family: var(--spay-font-display);
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--spay-fg-1);
          margin: 1em 0 0.4em;
        }
        .spay-tiptap .ProseMirror h4,
        .spay-tiptap .ProseMirror h5,
        .spay-tiptap .ProseMirror h6 {
          font-family: var(--spay-font-display);
          font-weight: 600;
          color: var(--spay-fg-1);
          margin: 1em 0 0.4em;
        }
        .spay-tiptap .ProseMirror strong { color: var(--spay-fg-1); font-weight: 700; }
        .spay-tiptap .ProseMirror em { color: var(--spay-fg-1); }
        .spay-tiptap .ProseMirror ul,
        .spay-tiptap .ProseMirror ol { padding-left: 1.25rem; margin: 0.5em 0; }
        .spay-tiptap .ProseMirror ul li { list-style-type: disc; margin: 0.25em 0; }
        .spay-tiptap .ProseMirror ol li { list-style-type: decimal; margin: 0.25em 0; }
        .spay-tiptap .ProseMirror ul li::marker { color: var(--spay-cyan-300); }
        .spay-tiptap .ProseMirror ol li::marker { color: var(--spay-cyan-300); font-family: var(--spay-font-mono); }
        .spay-tiptap .ProseMirror a {
          color: var(--spay-cyan-300);
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }
        .spay-tiptap .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--spay-fg-4);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .spay-tiptap .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          width: 100%;
          table-layout: fixed;
          overflow: hidden;
        }
        .spay-tiptap .ProseMirror th,
        .spay-tiptap .ProseMirror td {
          border: 1px solid var(--spay-border);
          padding: 0.5em 0.75em;
          vertical-align: top;
          position: relative;
          min-width: 80px;
        }
        .spay-tiptap .ProseMirror th {
          background: rgba(111, 227, 255, 0.04);
          color: var(--spay-fg-1);
          font-weight: 600;
          text-align: left;
        }
        .spay-tiptap .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: '';
          inset: 0;
          background: rgba(111, 227, 255, 0.15);
          pointer-events: none;
        }
        .spay-tiptap .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background: var(--spay-cyan-400);
          pointer-events: none;
        }
        .spay-tiptap .ProseMirror.resize-cursor {
          cursor: col-resize;
        }
      `}</style>
    </div>
  );
}

export type { TiptapEditorType };
