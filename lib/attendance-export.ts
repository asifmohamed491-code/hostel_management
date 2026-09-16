// lib/attendance-export.ts
//
// Utilities for exporting actual database attendance records to CSV (Excel) and PDF.

export interface ExportAttendanceRecord {
  studentName: string;
  registerNumber?: string;
  department?: string;
  year?: string;
  hostelBlock?: string;
  roomNumber: string;
  date: string;
  time?: string;
  status: string;
  distanceMeters?: number;
  markingMethod?: string;
}

/**
 * Exports attendance records to a CSV file (Excel-compatible)
 */
export function exportAttendanceToCsv(
  records: ExportAttendanceRecord[],
  filename = `oasys-attendance-report-${new Date().toISOString().slice(0, 10)}.csv`
) {
  if (!records || records.length === 0) {
    alert("No attendance records to export.");
    return;
  }

  const headers = [
    "Student Name",
    "Register Number",
    "Department",
    "Year",
    "Hostel Block",
    "Room Number",
    "Date",
    "Check-in Time",
    "Status",
    "Distance from Hostel (m)",
    "Method",
  ];

  const rows = records.map((r) => [
    `"${r.studentName.replace(/"/g, '""')}"`,
    `"${(r.registerNumber || "—").replace(/"/g, '""')}"`,
    `"${(r.department || "Computer Science").replace(/"/g, '""')}"`,
    `"${(r.year || "3rd Year").replace(/"/g, '""')}"`,
    `"${(r.hostelBlock || "Block A").replace(/"/g, '""')}"`,
    `"${(r.roomNumber || "—").replace(/"/g, '""')}"`,
    `"${r.date}"`,
    `"${r.time || "—"}"`,
    `"${r.status.toUpperCase()}"`,
    `"${r.distanceMeters !== undefined ? r.distanceMeters : "—"}"`,
    `"${r.markingMethod || "QR_GPS"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports attendance records to a beautifully styled, printable PDF document
 */
export function exportAttendanceToPdf(
  records: ExportAttendanceRecord[],
  title = "OASYS Hostel Attendance Report"
) {
  if (!records || records.length === 0) {
    alert("No attendance records to export.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF.");
    return;
  }

  const rowsHtml = records
    .map(
      (r, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0; ${i % 2 === 1 ? "background-color: #f8fafc;" : ""}">
      <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${r.studentName}</td>
      <td style="padding: 10px 12px; color: #475569;">${r.registerNumber || "—"}</td>
      <td style="padding: 10px 12px; color: #475569;">${r.department || "Computer Science"}</td>
      <td style="padding: 10px 12px; color: #475569;">${r.roomNumber || "—"}</td>
      <td style="padding: 10px 12px; color: #475569;">${r.date}</td>
      <td style="padding: 10px 12px; color: #475569;">${r.time || "—"}</td>
      <td style="padding: 10px 12px; text-align: center;">
        <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${
          r.status.toLowerCase() === "present"
            ? "background-color: #dcfce7; color: #15803d;"
            : r.status.toLowerCase() === "late"
            ? "background-color: #fef3c7; color: #b45309;"
            : "background-color: #fee2e2; color: #b91c1c;"
        }">
          ${r.status.toUpperCase()}
        </span>
      </td>
      <td style="padding: 10px 12px; color: #64748b; font-size: 12px; text-align: right;">${r.distanceMeters ?? "—"} m</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c5cd6; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #7c5cd6; }
          .meta { font-size: 13px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background-color: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
          .footer { margin-top: 24px; text-align: right; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">OASYS HOSTEL MANAGEMENT</div>
            <div style="font-size: 14px; font-weight: 600; color: #334155; margin-top: 2px;">${title}</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div><strong>Date:</strong> ${dateStr}</div>
            <div><strong>Total Records:</strong> ${records.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Register No</th>
              <th>Department</th>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: right;">Distance</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by OASYS Attendance System &bull; ${new Date().toLocaleTimeString()}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

