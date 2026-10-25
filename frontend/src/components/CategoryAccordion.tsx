import type { FacetCategory } from "../types";

type Props = {
  title: string;
  options: FacetCategory[];
  selectedIds: number[];
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onSelect: (id: number) => void;
  allLabel?: string;
  onShowAll?: () => void;
};

// "Санхүү" -> "санхүү", харин "IT & Хэгжил" мэт товчлолыг хэвээр үлдээнэ.
function lowerFirst(text: string) {
  return text.length > 1 && text[1] === text[1].toLowerCase() && text[0] !== text[0].toLowerCase() ? text[0].toLowerCase() + text.slice(1) : text;
}

export function CategoryAccordion({ title, options, selectedIds, expandedIds, onToggleExpand, onSelect, allLabel, onShowAll }: Props) {
  const known = new Set(options.map((option) => option.id));
  const parents = options.filter((option) => !option.parent_id || !known.has(option.parent_id));
  if (!parents.length) return null;
  const selected = new Set(selectedIds);

  return (
    <nav className="cat-acc" aria-label={title}>
      <h6 className="cat-acc-title">{title}</h6>
      <ul className="cat-acc-list">
        {parents.map((parent) => {
          const kids = options.filter((option) => option.parent_id === parent.id);
          const hasKids = kids.length > 0;
          const open = hasKids && expandedIds.has(parent.id);
          const active = selected.has(parent.id) || kids.some((kid) => selected.has(kid.id));
          return (
            <li key={parent.id} className={`cat-acc-item ${active ? "is-active" : ""} ${open ? "is-open" : ""}`}>
              <button
                type="button"
                className="cat-acc-head"
                aria-expanded={hasKids ? open : undefined}
                onClick={() => (hasKids ? onToggleExpand(parent.id) : onSelect(parent.id))}
              >
                <span>{parent.name}</span>
                {hasKids ? (
                  <svg className="cat-acc-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                ) : null}
              </button>
              {hasKids ? (
                <div className="cat-acc-sub">
                  <ul>
                    <li>
                      <button type="button" className={`cat-acc-link ${selected.has(parent.id) ? "is-selected" : ""}`} onClick={() => onSelect(parent.id)}>
                        Бүх {lowerFirst(parent.name)}
                      </button>
                    </li>
                    {kids.map((kid) => (
                      <li key={kid.id}>
                        <button type="button" className={`cat-acc-link ${selected.has(kid.id) ? "is-selected" : ""}`} onClick={() => onSelect(kid.id)}>
                          {kid.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {allLabel && onShowAll ? (
        <button type="button" className="cat-acc-all" onClick={onShowAll}>
          {allLabel}
        </button>
      ) : null}
    </nav>
  );
}
