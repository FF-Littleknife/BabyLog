"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { BabyRecord, RecordType } from "@/lib/types";
import { RECORD_LABEL } from "@/lib/types";
import { fetchRecords } from "@/lib/recordsApi";

/**
 * 导出页参数
 * 后面调 PDF、截图清晰度、文件名，优先改这里。
 */
const EXPORT_CONFIG = {
  pdfFileName: "叶票票喂养记录.pdf", // 导出的 PDF 文件名

  canvasScale: 4, // 截图清晰度，越大越清晰，文件也越大
  canvasBackgroundColor: null, // 保持透明，让截图直接使用 export.css 里的真实背景色
};

const TYPE_OPTIONS: { label: string; value: "all" | RecordType }[] = [
  { label: "全部", value: "all" },
  { label: "哺乳", value: "breast" },
  { label: "瓶喂母乳", value: "bottle_breast" },
  { label: "奶粉", value: "formula" },
  { label: "小便", value: "pee" },
  { label: "大便", value: "poop" },
  { label: "泵奶", value: "pump" },
  { label: "其他", value: "other" },
];

function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function formatDetail(record: BabyRecord) {
  const parts: string[] = [];

  if (record.type === "other") {
    return record.content || record.note || "";
  }

  if (record.amountMl) parts.push(`${record.amountMl}ml`);

  if (record.leftMin || record.rightMin) {
    parts.push(`左${record.leftMin || 0}分钟 / 右${record.rightMin || 0}分钟`);
  } else if (record.durationMin) {
    parts.push(`${record.durationMin}分钟`);
  }

  return parts.join(" · ");
}

function formatNote(record: BabyRecord) {
  if (record.type === "other" && !record.content) {
    return "";
  }

  return record.note || "";
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function groupByDate(records: BabyRecord[]) {
  return records.reduce<Record<string, BabyRecord[]>>((groups, record) => {
    const date = formatDate(record.time);

    if (!groups[date]) groups[date] = [];
    groups[date].push(record);

    return groups;
  }, {});
}

export default function ExportTable() {
  const exportRef = useRef<HTMLDivElement | null>(null);

  const [records, setRecords] = useState<BabyRecord[]>([]);
  const [type, setType] = useState<"all" | RecordType>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const list = await fetchRecords();
      setRecords(list);
    }

    load();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const time = new Date(record.time).getTime();

      if (type !== "all" && record.type !== type) return false;

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`).getTime();
        if (time < start) return false;
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`).getTime();
        if (time > end) return false;
      }

      return true;
    });
  }, [records, type, startDate, endDate]);

  const groupedRecords = useMemo(() => {
    const groups = groupByDate(filteredRecords);

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        date,
        records: groups[date].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        ),
      }));
  }, [filteredRecords]);

  function setToday() {
    const today = toDateInputValue(new Date());
    setStartDate(today);
    setEndDate(today);
  }

  function clearFilter() {
    setType("all");
    setStartDate("");
    setEndDate("");
  }

  async function exportPdf() {
    if (!exportRef.current || exporting) return;

    setExporting(true);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: EXPORT_CONFIG.canvasScale,
        backgroundColor: EXPORT_CONFIG.canvasBackgroundColor,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(EXPORT_CONFIG.pdfFileName);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="export-page">
      <section className="export-toolbar no-export">
        <div>
          <h1>BabyLog-Export</h1>
          <p>表格所见即所得，点击按钮可直接导出当前页面样式。</p>
        </div>

        <div className="export-actions">
          <button type="button" onClick={setToday}>
            今天
          </button>
          <button type="button" onClick={clearFilter}>
            清空筛选
          </button>
          <button
            type="button"
            className="primary"
            onClick={exportPdf}
            disabled={exporting}
          >
            {exporting ? "正在导出..." : "导出 PDF"}
          </button>
        </div>
      </section>

      <section className="export-filters no-export">
        <label>
          类型
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            {TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          开始日期
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          结束日期
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </section>

      <div ref={exportRef} className="export-document">
        <section className="print-header">
          <h2>叶票票喂养记录</h2>
          <p>共 {filteredRecords.length} 条记录</p>
        </section>

        {groupedRecords.map((group) => (
          <section className="day-table-block" key={group.date}>
            <h3>{group.date}</h3>

            <table className="export-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>时间</th>
                  <th>类型</th>
                  <th>详情</th>
                  <th>备注</th>
                </tr>
              </thead>

              <tbody>
                {group.records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.time)}</td>
                    <td>{formatTime(record.time)}</td>
                    <td>{RECORD_LABEL[record.type]}</td>
                    <td>{formatDetail(record) || "—"}</td>
                    <td>{formatNote(record) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </main>
  );
}