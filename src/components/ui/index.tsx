import { useState } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
export function Icon({
  name,
}: {
  name: "upload" | "trash" | "download" | "alert" | "check" | "file";
}) {
  const paths = {
    upload: (
      <>
        <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v5m4-5v5M7 7l1 13h8l1-13M9 7V4h6v3" />
      </>
    ),
    download: (
      <>
        <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4m0 4h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6m-6 3h6" />
      </>
    ),
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
type Variant = "primary" | "secondary" | "ghost" | "destructive" | "icon";
export function Button({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <Button variant="icon" aria-label={label} title={label} {...props}>
      {children}
    </Button>
  );
}
export function Card({
  children,
  className = "",
  elevated = false,
  main = false,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  main?: boolean;
}) {
  return (
    <section
      className={`ui-card ${elevated ? "ui-card--elevated" : ""} ${main ? "ui-card--main" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ui-input ${props.className ?? ""}`} {...props} />;
}
export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`ui-select ${props.className ?? ""}`} {...props}>
      {children}
    </select>
  );
}
export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" {...props} />;
}
export function StatusBadge({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning" | "critical" | "ml" | "shopee";
  children: ReactNode;
}) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>;
}
export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          className="tab"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
export function FileDropzone({
  onFiles,
  loading,
}: {
  onFiles: (files: FileList) => void;
  loading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const select = (next: File | null) => setFile(next);
  const submit = () => { if (!file) return; const transfer = new DataTransfer(); transfer.items.add(file); onFiles(transfer.files); setFile(null); };
  return (
    <label
      className="dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        select(e.dataTransfer.files.item(0));
      }}
    >
      <input
        className="visually-hidden"
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => select(e.target.files?.item(0) ?? null)}
      />
      <span className="dropzone-inner">
        <Icon name={loading ? "file" : "upload"} />
        <span className="dropzone-title">
          {loading ? "Processando planilha" : file ? file.name : "Selecionar planilha"}
        </span>
        <span className="dropzone-meta">{file ? "Pronta para importação" : ".xlsx, .xls ou .csv"}</span>
        {file && <Button type="button" variant="primary" onClick={(e) => { e.preventDefault(); submit(); }} disabled={loading}>Importar planilha</Button>}
      </span>
    </label>
  );
}
export function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  tone?: "warning" | "critical";
}) {
  return (
    <article
      className="metric-card"
      style={
        tone
          ? {
              borderColor:
                tone === "critical"
                  ? "rgba(215,0,21,.30)"
                  : "rgba(178,80,0,.28)",
            }
          : undefined
      }
    >
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}
export function ErrorBanner() {
  return (
    <div role="alert" className="error-banner">
      <Icon name="alert" />
      <div>
        <strong>Resultado provisório</strong>
        <p>Corrija os erros antes de usar na DRE.</p>
      </div>
    </div>
  );
}
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return <span title={label}>{children}</span>;
}
export function Dialog({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return open ? (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null;
}
export function Drawer({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return open ? (
    <aside role="dialog" aria-modal="true">
      {children}
    </aside>
  ) : null;
}
export function Toast({ children }: { children: ReactNode }) {
  return (
    <div className="ui-toast" role="status">
      {children}
    </div>
  );
}
