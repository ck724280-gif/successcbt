import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/authOptions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] p-6">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-md text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-600">
            You need administrator privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
