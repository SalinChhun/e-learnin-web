import PageHeader from "@/components/ui/bar/PageHeader";
import Sidebar from "@/components/ui/bar/Sidebar";
import { lazy } from "react";

const PopupManager = lazy(() => import("@/components/ui/modal/PopupManager"));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wl-container">
      <Sidebar />
      <main className="wl-content">
        {/*<PageHeader />*/}
        {children}
      </main>
      <PopupManager />
    </div>
  );
}
