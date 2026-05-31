'use client';

import React from 'react';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Folder, X, Settings, Sparkles, ExternalLink } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toaster';
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  type Category, type CategorySEO,
} from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { cn, slugify } from '@/lib/utils';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const SWATCHES = ['#6FE3FF', '#3AE6B0', '#FFCE5C', '#C66BFF', '#4ECBFF', '#FF5E87'];

type ModalState = { open: boolean; editing?: Category };

export default function CategoriesPage() {
  const [query, setQuery] = React.useState('');
  const [modal, setModal] = React.useState<ModalState>({ open: false });
  const [deleteCat, setDeleteCat] = React.useState<Category | null>(null);
  const { toast } = useToast();

  const { data = [], isLoading } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const filtered = data.filter((c) =>
    `${c.name} ${c.slug} ${c.description}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        actions={
          <Button size="sm" onClick={() => setModal({ open: true })}>
            <Plus />New category
          </Button>
        }
      />

      <Card>
        <div className="px-4 py-3 border-b border-line flex items-center gap-2">
          <div className="flex-1 max-w-md">
            <Input leftIcon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories…"
              rightIcon={query ? <button onClick={() => setQuery('')}><X /></button> : undefined}
            />
          </div>
        </div>

        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-spay-md" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Folder />}
              title={query ? 'No categories found' : 'No categories yet'}
              description={query ? 'Try a different search.' : 'Create your first category.'}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((c) => (
                <div key={c._id} className="spay-card-hover rounded-spay-md border border-line bg-surface/40 p-4 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-9 rounded-spay-md border flex items-center justify-center shrink-0"
                        style={{ background: `${c.color}15`, borderColor: `${c.color}50` }}>
                        <Folder className="size-4" style={{ color: c.color }} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-fg-1 text-sm leading-tight truncate">{c.name}</h3>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconSm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setModal({ open: true, editing: c })}><Pencil />Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onSelect={() => setDeleteCat(c)}><Trash2 />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-fg-3 leading-relaxed line-clamp-2 min-h-[40px]">{c.description}</p>
                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="default" size="sm">{c.postCount} post{c.postCount === 1 ? '' : 's'}</Badge>
                    </div>
                    <a
                      href={`${SITE_ORIGIN}/blog/category/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-4 hover:text-cyan-300 transition-colors"
                      aria-label="Open category page"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit modal */}
      <CategoryModal
        state={modal}
        onClose={() => setModal({ open: false })}
        onSubmit={async (body) => {
          try {
            if (modal.editing) {
              await update.mutateAsync({ id: modal.editing._id, ...body });
              toast({ title: 'Category updated', variant: 'success' });
            } else {
              await create.mutateAsync(body as any);
              toast({ title: 'Category created', variant: 'success' });
            }
            setModal({ open: false });
          } catch (err) {
            toast({ title: 'Save failed', description: apiErrorMessage(err), variant: 'danger' });
          }
        }}
        submitting={create.isPending || update.isPending}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteCat} onOpenChange={(o) => !o && setDeleteCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{deleteCat?.name}"?</DialogTitle>
            <DialogDescription>
              {deleteCat && deleteCat.postCount > 0
                ? `${deleteCat.postCount} posts use this category — they'll need to be reassigned first.`
                : 'This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteCat(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={del.isPending || (deleteCat?.postCount ?? 0) > 0}
              onClick={async () => {
                if (!deleteCat) return;
                try {
                  await del.mutateAsync(deleteCat._id);
                  toast({ title: 'Category deleted', variant: 'success' });
                  setDeleteCat(null);
                } catch (err) {
                  toast({ title: 'Delete failed', description: apiErrorMessage(err), variant: 'danger' });
                }
              }}
            >
              <Trash2 />Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

type CategoryFormBody = {
  name: string;
  description: string;
  color: string;
  slug?: string;
  content: string;
  pageSize: number;
  seo: CategorySEO;
};

function CategoryModal({
  state, onClose, onSubmit, submitting,
}: {
  state: ModalState;
  onClose: () => void;
  onSubmit: (body: CategoryFormBody) => void;
  submitting: boolean;
}) {
  const editing = state.editing;
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(SWATCHES[0]);
  const [slug, setSlug] = React.useState('');
  const [content, setContent] = React.useState('');
  const [pageSize, setPageSize] = React.useState(0);
  const [seoTitle, setSeoTitle] = React.useState('');
  const [seoDesc, setSeoDesc] = React.useState('');

  React.useEffect(() => {
    if (state.open) {
      setName(editing?.name ?? '');
      setDescription(editing?.description ?? '');
      setColor(editing?.color ?? SWATCHES[0]);
      setSlug(editing?.slug ?? '');
      setContent(editing?.content ?? '');
      setPageSize(editing?.pageSize ?? 0);
      setSeoTitle(editing?.seo?.title ?? '');
      setSeoDesc(editing?.seo?.description ?? '');
    }
  }, [state.open, editing]);

  const computedSlug = slug || slugify(name || '');

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit "${editing.name}"` : 'New category'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general"><Settings className="size-3.5" />General</TabsTrigger>
            <TabsTrigger value="seo"><Sparkles className="size-3.5" />SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Compliance" autoFocus />
              {name && <p className="text-[11px] text-fg-4 font-mono mt-1.5">slug: /blog/category/{computedSlug}</p>}
            </div>
            <div>
              <Label>Short description</Label>
              <Textarea className="mt-1.5" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One-line summary shown in cards and dropdowns." />
            </div>
            <div>
              <Label>Long-form intro <span className="text-fg-4 font-normal">(shown above the post grid on the category page)</span></Label>
              <Textarea className="mt-1.5" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder={`Helpful for SEO. Split paragraphs with a blank line.\n\nExample: "Crypto coverage from the Spay team — stablecoin launches, regulatory news, and our take on on-chain payments."`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Color</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  {SWATCHES.map((s) => (
                    <button
                      key={s} type="button" onClick={() => setColor(s)}
                      className={cn('size-7 rounded-spay-md border-2 transition-all', color === s ? 'border-fg-1 scale-110' : 'border-transparent')}
                      style={{ background: s }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="cat-page-size">Posts per page</Label>
                <Input
                  id="cat-page-size" type="number" min={0} max={100} className="mt-1.5"
                  value={pageSize || ''}
                  onChange={(e) => setPageSize(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                  placeholder="12 (site default)"
                />
                <p className="text-[11px] text-fg-4 mt-1.5">0 = use site default</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <div>
              <Label htmlFor="seo-title">SEO title</Label>
              <Input id="seo-title" className="mt-1.5" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${name || 'Category'} | Spay`} maxLength={180} />
            </div>
            <div>
              <Label htmlFor="seo-desc">Meta description</Label>
              <Textarea id="seo-desc" className="mt-1.5" rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="What will readers find in this category?" maxLength={320} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            onClick={() => onSubmit({
              name: name.trim(),
              description,
              color,
              slug: editing ? slug : undefined,
              content,
              pageSize,
              seo: {
                title:       seoTitle.trim() || undefined,
                description: seoDesc.trim() || undefined,
              },
            })}
            disabled={!name.trim() || submitting}
          >
            <Plus />
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
