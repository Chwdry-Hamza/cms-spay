'use client';

import React from 'react';
import {
  Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2,
  Loader2, ArrowRight, AlertOctagon,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/Toaster';
import { useBulkCreateRedirects, type BulkRedirectRow, type BulkRedirectResult } from '@/lib/queries';
import { apiErrorMessage } from '@/lib/api';
import { parseCSV, cn } from '@/lib/utils';

type Parsed = {
  rows: BulkRedirectRow[];
  warnings: { row: number; reason: string }[];
};

const REQUIRED_HEADERS = ['from', 'to'] as const;

const TEMPLATE_CSV = [
  'from,to',
  '/old-page,/new-page',
  '/legacy,/v2/landing',
].join('\n');

function downloadCSV(filename: string, body: string) {
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse raw CSV text into normalized BulkRedirectRow[] with row-level warnings. */
function parseRedirectCSV(text: string): Parsed {
  const grid = parseCSV(text);
  const warnings: Parsed['warnings'] = [];
  const rows: BulkRedirectRow[] = [];

  if (grid.length === 0) return { rows, warnings: [{ row: 0, reason: 'File is empty' }] };

  // Detect header row
  const first = grid[0].map((c) => c.trim().toLowerCase());
  const hasHeader = REQUIRED_HEADERS.every((h) => first.includes(h));
  const headers = hasHeader ? first : (['from', 'to'] as string[]);
  const dataStart = hasHeader ? 1 : 0;

  const fromCol = headers.indexOf('from');
  const toCol = headers.indexOf('to');

  if (fromCol < 0 || toCol < 0) {
    warnings.push({ row: 0, reason: 'CSV must have at least "from" and "to" columns' });
    return { rows, warnings };
  }

  for (let r = dataStart; r < grid.length; r++) {
    const cells = grid[r];
    if (cells.every((c) => c.trim() === '')) continue; // blank line

    const fromRaw = (cells[fromCol] ?? '').trim();
    const toRaw = (cells[toCol] ?? '').trim();
    if (!fromRaw || !toRaw) {
      warnings.push({ row: r + 1, reason: 'Missing from/to' });
      continue;
    }

    const from = fromRaw.startsWith('/') ? fromRaw : '/' + fromRaw.replace(/^\/+/, '');
    const to = toRaw;

    rows.push({ from, to });
  }

  return { rows, warnings };
}

export function CSVImportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { toast } = useToast();
  const bulk = useBulkCreateRedirects();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [filename, setFilename] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<Parsed | null>(null);
  const [conflictStrategy, setConflictStrategy] = React.useState<'skip' | 'update'>('skip');
  const [result, setResult] = React.useState<BulkRedirectResult | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // Reset when reopened
  React.useEffect(() => {
    if (open) {
      setFilename(null);
      setParsed(null);
      setResult(null);
      setConflictStrategy('skip');
    }
  }, [open]);

  const handleFile = async (file: File) => {
    setFilename(file.name);
    setResult(null);
    try {
      const text = await file.text();
      setParsed(parseRedirectCSV(text));
    } catch (err) {
      toast({ title: 'Could not read file', description: (err as Error).message, variant: 'danger' });
      setParsed({ rows: [], warnings: [{ row: 0, reason: 'File could not be read' }] });
    }
  };

  const handleImport = async () => {
    if (!parsed || parsed.rows.length === 0) return;
    try {
      const res = await bulk.mutateAsync({ rows: parsed.rows, conflictStrategy });
      setResult(res);
      const s = res.summary;
      if (s.errors === 0) {
        toast({
          title: `Imported ${s.created} created, ${s.updated} updated, ${s.skipped} skipped`,
          variant: 'success',
        });
      } else {
        toast({
          title: `Imported with ${s.errors} error${s.errors === 1 ? '' : 's'}`,
          description: `${s.created} created · ${s.updated} updated · ${s.skipped} skipped`,
          variant: 'warning',
        });
      }
    } catch (err) {
      toast({ title: 'Import failed', description: apiErrorMessage(err), variant: 'danger' });
    }
  };

  const previewRows = parsed?.rows.slice(0, 5) ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!bulk.isPending) onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import redirects from CSV</DialogTitle>
          <DialogDescription>
            Upload a <code className="font-mono text-fg-2">.csv</code> with columns{' '}
            <code className="font-mono text-cyan-300">from</code> and{' '}
            <code className="font-mono text-cyan-300">to</code>.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            if (e.target) e.target.value = '';
          }}
        />

        {!result && (
          <>
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={cn(
                'rounded-spay-md border border-dashed px-6 py-8 text-center cursor-pointer transition-all',
                dragOver
                  ? 'border-cyan-300/60 bg-cyan-300/[0.06] shadow-glow-md'
                  : 'border-line-strong bg-surface/30 hover:border-cyan-300/40'
              )}
            >
              <div className="inline-flex items-center justify-center size-11 rounded-spay-md bg-cyan-300/10 border border-cyan-300/25 text-cyan-300 mb-3">
                <FileSpreadsheet className="size-5" />
              </div>
              {filename ? (
                <>
                  <p className="text-sm font-medium text-fg-1">{filename}</p>
                  <p className="text-xs text-fg-3 mt-1">
                    {parsed?.rows.length ?? 0} valid row{parsed?.rows.length === 1 ? '' : 's'}
                    {parsed?.warnings.length ? ` · ${parsed.warnings.length} warning` : ''}
                  </p>
                  <p className="text-xs text-cyan-300 mt-2 hover:underline">Replace file…</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-fg-1">Drop CSV here</p>
                  <p className="text-xs text-fg-3 mt-1">
                    or <span className="text-cyan-300 hover:underline">browse files</span>
                  </p>
                </>
              )}
            </div>

            {/* Preview + warnings */}
            {parsed && (
              <>
                {parsed.warnings.length > 0 && (
                  <div className="rounded-spay-md border border-warning/30 bg-warning/[0.05] p-3 text-xs space-y-1">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="size-3.5 text-warning shrink-0 mt-0.5" />
                      <p className="text-fg-2 font-medium">
                        {parsed.warnings.length} row{parsed.warnings.length === 1 ? '' : 's'} skipped or coerced
                      </p>
                    </div>
                    <ul className="ml-5 space-y-0.5 max-h-24 overflow-y-auto">
                      {parsed.warnings.slice(0, 8).map((w, i) => (
                        <li key={i} className="text-fg-3">
                          <span className="font-mono">Row {w.row}</span>: {w.reason}
                        </li>
                      ))}
                      {parsed.warnings.length > 8 && (
                        <li className="text-fg-4">…and {parsed.warnings.length - 8} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {parsed.rows.length > 0 && (
                  <div className="rounded-spay-md border border-line overflow-hidden">
                    <div className="px-3 py-2 border-b border-line bg-surface/40 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-4">
                        Preview · first {previewRows.length} of {parsed.rows.length}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-4 border-b border-line">
                          <th className="text-left px-3 py-2">From</th>
                          <th className="px-2 py-2 w-6" />
                          <th className="text-left px-3 py-2">To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((r, i) => (
                          <tr key={i} className="border-b border-line last:border-b-0">
                            <td className="px-3 py-2 font-mono text-fg-1 truncate max-w-[240px]">{r.from}</td>
                            <td className="px-2 py-2"><ArrowRight className="size-3 text-fg-4" /></td>
                            <td className="px-3 py-2 font-mono text-cyan-300 truncate max-w-[280px]">{r.to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Conflict strategy */}
                <div>
                  <Label>If a "from" already exists</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(['skip', 'update'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setConflictStrategy(s)}
                        className={cn(
                          'rounded-spay-md border px-3 py-2 text-left transition-colors',
                          conflictStrategy === s
                            ? 'border-cyan-300/40 bg-cyan-300/[0.06]'
                            : 'border-line bg-surface/40 hover:border-line-strong'
                        )}
                      >
                        <p className="text-sm font-medium text-fg-1">
                          {s === 'skip' ? 'Skip existing' : 'Update existing'}
                        </p>
                        <p className="text-[11px] text-fg-3 mt-0.5">
                          {s === 'skip' ? 'Keep the current redirect untouched.' : 'Overwrite with the new row.'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-2 p-3 rounded-spay-md border border-line bg-surface/40 text-xs">
              <AlertOctagon className="size-3.5 text-fg-3 shrink-0 mt-0.5" />
              <div className="flex-1 text-fg-3 leading-relaxed">
                Not sure about the format?{' '}
                <button
                  type="button"
                  onClick={() => downloadCSV('spay-redirects-template.csv', TEMPLATE_CSV)}
                  className="text-cyan-300 hover:underline"
                >
                  <Download className="size-3 inline align-text-bottom" />&nbsp;Download template CSV
                </button>
              </div>
            </div>
          </>
        )}

        {/* Result screen */}
        {result && (
          <div className="space-y-3">
            <div className={cn(
              'rounded-spay-md border p-4 flex items-start gap-3',
              result.summary.errors === 0
                ? 'border-success/30 bg-success/[0.05]'
                : 'border-warning/30 bg-warning/[0.05]'
            )}>
              {result.summary.errors === 0
                ? <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                : <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />}
              <div>
                <p className="font-display font-semibold text-fg-1">
                  Import {result.summary.errors === 0 ? 'complete' : 'finished with warnings'}
                </p>
                <p className="text-xs text-fg-3 mt-1">
                  Processed {result.summary.received} row{result.summary.received === 1 ? '' : 's'} from your CSV.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Created', value: result.summary.created, tone: 'cyan' as const },
                { label: 'Updated', value: result.summary.updated, tone: 'cyan' as const },
                { label: 'Skipped', value: result.summary.skipped, tone: 'default' as const },
                { label: 'Errors',  value: result.summary.errors,  tone: 'danger' as const },
              ].map((s) => (
                <div key={s.label} className="rounded-spay-md border border-line bg-surface/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-fg-4 font-semibold mb-1">{s.label}</p>
                  <p className={cn(
                    'font-display font-bold text-xl leading-none',
                    s.tone === 'danger' && s.value > 0 ? 'text-danger' :
                    s.tone === 'cyan'   && s.value > 0 ? 'text-cyan-300' : 'text-fg-1'
                  )}>{s.value}</p>
                </div>
              ))}
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-spay-md border border-danger/25 bg-danger/[0.04] p-3">
                <p className="text-xs font-medium text-fg-1 mb-2">Errors</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={i} className="font-mono text-fg-3">
                      Row {e.row} <span className="text-fg-4">·</span> {e.from} <span className="text-fg-4">·</span> {e.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={bulk.isPending}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!parsed || parsed.rows.length === 0 || bulk.isPending}
            >
              {bulk.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              {bulk.isPending ? 'Importing…' : `Import ${parsed?.rows.length ?? 0} row${parsed?.rows.length === 1 ? '' : 's'}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
