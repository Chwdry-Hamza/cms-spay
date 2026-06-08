'use client';

import React from 'react';
import { Image as ImageGlyph, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/Accordion';
import { MediaPickerModal } from '@/components/MediaPickerModal';
import { type MediaItem } from '@/lib/queries';
import {
  HOME_CONTENT_SCHEMA, resolveHomeContent, type Field, type SectionDef,
} from '@/lib/homeContent';

/** Imperatively open the media library and run a callback with the picked URL. */
type RequestPick = (apply: (url: string) => void) => void;

/**
 * Schema-driven editor for a page's CMS-managed `sections` content.
 *
 * The page layout/animation stays in code on the website; this form edits only
 * the text/images. It is fully controlled: it always emits the COMPLETE merged
 * content object so `sections` is self-contained when saved. Defaults to the
 * homepage schema, but any reserved page (e.g. About) can pass its own
 * `schema` + `resolve`.
 */
export function HomeContentEditor({
  value,
  onChange,
  schema = HOME_CONTENT_SCHEMA,
  resolve = resolveHomeContent,
}: {
  value: Record<string, any> | undefined;
  onChange: (next: Record<string, any>) => void;
  schema?: SectionDef[];
  resolve?: (raw: any) => Record<string, any>;
}) {
  // Merge saved overrides onto defaults so every field shows its real value.
  const content = React.useMemo(() => resolve(value), [value, resolve]);

  // Single shared media picker; an image field registers a callback to apply
  // the picked URL to itself.
  const [pickApply, setPickApply] = React.useState<((url: string) => void) | null>(null);
  const requestPick: RequestPick = (apply) => setPickApply(() => apply);

  const setSectionField = (sectionKey: string, fieldKey: string, fieldVal: any) => {
    onChange({
      ...content,
      [sectionKey]: { ...content[sectionKey], [fieldKey]: fieldVal },
    });
  };

  return (
    <div className="rounded-spay-md border border-line bg-surface/30">
      <Accordion type="multiple" defaultValue={[schema[0]?.key]} className="px-4">
        {schema.map((section: SectionDef) => (
          <AccordionItem key={section.key} value={section.key}>
            <AccordionTrigger>{section.label}</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {section.fields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={content[section.key]?.[field.key]}
                  onChange={(v) => setSectionField(section.key, field.key, v)}
                  onRequestPick={requestPick}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <MediaPickerModal
        open={!!pickApply}
        onOpenChange={(o) => !o && setPickApply(null)}
        accept="image"
        onPick={(media: MediaItem) => {
          pickApply?.(media.url);
          setPickApply(null);
        }}
      />
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  onRequestPick,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
  onRequestPick: RequestPick;
}) {
  // Optional text/textarea fields collapse to a "+ Add" button when empty, so
  // sections that don't use them (e.g. a bullets-only legal section) don't show
  // an empty box. The field reappears as soon as it has a value.
  if ((field.type === 'text' || field.type === 'textarea') && field.optional) {
    return <OptionalText field={field} value={value} onChange={onChange} />;
  }

  switch (field.type) {
    case 'text':
      return (
        <Labeled label={field.label}>
          <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </Labeled>
      );

    case 'textarea':
      return (
        <Labeled label={field.label}>
          <Textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={3} />
        </Labeled>
      );

    case 'image':
      return (
        <ImageField
          label={field.label}
          value={value}
          onChange={onChange}
          onPick={() => onRequestPick((url) => onChange(url))}
        />
      );

    case 'group':
      return (
        <fieldset className="rounded-spay-md border border-line/70 bg-surface-deeper/30 p-3 space-y-3">
          <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-fg-3">
            {field.label}
          </legend>
          {field.fields.map((sub) => (
            <FieldControl
              key={sub.key}
              field={sub}
              value={value?.[sub.key]}
              onChange={(v) => onChange({ ...(value ?? {}), [sub.key]: v })}
              onRequestPick={onRequestPick}
            />
          ))}
        </fieldset>
      );

    case 'objectList': {
      const items: any[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-3">{field.label}</p>
          {items.map((item, i) => (
            <fieldset key={i} className="rounded-spay-md border border-line/70 bg-surface-deeper/30 p-3 space-y-3">
              <legend className="px-1 text-[11px] text-fg-4">{field.itemLabel} {i + 1}</legend>
              {field.itemFields.map((sub) => (
                <FieldControl
                  key={sub.key}
                  field={sub}
                  value={item?.[sub.key]}
                  onRequestPick={onRequestPick}
                  onChange={(v) => {
                    const next = items.slice();
                    next[i] = { ...(item ?? {}), [sub.key]: v };
                    onChange(next);
                  }}
                />
              ))}
            </fieldset>
          ))}
        </div>
      );
    }

    case 'stringList': {
      const items: any[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-3">{field.label}</p>
          {items.map((item, i) =>
            field.itemType === 'image' ? (
              <ImageField
                key={i}
                label={`${field.itemLabel} ${i + 1}`}
                value={item}
                onChange={(url) => setAt(items, i, url, onChange)}
                onPick={() => onRequestPick((url) => setAt(items, i, url, onChange))}
              />
            ) : (
              <Labeled key={i} label={`${field.itemLabel} ${i + 1}`}>
                <Input value={item ?? ''} onChange={(e) => setAt(items, i, e.target.value, onChange)} />
              </Labeled>
            )
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

function setAt(items: any[], i: number, v: any, onChange: (next: any[]) => void) {
  const next = items.slice();
  next[i] = v;
  onChange(next);
}

/** Optional text/textarea: shows a "+ Add …" button until it has a value. */
function OptionalText({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'text' | 'textarea' | 'image' }>;
  value: any;
  onChange: (v: any) => void;
}) {
  const hasValue = typeof value === 'string' && value.trim() !== '';
  const [expanded, setExpanded] = React.useState(hasValue);
  // Stay open once it has had a value, so clearing the text mid-edit doesn't
  // collapse the field and steal focus.
  React.useEffect(() => {
    if (hasValue) setExpanded(true);
  }, [hasValue]);

  if (!hasValue && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-1 rounded-spay-sm border border-dashed border-line px-2.5 py-1.5 text-xs text-fg-3 transition-colors hover:border-cyan-300/40 hover:text-cyan-300"
      >
        + Add {field.label.toLowerCase()}
      </button>
    );
  }

  return (
    <Labeled label={field.label}>
      {field.type === 'textarea' ? (
        <Textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </Labeled>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-fg-2">{label}</Label>
      {children}
    </div>
  );
}

/** Image field: preview + "Pick from library" / "Clear" — mirrors the SEO panel. */
function ImageField({
  label,
  value,
  onChange,
  onPick,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  onPick: () => void;
}) {
  const v = (value ?? '').trim();
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-fg-2">{label}</Label>
      <div className="rounded-spay-md border border-line bg-surface/40 overflow-hidden">
        {v ? (
          <div className="aspect-video bg-surface relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v} alt="" className="absolute inset-0 w-full h-full object-contain" />
          </div>
        ) : (
          <div className="aspect-video bg-surface flex items-center justify-center text-fg-4 text-xs">
            no image
          </div>
        )}
        <div className="flex items-center gap-2 p-2 border-t border-line">
          <Button size="sm" variant="secondary" onClick={onPick}>
            <ImageGlyph className="size-3.5" />
            Pick
          </Button>
          {v && (
            <Button size="sm" variant="ghost" className="text-fg-3 hover:text-fg-1" onClick={() => onChange('')}>
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
