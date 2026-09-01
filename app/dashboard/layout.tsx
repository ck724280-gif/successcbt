import React from "react";
import { TestbookSidebar } from "@/components/sidebar/TestbookSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      {/* Left Testbook Sidebar */}
      <TestbookSidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
