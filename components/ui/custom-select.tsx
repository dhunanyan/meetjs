"use client";

import * as React from "react";

export type SelectOption<T extends string> = {
  label: string;
  value: T;
  hint?: string;
};

export function CustomSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const selected = options.find((o) => o.value === value) ?? options[0] ?? null;
  const hasOptions = options.length > 0;

  React.useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`custom-select ${open ? "open" : ""} ${disabled ? "disabled" : ""}`}
    >
      <button
        type="button"
        className="select-trigger"
        onClick={() => !disabled && hasOptions && setOpen((prev) => !prev)}
        disabled={disabled || !hasOptions}
        aria-expanded={open}
      >
        <span className="select-text">{selected?.label ?? "No options"}</span>
        <span className="select-icon">▾</span>
      </button>
      {selected?.hint ? (
        <div className="select-hint">{selected.hint}</div>
      ) : null}
      {open && hasOptions ? (
        <div className="select-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`select-option ${option.value === value ? "active" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.hint ? <small>{option.hint}</small> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
