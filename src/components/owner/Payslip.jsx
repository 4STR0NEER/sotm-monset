import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Download, Printer, X } from "lucide-react";
import { fmtDate } from "./ui";
import { peso } from "@/data/site";

// A payslip for one payroll row. Internal record only, so the footer says so plainly.
export default function Payslip({ row, staff, onClose }) {
  const slip = useRef(null);
  const [saving, setSaving] = useState(false);
  const period = fmtDate(row.month + "-01", { month: "long", year: "numeric" });
  const deductions = Object.entries(row.deductions || {});

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const a = document.createElement("a");
      a.href = await toPng(slip.current, { pixelRatio: 3, backgroundColor: "#ffffff" });
      a.download = `Payslip-${row.name.replace(/\W+/g, "-")}-${row.month}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const line = (label, value, cls = "") => (
    <div className={`flex justify-between py-1.5 ${cls}`}><span>{label}</span><span className="tnum">{value}</span></div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] overflow-y-auto bg-night/40 p-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      data-lenis-prevent
    >
      <div className="mx-auto my-8 max-w-md" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Payslip for ${row.name}`}>
        <div className="mb-3 flex justify-end gap-2">
          <button onClick={() => print()} className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-semibold text-night"><Printer size={15} /> Print</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-semibold text-night disabled:opacity-60"><Download size={15} /> Save image</button>
          <button onClick={onClose} autoFocus className="grid size-9 place-items-center rounded-full bg-mist text-night" aria-label="Close"><X size={18} /></button>
        </div>

        <div ref={slip} className="payslip rounded-2xl bg-white p-7 text-sm text-night shadow-2xl">
          <div className="flex items-start justify-between border-b border-night/10 pb-4">
            <div>
              <p className="stamp text-xs text-moss">Sermon on the Mount</p>
              <p className="font-display text-3xl text-pine-deep">Payslip</p>
            </div>
            <div className="text-right text-xs text-night/55">
              <p className="font-semibold text-night/80">{period}</p>
              <p>Paid {fmtDate(row.paid_on, { month: "short", day: "numeric", year: "numeric" })}</p>
              <p className="tnum">Ref {row.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="border-b border-night/10 py-4">
            <p className="text-base font-semibold">{row.name}</p>
            {staff?.designation && <p className="text-night/60">{staff.designation}</p>}
            {staff && <p className="text-xs text-night/50">{peso(staff.rate)} / {staff.pay_type === "monthly" ? "month" : "day"}{row.days ? ` · ${row.days} days worked` : ""}</p>}
          </div>

          <div className="border-b border-night/10 py-3">{line("Gross pay", peso(row.gross || row.amount), "font-medium")}</div>

          {(deductions.length > 0 || row.advance > 0) && (
            <div className="border-b border-night/10 py-3 text-night/70">
              <p className="pb-1 text-xs uppercase tracking-wide text-night/45">Less</p>
              {deductions.map(([k, v]) => line(k, `−${peso(v)}`))}
              {row.advance > 0 && line("Cash advance", `−${peso(row.advance)}`)}
            </div>
          )}

          {line("Net pay", peso(row.amount), "pt-4 text-lg font-semibold text-pine-deep")}

          <div className="mt-10 grid grid-cols-2 gap-8 text-xs text-night/50">
            <p className="border-t border-night/30 pt-1.5">Received by</p>
            <p className="border-t border-night/30 pt-1.5">Date</p>
          </div>

          <p className="mt-8 rounded-lg bg-night/[0.04] p-3 text-center text-[11px] leading-snug text-night/60">
            For internal use and tracking only. This is not an official receipt and is not BIR approved.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
