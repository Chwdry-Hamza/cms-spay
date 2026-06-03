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
 * Schema-driven editor for the homepage's CMS-managed content.
 *
 * The landing page layout/animation stays in code on the website; this form
 * edits only the text/images. It is fully controlled: it always emits the
 * COMPLETE merged content object so `sections` is self-contained when saved.
 */
export function HomeContentEditor({
  value,
  onChange,
}: {
  value: Record<string, any> | undefined;
  onChange: (next: Record<string, any>) => void;
}) {
  // Merge saved overrides onto defaults so every field shows its real value.
  const content = React.useMemo(() => resolveHomeContent(value), [value]);

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
      <Accordion type="multiple" defaultValue={['hero']} className="px-4">
        {HOME_CONTENT_SCHEMA.map((section: SectionDef) => (
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
