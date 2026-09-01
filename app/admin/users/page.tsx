"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminUsersPage() {
  const { toast, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error("Load users error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBlocked: !currentBlocked }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`User ${!currentBlocked ? "suspended" : "reactivated"} successfully.`, "success");
        loadUsers();
      } else {
        toastError(data.message || "Failed to update user.");
      }
    } catch (e) {
      toastError("Failed to update user.");
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`User role changed to ${newRole}.`, "success");
        loadUsers();
      } else {
        toastError(data.message || "Failed to change role.");
      }
    } catch (e) {
      toastError("Failed to change role.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Candidate & User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View registered candidates, monitor test attempt frequencies, and manage access permissions
        </p>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No matching candidate accounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Candidate</th>
                  <th className="pb-3 px-2 text-center">Role</th>
                  <th className="pb-3 px-2 text-center">Tests Attempted</th>
                  <th className="pb-3 px-2 text-center">Joined Date</th>
                  <th className="pb-3 px-2 text-center">Account Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <span className="text-xs text-slate-400">{u.email}</span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Badge
                        variant={u.role === "ADMIN" ? "warning" : "default"}
                        className="text-xs font-bold cursor-pointer"
                        onClick={() => handleToggleRole(u.id, u.role)}
                        title="Click to toggle role"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-slate-700">
                      {u._count.attempts} Tests
                    </td>
                    <td className="py-4 px-2 text-center text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Badge variant={u.isBlocked ? "danger" : "success"} className="text-xs">
                        {u.isBlocked ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <Button
                        variant={u.isBlocked ? "outline" : "danger"}
                        size="sm"
                        onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                        className="text-xs h-8 px-3 font-semibold"
                      >
                        {u.isBlocked ? "Reactivate" : "Block User"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
