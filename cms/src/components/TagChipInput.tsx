"use client";

import * as React from "react";
import Icon from "@/components/Icon";
import type { TagUsage } from "@/lib/content-pages-api";

/**
 * Chip-style tag editor with autocomplete.
 *
 * Renders existing tags as removable chips, plus a free-text input at the
 * end. Editors confirm a new tag by pressing **Enter** or **,** (comma),
 * or by clicking a suggestion from the autocomplete dropdown.
 * **Backspace** on an empty input removes the last chip — same as every
 * other chip input on the web. Duplicates are filtered case-insensitively
 * (the chips themselves are always stored lowercase + trimmed).
 *
 * The component is presentational and stateless about the canonical list:
 * the parent owns `value` and `onChange`, the same pattern the rest of
 * the editor's form fields use.
 */
export function TagChipInput({
  value,
  onChange,
  suggestions,
  placeholder = "Add a tag…",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  /** Known tags across the workspace, ranked by usage. */
  suggestions: TagUsage[];
  placeholder?: string;
}) {
  const [input, setInput] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  /** Normalize a candidate tag the same way the backend does so duplicate
   *  detection here matches what gets stored. */
  const normalize = (raw: string): string =>
    raw.trim().replace(/\s+/g, " ").toLowerCase();

  const commitTag = (raw: string) => {
    const tag = normalize(raw);
    if (!tag) return;
    if (value.some((t) => normalize(t) === tag)) return;
    onChange([...value, tag]);
    setInput("");
    setHighlightIndex(0);
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  // Autocomplete suggestions = matching tags not yet picked, capped at 6.
  // We match on `startsWith` first (most predictive) then fall back to
  // substring matches so partial recall works ("ance" → "compliance").
  const trimmedInput = input.trim().toLowerCase();
  const filteredSuggestions = React.useMemo(() => {
    if (!trimmedInput) {
      return suggestions
        .filter((s) => !value.some((v) => normalize(v) === s.tag))
        .slice(0, 6);
    }
    const pool = suggestions.filter(
      (s) => !value.some((v) => normalize(v) === s.tag),
    );
    const starts = pool.filter((s) => s.tag.startsWith(trimmedInput));
    const substr = pool.filter(
      (s) => !s.tag.startsWith(trimmedInput) && s.tag.includes(trimmedInput),
    );
    return [...starts, ...substr].slice(0, 6);
  }, [suggestions, trimmedInput, value]);

  // Clamp highlight when the list shrinks (typed past last suggestion etc.)
  React.useEffect(() => {
    if (highlightIndex >= filteredSuggestions.length) {
      setHighlightIndex(0);
    }
  }, [filteredSuggestions.length, highlightIndex]);

  // Close the suggestion popover on outside click.
  React.useEffect(() => {
    if (!focused) return;
    const onDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [focused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter / comma commits the typed tag, OR the highlighted suggestion
    // if the popover is open.
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (focused && filteredSuggestions[highlightIndex]) {
        commitTag(filteredSuggestions[highlightIndex].tag);
      } else if (input.trim()) {
        commitTag(input);
      }
      return;
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      // Familiar chip-input behaviour: empty backspace nibbles the last
      // chip so editors can correct without reaching for the X icon.
      removeAt(value.length - 1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) =>
        filteredSuggestions.length === 0
          ? 0
          : (i + 1) % filteredSuggestions.length,
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) =>
        filteredSuggestions.length === 0
          ? 0
          : (i - 1 + filteredSuggestions.length) %
            filteredSuggestions.length,
      );
      return;
    }
    if (e.key === "Escape") {
      setFocused(false);
      return;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          padding: "6px 8px",
          minHeight: 38,
          borderRadius: 8,
          background: "rgba(255,255,255,.03)",
          border: focused
            ? "1px solid rgba(4,186,191,.55)"
            : "1px solid var(--line)",
          boxShadow: focused
            ? "0 0 0 3px rgba(4,186,191,.08)"
            : "none",
          transition: "border-color .12s, box-shadow .12s",
          cursor: "text",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 4px 3px 9px",
              fontSize: 11.5,
              borderRadius: 999,
              background: "rgba(4,186,191,.10)",
              border: "1px solid rgba(4,186,191,.30)",
              color: "var(--accent-2)",
              fontFamily: "Geist Mono, ui-monospace, monospace",
              letterSpacing: ".02em",
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
              title={`Remove "${tag}"`}
              style={{
                all: "unset",
                display: "inline-grid",
                placeItems: "center",
                width: 16,
                height: 16,
                borderRadius: "50%",
                cursor: "pointer",
                color: "var(--accent-2)",
                opacity: 0.7,
                transition: "opacity .1s, background .1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.background = "rgba(4,186,191,.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon name="x" size={9} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Flush the in-progress tag on blur so editors don't lose
            // half-typed entries when they tab away (common SEO-team gripe
            // with chip inputs that *only* commit on Enter).
            if (input.trim()) commitTag(input);
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{
            flex: "1 1 120px",
            minWidth: 80,
            padding: "4px 4px",
            border: "none",
            background: "transparent",
            color: "var(--text-1)",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {focused && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 40,
            background: "#0b1126",
            border: "1px solid rgba(4,186,191,.30)",
            borderRadius: 10,
            boxShadow: "0 14px 40px -10px rgba(0,0,0,.7)",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: 220,
            overflowY: "auto",
          }}
          className="nice-scroll"
        >
          {filteredSuggestions.map((s, i) => {
            const highlighted = i === highlightIndex;
            return (
              <button
                key={s.tag}
                type="button"
                onMouseDown={(e) => {
                  // mousedown fires before blur, so we can commit without
                  // the input losing focus and dropping the click.
                  e.preventDefault();
                  commitTag(s.tag);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                style={{
                  all: "unset",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 9px",
                  borderRadius: 7,
                  cursor: "pointer",
                  background: highlighted
                    ? "rgba(4,186,191,.14)"
                    : "transparent",
                  transition: "background .1s",
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11.5,
                    color: highlighted
                      ? "var(--accent-2)"
                      : "var(--text-1)",
                    letterSpacing: ".02em",
                    flex: 1,
                  }}
                >
                  {s.tag}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 9.5,
                    color: "var(--text-3)",
                    letterSpacing: ".08em",
                  }}
                >
                  ×{s.usage}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
