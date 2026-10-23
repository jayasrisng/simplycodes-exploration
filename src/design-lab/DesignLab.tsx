import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { layouts, type Layout, type Merchant } from "../part-two-evidence";
import { Preview, BlockContent } from "./Preview";
import { reviewDesign } from "./review";
import {
  STORAGE_KEY,
  blockTypes,
  blockNames,
  taskNames,
  makeDesign,
  newWorkspace,
  parseWorkspace,
  signature,
  applyFix,
  moveBlock,
  uid,
  participantLink,
  readParticipant,
  type Workspace,
  type Design,
  type Block,
  type BlockType,
  type BlockStyle,
  type Task,
  type Review,
  type Finding,
} from "./model";
import "./lab.css";
type History = { past: Workspace[]; present: Workspace; future: Workspace[] };
function load(initialLayout: Layout) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { workspace: parseWorkspace(saved), error: "" };
  } catch (error) {
    return {
      workspace: newWorkspace(),
      error: `Saved data could not be restored: ${error instanceof Error ? error.message : "storage unavailable"}`,
    };
  }
  const d = makeDesign(initialLayout);
  return {
    workspace: { schema: 1 as const, activeId: d.id, versions: [d] },
    error: "",
  };
}
function SortableNode({
  block,
  selected,
  onSelect,
  children,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      className={`lab-node ${selected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-layer={block.id}
      onClick={onSelect}
      tabIndex={0}
      role="group"
      aria-label={`${blockNames[block.id]} component`}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div inert>{children}</div>
      <button
        ref={setActivatorNodeRef}
        className="lab-drag-handle"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${blockNames[block.id]}`}
        onFocus={onSelect}
      >
        ⠿<span>{blockNames[block.id]}</span>
      </button>
    </div>
  );
}
function PaletteItem({ id, onAdd }: { id: BlockType; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
  });
  return (
    <button
      ref={setNodeRef}
      className={`lab-palette-item ${isDragging ? "active" : ""}`}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      aria-label={`Add or select ${blockNames[id]}`}
    >
      <span aria-hidden="true">＋</span>
      {blockNames[id]}
    </button>
  );
}
function CanvasDrop({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop" });
  return (
    <div ref={setNodeRef} className={`lab-canvas-drop ${isOver ? "over" : ""}`}>
      {children}
    </div>
  );
}
function Report({
  report,
  stale,
  onFix,
  onFocus,
  onFocusState,
}: {
  report?: Review;
  stale: boolean;
  onFix?: (f: Finding) => void;
  onFocus?: (id: BlockType) => void;
  onFocusState?: () => void;
}) {
  if (!report)
    return (
      <div className="lab-report-empty">
        <span>◎</span>
        <h3>Put this design to the test.</h3>
        <p>
          Review the rendered layout against the selected task, mobile bounds,
          and automated WCAG checks.
        </p>
      </div>
    );
  const counts = {
    pass: report.findings.filter((f) => f.status === "pass").length,
    issue: report.findings.filter((f) => f.status === "issue").length,
    manual: report.findings.filter((f) => f.status === "manual").length,
  };
  return (
    <div className="lab-report">
      <div
        className={`lab-report-summary ${stale ? "stale" : ""}`}
        tabIndex={-1}
      >
        <strong>
          {stale
            ? "Review is out of date"
            : `${counts.pass} passed · ${counts.issue} issues`}
        </strong>
        <span>
          {counts.manual} human checks · {report.merchant} ·{" "}
          {new Date(report.at).toLocaleString()}
        </span>
        <small>
          {stale
            ? "Design, merchant, or task changed. Run Review Design again."
            : `Measured rules + axe-core ${report.axeVersion}. No participant behavior observed.`}
        </small>
      </div>
      {report.findings.map((f) => (
        <details
          className={`lab-finding ${f.status}`}
          key={f.id}
          open={f.status === "issue"}
        >
          <summary>
            <span className="lab-finding-symbol" aria-hidden="true">
              {f.status === "pass" ? "✓" : f.status === "issue" ? "!" : "○"}
            </span>
            {f.title}
            <span>{f.status === "issue" ? f.severity : f.status}</span>
          </summary>
          <p>{f.evidence}</p>
          <p className="lab-suggestion">{f.suggestion}</p>
          {f.status === "issue" && f.fix && onFix && !stale ? (
            <button className="lab-small-button" onClick={() => onFix(f)}>
              Apply suggested fix
            </button>
          ) : f.status === "issue" && f.block && onFocus ? (
            <button
              className="lab-small-button"
              onClick={() => onFocus(f.block!)}
            >
              Focus component controls
            </button>
          ) : f.status === "issue" && f.id === "task-state" && onFocusState ? (
            <button className="lab-small-button" onClick={onFocusState}>
              Focus merchant selector
            </button>
          ) : null}
        </details>
      ))}
    </div>
  );
}
function PropertyEditor({
  block,
  onChange,
  onHide,
  onMove,
  position,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onHide: () => void;
  onMove: (delta: number) => void;
  position: number;
}) {
  const patch = (value: Partial<BlockStyle>) =>
    onChange({ ...block, style: { ...block.style, ...value } });
  return (
    <div className="lab-properties">
      <div className="lab-panel-title">
        <h3>{blockNames[block.id]}</h3>
        <span>{position + 1} / 8</span>
      </div>
      <label>
        Copy
        {block.id === "signals" ? (
          <small>Section label only. Verification facts are locked.</small>
        ) : null}
        <textarea
          data-property-copy
          value={block.text}
          onChange={(e) =>
            onChange({ ...block, text: e.target.value.slice(0, 240) })
          }
          placeholder={
            block.id === "cta" ? "Use the merchant’s default action" : ""
          }
        />
      </label>
      <div className="lab-property-grid">
        <label>
          Text size
          <input
            aria-label="Text size"
            type="number"
            min={10}
            max={64}
            value={block.style.fontSize}
            onChange={(e) =>
              patch({
                fontSize: Math.max(10, Math.min(64, Number(e.target.value))),
              })
            }
          />
        </label>
        <label>
          Weight
          <select
            value={block.style.weight}
            onChange={(e) =>
              patch({ weight: Number(e.target.value) as BlockStyle["weight"] })
            }
          >
            {[400, 500, 600, 700].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </label>
        <label>
          Padding
          <input
            type="number"
            min={0}
            max={80}
            value={block.style.padding}
            onChange={(e) =>
              patch({
                padding: Math.max(0, Math.min(80, Number(e.target.value))),
              })
            }
          />
        </label>
        <label>
          Space after
          <input
            type="number"
            min={0}
            max={60}
            value={block.style.margin}
            onChange={(e) =>
              patch({
                margin: Math.max(0, Math.min(60, Number(e.target.value))),
              })
            }
          />
        </label>
        <label>
          Alignment
          <select
            value={block.style.align}
            onChange={(e) =>
              patch({ align: e.target.value as BlockStyle["align"] })
            }
          >
            {["left", "center", "right"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Corner radius
          <input
            type="number"
            min={0}
            max={36}
            value={block.style.radius}
            onChange={(e) =>
              patch({
                radius: Math.max(0, Math.min(36, Number(e.target.value))),
              })
            }
          />
        </label>
        <label>
          Text color
          <div className="lab-color">
            <input
              aria-label="Text color picker"
              type="color"
              value={block.style.color}
              onChange={(e) => patch({ color: e.target.value })}
            />
            <span>{block.style.color}</span>
          </div>
        </label>
        <label>
          Background
          <div className="lab-color">
            <input
              aria-label="Background picker"
              type="color"
              value={block.style.background}
              onChange={(e) => patch({ background: e.target.value })}
            />
            <span>{block.style.background}</span>
          </div>
        </label>
      </div>
      {block.id === "cta" && (
        <label>
          Button treatment
          <select
            value={block.style.button}
            onChange={(e) =>
              patch({ button: e.target.value as BlockStyle["button"] })
            }
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="text">Text only</option>
          </select>
        </label>
      )}
      <div className="lab-order-actions">
        <button disabled={position === 0} onClick={() => onMove(-1)}>
          ↑ Move earlier
        </button>
        <button disabled={position === 7} onClick={() => onMove(1)}>
          ↓ Move later
        </button>
        <button onClick={onHide}>
          {block.visible ? "Hide component" : "Show component"}
        </button>
      </div>
      <p className="lab-lock-note">
        ⌁ Offer facts, verification, source URLs, and restrictions use the
        shared evidence record. They cannot be edited or imported.
      </p>
    </div>
  );
}
export default function DesignLab({
  initialLayout = "B",
  initialMerchant = "Vistaprint",
  participantHash,
  onExit,
}: {
  initialLayout?: Layout;
  initialMerchant?: Merchant;
  participantHash?: string;
  onExit: () => void;
}) {
  const [start] = useState(() => {
    if (participantHash)
      try {
        return {
          workspace: readParticipant(participantHash).workspace,
          error: "",
        };
      } catch (error) {
        return {
          workspace: newWorkspace(),
          error:
            error instanceof Error ? error.message : "Invalid participant link",
        };
      }
    return load(initialLayout);
  });
  const [history, setHistory] = useState<History>({
    past: [],
    present: start.workspace,
    future: [],
  });
  const workspace = history.present;
  const design = workspace.versions.find((d) => d.id === workspace.activeId)!;
  const [merchant, setMerchant] = useState<Merchant>(() => {
    try {
      return participantHash
        ? readParticipant(participantHash).merchant
        : initialMerchant;
    } catch {
      return initialMerchant;
    }
  });
  const [task, setTask] = useState<Task>(() => {
    try {
      return participantHash ? readParticipant(participantHash).task : "offer";
    } catch {
      return "offer";
    }
  });
  const [view, setView] = useState<"edit" | "preview" | "compare" | "test">(
    participantHash ? "test" : "edit",
  );
  const [selected, setSelected] = useState<BlockType>("header");
  const [toolsOpen, setToolsOpen] = useState(
    () => window.matchMedia("(min-width:761px)").matches,
  );
  const [template, setTemplate] = useState<Layout>(initialLayout);
  const [rightTab, setRightTab] = useState<"properties" | "review">(
    "properties",
  );
  const [storageReady, setStorageReady] = useState(!start.error);
  const [status, setStatus] = useState(
    start.error || "Edits stay in this browser.",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [otherId, setOtherId] = useState("");
  const [share, setShare] = useState("");
  const [testSource, setTestSource] = useState("");
  const [reviewedTask, setReviewedTask] = useState<Task | null>(null);
  const previewRef = useRef<HTMLElement>(null);
  const compareRefs = useRef<(HTMLElement | null)[]>([]);
  const propsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLAnchorElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareSignature = signature(design);
  useEffect(() => setShare(""), [shareSignature, merchant, task]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const commit = useCallback(
    (update: (w: Workspace) => Workspace) =>
      setHistory((old) => {
        const next = update(old.present);
        if (JSON.stringify(next) === JSON.stringify(old.present)) return old;
        return {
          past: [...old.past.slice(-49), old.present],
          present: next,
          future: [],
        };
      }),
    [],
  );
  const changeDesign = useCallback(
    (update: (d: Design) => Design) =>
      commit((w) => ({
        ...w,
        versions: w.versions.map((d) => (d.id === w.activeId ? update(d) : d)),
      })),
    [commit],
  );
  const undo = useCallback(
    () =>
      setHistory((h) =>
        h.past.length
          ? {
              past: h.past.slice(0, -1),
              present: h.past.at(-1)!,
              future: [h.present, ...h.future],
            }
          : h,
      ),
    [],
  );
  const redo = useCallback(
    () =>
      setHistory((h) =>
        h.future.length
          ? {
              past: [...h.past, h.present],
              present: h.future[0],
              future: h.future.slice(1),
            }
          : h,
      ),
    [],
  );
  const save = useCallback((value: Workspace, explicit = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      if (explicit) {
        setStorageReady(true);
      }
      if (explicit)
        setStatus(`Saved ${value.versions.length} version(s) locally.`);
    } catch (e) {
      setError(
        `Local save failed. Export JSON to keep your work. ${e instanceof Error ? e.message : ""}`,
      );
    }
  }, []);
  useEffect(() => {
    if (participantHash || !storageReady) return;
    saveTimer.current = setTimeout(() => save(workspace), 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [workspace, save, participantHash, storageReady]);
  useEffect(() => {
    if (participantHash) return;
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input,textarea,select,[contenteditable]")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save(workspace, true);
      } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        changeDesign((d) =>
          moveBlock(
            d,
            selected,
            d.blocks.findIndex((b) => b.id === selected) +
              (e.key === "ArrowUp" ? -1 : 1),
          ),
        );
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [undo, redo, save, workspace, changeDesign, selected, participantHash]);
  const updateBlock = (b: Block) =>
    changeDesign((d) => ({
      ...d,
      blocks: d.blocks.map((item) => (item.id === b.id ? b : item)),
    }));
  const selectBlock = (id: BlockType, focus = false) => {
    setSelected(id);
    setRightTab("properties");
    if (focus)
      requestAnimationFrame(() =>
        propsRef.current
          ?.querySelector<HTMLTextAreaElement>("textarea")
          ?.focus(),
      );
  };
  const add = (id: BlockType) => {
    changeDesign((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, visible: true } : b)),
    }));
    selectBlock(id);
    setStatus(`${blockNames[id]} selected on the canvas.`);
  };
  const duplicate = () => {
    if (workspace.versions.length >= 8) {
      setError(
        "Eight versions maximum. Export a workspace before starting another.",
      );
      return;
    }
    const copy = {
      ...structuredClone(design),
      id: uid(),
      name: `Version ${String.fromCharCode(65 + workspace.versions.length)}`,
      review: undefined,
    };
    commit((w) => ({
      ...w,
      versions: [...w.versions, copy],
      activeId: copy.id,
    }));
    setOtherId(design.id);
    setStatus(`${copy.name} created. Change a property, then compare.`);
  };
  const focusFinding = (id: BlockType) => {
    setView("edit");
    selectBlock(id, true);
  };
  const currentReport = design.review;
  const stale = (d: Design) =>
    !!d.review &&
    (d.review.signature !== signature(d) ||
      d.review.merchant !== merchant ||
      d.review.task !== task);
  async function runReview() {
    setBusy(true);
    setError("");
    setRightTab("review");
    setReviewedTask(task);
    try {
      const versions =
        view === "compare"
          ? [design, workspace.versions.find((d) => d.id === otherId)].filter(
              (d): d is Design => !!d,
            )
          : [design];
      if (view !== "compare") setView("preview");
      await new Promise((resolve) => setTimeout(resolve, 80));
      const reports = new Map<string, Review>();
      for (let i = 0; i < versions.length; i++) {
        const root =
          view === "compare" ? compareRefs.current[i] : previewRef.current;
        if (!root)
          throw new Error("The shopper canvas is not ready. Try again.");
        reports.set(
          versions[i].id,
          await reviewDesign(root, versions[i], merchant, task),
        );
      }
      setHistory((h) => ({
        ...h,
        present: {
          ...h.present,
          versions: h.present.versions.map((d) =>
            reports.has(d.id) && signature(d) === reports.get(d.id)!.signature
              ? { ...d, review: reports.get(d.id) }
              : d,
          ),
        },
      }));
      setStatus(
        `Review complete for ${versions.length} version(s). Findings describe this rendered state; participant behavior was not observed.`,
      );
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            ".lab-right .lab-report-summary, .lab-version-grid .lab-report-summary",
          )
          ?.focus(),
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Review failed. No pass result was recorded.",
      );
    } finally {
      setBusy(false);
    }
  }
  const fix = (f: Finding) => {
    if (!f.fix) return;
    changeDesign((d) => applyFix(d, f.fix!));
    setView("edit");
    selectBlock(f.fix.block, true);
    setStatus(`Applied: ${f.title}. Run Review Design again to verify.`);
  };
  function exportJSON() {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    if (exportRef.current) {
      exportRef.current.href = url;
      exportRef.current.download = "simplycodes-design-lab.json";
      exportRef.current.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Workspace exported with versions and stored review reports.");
  }
  async function importJSON(file?: File) {
    if (!file) return;
    try {
      if (file.size > 600000) throw new Error("File too large.");
      const next = parseWorkspace(await file.text());
      commit(() => next);
      setStorageReady(true);
      setOtherId("");
      setError("");
      setStatus(
        "Imported workspace. Stored reports are portable snapshots; rerun before relying on them.",
      );
    } catch (e) {
      setError(
        `Import rejected. ${e instanceof Error ? e.message : "Invalid JSON."}`,
      );
    }
    if (importRef.current) importRef.current.value = "";
  }
  const shareTest = () => {
    const url = participantLink(design, merchant, task);
    setShare(url);
    setStatus(
      "Participant link contains a read-only design snapshot. No responses or analytics are collected.",
    );
    requestAnimationFrame(() => linkRef.current?.select());
  };
  const exit = () => {
    if (!participantHash) save(workspace);
    onExit();
  };
  const activeBlock = design.blocks.find((b) => b.id === selected)!;
  const other =
    workspace.versions.find((d) => d.id === otherId && d.id !== design.id) ||
    workspace.versions.find((d) => d.id !== design.id);
  const overlayId = dragging?.replace("palette-", "") as BlockType | undefined;
  const overlay = design.blocks.find((b) => b.id === overlayId);
  if (participantHash && start.error)
    return (
      <section className="lab">
        <h2>Participant link could not be opened</h2>
        <p role="alert">{start.error}</p>
        <button onClick={exit}>Return to gallery</button>
      </section>
    );
  if (view === "test")
    return (
      <section className="lab lab-participant">
        <div className="lab-test-bar">
          <div>
            <span className="lab-eyebrow">READ-ONLY PARTICIPANT PREVIEW</span>
            <h2>{taskNames[task]}</h2>
            <p>
              Try the task using this design. No behavior or responses are
              recorded.
            </p>
          </div>
          <button onClick={participantHash ? exit : () => setView("edit")}>
            {participantHash ? "Return to gallery" : "Return to editor"}
          </button>
        </div>
        <div className="lab-test-canvas">
          <Preview
            key={`${design.id}-${merchant}-test`}
            design={design}
            merchant={merchant}
          />
        </div>
      </section>
    );
  return (
    <section
      className={`lab ${view === "compare" ? "lab-comparing" : ""}`}
      aria-label="Design Lab"
    >
      <div className="lab-topbar">
        <div>
          <span className="lab-eyebrow">DESIGN LAB</span>
          <h2>Arrange. Inspect. Iterate.</h2>
        </div>
        <div className="lab-history">
          <button
            onClick={undo}
            disabled={!history.past.length || busy}
            title="Undo (⌘/Ctrl Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={!history.future.length || busy}
            title="Redo (⌘/Ctrl Shift Z)"
          >
            ↷ Redo
          </button>
          <button
            disabled={busy}
            onClick={() => {
              changeDesign((d) => ({
                ...makeDesign(d.layout, d.name),
                id: d.id,
              }));
              setStatus(
                "Active design reset. Undo restores the previous design.",
              );
            }}
          >
            Reset
          </button>
          <button onClick={exit}>Gallery ↗</button>
        </div>
      </div>
      <div className="lab-document-bar">
        <label>
          Version
          <select
            value={design.id}
            disabled={busy}
            onChange={(e) => {
              commit((w) => ({ ...w, activeId: e.target.value }));
              setOtherId("");
            }}
          >
            {workspace.versions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="lab-version-name">
          Name
          <input
            maxLength={60}
            value={design.name}
            disabled={busy}
            onChange={(e) =>
              changeDesign((d) => ({ ...d, name: e.target.value }))
            }
          />
        </label>
        <button disabled={busy} onClick={duplicate}>
          Duplicate design
        </button>
        <button onClick={() => save(workspace, true)}>Save locally</button>
        <button onClick={exportJSON}>Export JSON</button>
        <button disabled={busy} onClick={() => importRef.current?.click()}>
          Import JSON
        </button>
        <input
          className="sr-only"
          ref={importRef}
          type="file"
          aria-label="Import design JSON"
          accept=".json,application/json"
          onChange={(e) => void importJSON(e.target.files?.[0])}
        />
        <a ref={exportRef} className="sr-only" aria-hidden="true" tabIndex={-1}>
          Export download
        </a>
      </div>
      <div className="lab-evaluation-bar">
        <label>
          Merchant
          <select
            aria-label="Merchant"
            id="lab-merchant"
            disabled={busy}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value as Merchant)}
          >
            <option>Vistaprint</option>
            <option>Kith</option>
          </select>
        </label>
        <label className="lab-task">
          Task
          <select
            disabled={busy}
            aria-label="Task"
            value={task}
            onChange={(e) => {
              const t = e.target.value as Task;
              setTask(t);
              if (t === "offer") setMerchant("Vistaprint");
              if (t === "no-code") setMerchant("Kith");
            }}
          >
            {Object.entries(taskNames).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="lab-review-button"
          disabled={busy}
          onClick={() => void runReview()}
        >
          {busy ? "Checking rendered design…" : "Review Design"}
        </button>
      </div>
      <div className="lab-message" ref={statusRef} role="status">
        {status}
      </div>
      {error && (
        <div className="lab-error" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={(args) => {
          const items = args.droppableContainers.filter(
            (c) => c.id !== "canvas-drop",
          );
          return closestCenter({
            ...args,
            droppableContainers: items.length
              ? items
              : args.droppableContainers,
          });
        }}
        onDragStart={(event) => {
          if (!busy) {
            setDragging(String(event.active.id));
            setSelected(
              String(event.active.id).replace("palette-", "") as BlockType,
            );
          }
        }}
        onDragCancel={() => setDragging(null)}
        onDragEnd={(event) => {
          setDragging(null);
          if (busy || !event.over) return;
          const id = String(event.active.id).replace(
            "palette-",
            "",
          ) as BlockType;
          const target = String(event.over.id);
          if (!blockTypes.includes(id)) return;
          changeDesign((d) => {
            const visible = d.blocks.map((b) =>
              b.id === id ? { ...b, visible: true } : b,
            );
            const next = { ...d, blocks: visible };
            return moveBlock(
              next,
              id,
              target === "canvas-drop"
                ? d.blocks.length - 1
                : d.blocks.findIndex((b) => b.id === target),
            );
          });
          setStatus(`${blockNames[id]} moved. Undo is available.`);
        }}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Press Space to pick up. Use arrow keys to move. Press Space to drop, or Escape to cancel. You can also use the layer move buttons.",
          },
        }}
      >
        <div className="lab-grid">
          <aside className="lab-left" aria-label="Components and layers">
            <details className="lab-tools" open={toolsOpen}>
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setToolsOpen(!toolsOpen);
                }}
              >
                Palette & layers <span>{toolsOpen ? "−" : "+"}</span>
              </summary>
              <div className="lab-panel-title">
                <h3>Components</h3>
                <span>FLOW LAYOUT</span>
              </div>
              <div className="lab-palette">
                {blockTypes.map((id) => (
                  <PaletteItem key={id} id={id} onAdd={() => add(id)} />
                ))}
              </div>
              <div className="lab-template">
                <label>
                  Start from
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as Layout)}
                  >
                    {layouts.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id} · {l.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  disabled={busy}
                  onClick={() => {
                    changeDesign((d) => ({
                      ...makeDesign(template, d.name),
                      id: d.id,
                    }));
                    setSelected("header");
                    setStatus(
                      "Template loaded into active version. Undo restores your design.",
                    );
                  }}
                >
                  Load template
                </button>
              </div>
              <div className="lab-panel-title">
                <h3>Layers</h3>
                <span>↑↓</span>
              </div>
              <ol className="lab-layers">
                {design.blocks.map((b, index) => (
                  <li
                    key={b.id}
                    className={`${selected === b.id ? "selected" : ""} ${!b.visible ? "hidden" : ""}`}
                  >
                    <button
                      className="lab-layer-select"
                      aria-pressed={selected === b.id}
                      onClick={() => selectBlock(b.id)}
                    >
                      {String(index + 1).padStart(2, "0")}
                      <span>{blockNames[b.id]}</span>
                    </button>
                    <div>
                      <button
                        disabled={index === 0 || busy}
                        aria-label={`Move ${blockNames[b.id]} earlier`}
                        onClick={() =>
                          changeDesign((d) =>
                            moveBlock(
                              d,
                              b.id,
                              d.blocks.findIndex((item) => item.id === b.id) -
                                1,
                            ),
                          )
                        }
                      >
                        ↑
                      </button>
                      <button
                        disabled={index === 7 || busy}
                        aria-label={`Move ${blockNames[b.id]} later`}
                        onClick={() =>
                          changeDesign((d) =>
                            moveBlock(
                              d,
                              b.id,
                              d.blocks.findIndex((item) => item.id === b.id) +
                                1,
                            ),
                          )
                        }
                      >
                        ↓
                      </button>
                      <button
                        disabled={busy}
                        aria-label={`${b.visible ? "Hide" : "Show"} ${blockNames[b.id]}`}
                        onClick={() =>
                          updateBlock({ ...b, visible: !b.visible })
                        }
                      >
                        {b.visible ? "◉" : "○"}
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="lab-key-hint">
                Space + arrows to drag. Alt + ↑/↓ moves the selected layer.
                ⌘/Ctrl Z undoes.
              </p>
            </details>
          </aside>
          <div className="lab-stage">
            <div className="lab-stage-toolbar">
              <div className="lab-view-switch" aria-label="Canvas mode">
                {(["edit", "preview", "compare"] as const).map((v) => (
                  <button
                    disabled={busy}
                    key={v}
                    aria-pressed={view === v}
                    onClick={() => {
                      setView(v);
                      if (v === "compare" && !otherId)
                        setOtherId(
                          workspace.versions.find((d) => d.id !== design.id)
                            ?.id || "",
                        );
                    }}
                  >
                    {v === "edit"
                      ? "Edit"
                      : v === "preview"
                        ? "Shopper preview"
                        : "Compare versions"}
                  </button>
                ))}
              </div>
              <span>390 × 844</span>
            </div>
            {view === "compare" ? (
              <>
                <div className="lab-comparison-controls">
                  <span>Active: {design.name}</span>
                  <label>
                    Compare with
                    <select
                      value={other?.id || ""}
                      disabled={!other || busy}
                      onChange={(e) => setOtherId(e.target.value)}
                    >
                      {!other && (
                        <option value="">Duplicate a design first</option>
                      )}
                      {workspace.versions
                        .filter((d) => d.id !== design.id)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                {!other ? (
                  <div className="lab-empty">
                    <p>
                      Duplicate this design, change a property, and compare both
                      versions.
                    </p>
                    <button onClick={duplicate}>
                      Duplicate into Version B
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="lab-diff">
                      <strong>Design differences (hypotheses)</strong>
                      <p>
                        {design.blocks
                          .filter(
                            (b, i) =>
                              JSON.stringify(b) !==
                              JSON.stringify(other.blocks[i]),
                          )
                          .map((b) => blockNames[b.id])
                          .join(", ") ||
                          "The component definitions are identical."}{" "}
                        · Differences are not observed outcomes.
                      </p>
                    </div>
                    <div className="lab-version-grid">
                      {[design, other].map((d, index) => (
                        <div key={d.id}>
                          <h3>{d.name}</h3>
                          <label className="lab-hypothesis-label">
                            Hypothesis
                            <textarea
                              value={d.hypothesis}
                              maxLength={500}
                              onChange={(e) =>
                                commit((w) => ({
                                  ...w,
                                  versions: w.versions.map((v) =>
                                    v.id === d.id
                                      ? { ...v, hypothesis: e.target.value }
                                      : v,
                                  ),
                                }))
                              }
                              placeholder="What do you expect this change to improve?"
                            />
                          </label>
                          <Preview
                            key={`${d.id}-${merchant}`}
                            design={d}
                            merchant={merchant}
                            rootRef={(el) => {
                              compareRefs.current[index] = el;
                            }}
                          />
                          <Report report={d.review} stale={stale(d)} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <CanvasDrop>
                <div className="lab-canvas-label">
                  <span>{design.name}</span>
                  <span>
                    {view === "edit"
                      ? "SELECT / DRAG COMPONENTS"
                      : "SHOPPER INTERACTIONS ENABLED"}
                  </span>
                </div>
                <SortableContext
                  items={design.blocks
                    .filter((b) => b.visible)
                    .map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Preview
                    design={design}
                    merchant={merchant}
                    rootRef={previewRef}
                    key={`${design.id}-${merchant}-${view}`}
                    renderBlock={
                      view === "edit"
                        ? (b, content) => (
                            <SortableNode
                              key={b.id}
                              block={b}
                              selected={b.id === selected}
                              onSelect={() => selectBlock(b.id)}
                            >
                              {content}
                            </SortableNode>
                          )
                        : undefined
                    }
                  />
                </SortableContext>
                <div className="lab-fold">844 PX · FIRST VIEWPORT</div>
              </CanvasDrop>
            )}
            <div className="lab-testing-controls">
              <button
                disabled={busy}
                onClick={() => {
                  setView("test");
                  setTestSource(design.name);
                }}
              >
                Read-only testing mode
              </button>
              <button onClick={shareTest}>Create participant link</button>
              <span>
                {testSource
                  ? `Last preview: ${testSource}`
                  : "No participant behavior has been observed."}
              </span>
            </div>
            {share && (
              <div className="lab-share">
                <label>
                  Read-only participant URL
                  <input
                    ref={linkRef}
                    readOnly
                    value={share}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <button
                  onClick={() => {
                    if (!navigator.clipboard) {
                      linkRef.current?.select();
                      setStatus("Select and copy the link from the field.");
                      return;
                    }
                    navigator.clipboard
                      .writeText(share)
                      .then(() => setStatus("Participant link copied."))
                      .catch(() => {
                        linkRef.current?.select();
                        setStatus("Select and copy the link from the field.");
                      });
                  }}
                >
                  Copy link
                </button>
                <a href={share} target="_blank" rel="noreferrer">
                  Open participant preview ↗
                </a>
              </div>
            )}
          </div>
          {view !== "compare" && (
            <aside
              className="lab-right"
              aria-label="Properties and design review"
              ref={propsRef}
            >
              <div className="lab-inspector-tabs">
                <button
                  aria-pressed={rightTab === "properties"}
                  onClick={() => setRightTab("properties")}
                >
                  Properties
                </button>
                <button
                  aria-pressed={rightTab === "review"}
                  onClick={() => setRightTab("review")}
                >
                  Design review
                  {currentReport?.findings.some((f) => f.status === "issue")
                    ? " •"
                    : ""}
                </button>
              </div>
              {rightTab === "properties" ? (
                <PropertyEditor
                  block={activeBlock}
                  onChange={updateBlock}
                  onHide={() =>
                    updateBlock({
                      ...activeBlock,
                      visible: !activeBlock.visible,
                    })
                  }
                  onMove={(delta) =>
                    changeDesign((d) =>
                      moveBlock(
                        d,
                        selected,
                        d.blocks.findIndex((b) => b.id === selected) + delta,
                      ),
                    )
                  }
                  position={design.blocks.findIndex((b) => b.id === selected)}
                />
              ) : (
                <>
                  <div className="lab-review-context">
                    <span>
                      {reviewedTask ? taskNames[reviewedTask] : taskNames[task]}
                    </span>
                    <p>Automated evidence, not a participant study.</p>
                  </div>
                  <Report
                    report={currentReport}
                    stale={stale(design)}
                    onFix={fix}
                    onFocus={focusFinding}
                    onFocusState={() =>
                      document.getElementById("lab-merchant")?.focus()
                    }
                  />
                </>
              )}
            </aside>
          )}
        </div>
        <DragOverlay>
          {overlay ? (
            <div className="lab-drag-preview" inert aria-hidden="true">
              <span>{blockNames[overlay.id]} · drop into page flow</span>
              <BlockContent
                block={overlay}
                merchant={merchant}
                onAction={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
