import { useRef } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  fallback = "",
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || fallback;
  const nextValue =
    textarea.value.slice(0, start) +
    before +
    selected +
    after +
    textarea.value.slice(end);
  const cursor = start + before.length + selected.length + after.length;
  return { nextValue, selectionStart: cursor, selectionEnd: cursor };
}

function listSelection(textarea: HTMLTextAreaElement, ordered: boolean) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end).trim() || "Жагсаалтын мөр";
  const items = selected
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<li>${item}</li>`)
    .join("");
  const wrapper = ordered ? ["<ol>", "</ol>"] : ["<ul>", "</ul>"];
  const nextValue = textarea.value.slice(0, start) + wrapper[0] + items + wrapper[1] + textarea.value.slice(end);
  const cursor = start + wrapper[0].length + items.length + wrapper[1].length;
  return { nextValue, selectionStart: cursor, selectionEnd: cursor };
}

export function SimpleRichTextEditor({ label, value, onChange, rows = 8, className = "" }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const apply = (transform: (textarea: HTMLTextAreaElement) => { nextValue: string; selectionStart: number; selectionEnd: number }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = transform(textarea);
    onChange(result.nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  return (
    <label className={`profile-edit-field profile-edit-field-full ${className}`.trim()}>
      <span>{label}</span>
      <div className="simple-editor">
        <div className="simple-editor-toolbar">
          <button type="button" onClick={() => apply((textarea) => wrapSelection(textarea, "<strong>", "</strong>", "Тод"))}>
            B
          </button>
          <button type="button" onClick={() => apply((textarea) => wrapSelection(textarea, "<em>", "</em>", "Налуу"))}>
            I
          </button>
          <button type="button" onClick={() => apply((textarea) => wrapSelection(textarea, "<h3>", "</h3>", "Гарчиг"))}>
            H
          </button>
          <button type="button" onClick={() => apply((textarea) => wrapSelection(textarea, "<p>", "</p>", "Мөр"))}>
            P
          </button>
          <button type="button" onClick={() => apply((textarea) => listSelection(textarea, false))}>
            UL
          </button>
          <button type="button" onClick={() => apply((textarea) => listSelection(textarea, true))}>
            OL
          </button>
        </div>
        <textarea ref={textareaRef} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      <small className="simple-editor-help">`B`, `I`, `H`, `P`, `UL`, `OL` товчоор хялбар формат оруулна.</small>
    </label>
  );
}
