import { apiClient } from "@/lib/api/client";

export type ReportParams = { date_from?: string; date_to?: string };

export async function getReportPreview(params?: ReportParams) {
  const { data } = await apiClient.get("/reports/preview", { params });
  return data;
}

export function getReportPdfUrl(params?: ReportParams) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString();
  return `${base}/reports/export/pdf${query ? `?${query}` : ""}`;
}

export function getReportExcelUrl(params?: ReportParams) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString();
  return `${base}/reports/export/excel${query ? `?${query}` : ""}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadReportPdf(params?: ReportParams) {
  const response = await apiClient.get<Blob>("/reports/export/pdf", {
    params,
    responseType: "blob",
  });

  downloadBlob(response.data, `laporan-hasil-pertanian-${Date.now()}.pdf`);
}

export async function downloadReportExcel(params?: ReportParams) {
  const response = await apiClient.get<Blob>("/reports/export/excel", {
    params,
    responseType: "blob",
  });

  downloadBlob(response.data, `laporan-hasil-pertanian-${Date.now()}.xlsx`);
}
