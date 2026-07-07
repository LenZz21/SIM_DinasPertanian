import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#edf5f8] text-slate-800 dark:bg-slate-950 dark:text-slate-100 md:pl-64">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden pt-[76px]">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
