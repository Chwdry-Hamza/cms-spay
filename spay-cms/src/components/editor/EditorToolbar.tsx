'use client';

import React from 'react';
import {
  Bold, Italic, Link2,
  Heading1, Heading2, Heading3, List, ListOrdered,
  ChevronDown, Undo2, Redo2,
  Table as TableIcon, Plus, Trash2,
  ChevronsRight, ChevronsDown, ChevronsLeft, ChevronsUp,
} from 'lucide-react';
import type { Editor as TiptapEditorType } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/Dropdown';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/Tooltip';

type ToolButtonProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
function ToolButton({ icon, label, active, disabled, onClick }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          disabled={disabled}
          className={cn(
            'inline-flex items-center justify-center size-8 rounded-spay-sm transition-colors disabled:opacity-30 disabled:pointer-events-none [&_svg]:size-4',
            active ? 'bg-cyan-300/15 text-cyan-300' : 'text-fg-2 hover:bg-white/[0.06] hover:text-fg-1'
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-line mx-0.5" />;
}

const HEADING_LABEL: Record<number | string, string> = {
  0: 'Paragraph', 1: 'Heading 1', 2: 'Heading 2', 3: 'Heading 3', 4: 'Heading 4', 5: 'Heading 5', 6: 'Heading 6',
};

export function EditorToolbar({
  editor,
  onInsertLink,
}: {
  editor: TiptapEditorType | null;
  onInsertLink: () => void;
}) {
  // re-render on selection / transaction
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    if (!editor) return;
    const handler = () => force();
    editor.on('selectionUpdate', handler);
    editor.on('transaction', handler);
    return () => {
      editor.off('selectionUpdate', handler);
      editor.off('transaction', handler);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="sticky top-0 z-20 h-12 px-3 bg-surface-deeper/85 backdrop-blur-xl border-b border-line" />
    );
  }

  const currentHeading = [1, 2, 3, 4, 5, 6].find((l) => editor.isActive('heading', { level: l })) ?? 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="sticky top-0 z-20 flex items-center gap-0.5 px-3 py-1.5 bg-surface-deeper/85 backdrop-blur-xl border-b border-line overflow-x-auto">
        <ToolButton icon={<Undo2 />} label="Undo (⌘Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton icon={<Redo2 />} label="Redo (⌘⇧Z)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
        <Divider />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1 h-8 px-2 rounded-spay-sm text-sm text-fg-2 hover:bg-white/[0.06] hover:text-fg-1 transition-colors whitespace-nowrap">
              <span>{HEADING_LABEL[currentHeading]}</span>
              <ChevronDown className="size-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
              <span className="text-fg-1">P</span>
              <span className="text-fg-3 ml-2">Paragraph</span>
            </DropdownMenuItem>
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
              <DropdownMenuItem key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()}>
                <span className={cn('font-display font-bold text-fg-1', level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : level === 3 ? 'text-lg' : 'text-base')}>
                  H{level}
                </span>
                <span className="text-fg-3 ml-2">Heading {level}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Divider />

        <ToolButton icon={<Bold />}   label="Bold (⌘B)"   active={editor.isActive('bold')}   onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton icon={<Italic />} label="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />

        <Divider />

        <ToolButton icon={<Heading1 />} label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolButton icon={<Heading2 />} label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton icon={<Heading3 />} label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

        <Divider />

        <ToolButton icon={<List />}        label="Bullet list"   active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton icon={<ListOrdered />} label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />

        <Divider />

        <ToolButton icon={<Link2 />} label="Insert link" active={editor.isActive('link')} onClick={onInsertLink} />

        {/* Table */}
        {editor.isActive('table') ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 h-8 px-2 rounded-spay-sm text-sm bg-cyan-300/15 text-cyan-300 transition-colors">
                <TableIcon className="size-4" />
                <ChevronDown className="size-3 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                <ChevronsDown />Insert row below
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
                <ChevronsUp />Insert row above
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <ChevronsRight />Insert column right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
                <ChevronsLeft />Insert column left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                <Plus />Toggle header row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
                <Trash2 />Delete row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
                <Trash2 />Delete column
              </DropdownMenuItem>
              <DropdownMenuItem destructive onClick={() => editor.chain().focus().deleteTable().run()}>
                <Trash2 />Delete table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ToolButton
            icon={<TableIcon />}
            label="Insert table (3×3)"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          />
        )}
      </div>
    </TooltipProvider>
  );
}
