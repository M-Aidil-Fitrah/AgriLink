"use client";

import { useState, useTransition } from "react";
import { deleteUser, updateUserRole, createUser } from "@/app/actions/adminActions";
import { Role } from "@prisma/client";
import { Trash2, Plus, X, UserCog } from "lucide-react";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  createdAt: Date;
  _count: { orders: number; products: number };
};

const ROLE_COLORS: Record<Role, string> = {
  USER: "text-blue-600 bg-blue-50 border-blue-200",
  FARMER: "text-emerald-600 bg-emerald-50 border-emerald-200",
  ADMIN: "text-purple-600 bg-purple-50 border-purple-200",
};

function DeleteUserButton({ userId, name }: { userId: string; name: string | null }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (!confirm(`Hapus pengguna "${name ?? userId}"?`)) return;
        startTransition(async () => {
          await deleteUser(userId);
        });
      }}
      disabled={isPending}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
      title="Hapus pengguna"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function ChangeRoleSelect({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select
      value={currentRole}
      disabled={isPending}
      onChange={(e) => {
        const newRole = e.target.value as Role;
        startTransition(async () => {
          await updateUserRole(userId, newRole);
        });
      }}
      className="text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 cursor-pointer"
      style={{ color: "inherit", background: "inherit" }}
    >
      <option value="USER">Pembeli</option>
      <option value="FARMER">Seller</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await createUser(fd);
      if (res.error) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-extrabold text-gray-900 mb-6">Tambah Pengguna</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(["Nama Lengkap", "Email", "Kata Sandi"] as const).map((label, i) => (
            <div key={label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input
                name={["name", "email", "password"][i]}
                type={i === 2 ? "password" : i === 1 ? "email" : "text"}
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <select name="role" defaultValue="USER"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="USER">Pembeli</option>
              <option value="FARMER">Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
          <button type="submit" disabled={isPending}
            className="w-full py-3 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Menyimpan..." : "Tambah Pengguna"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminUsersView({ users }: { users: UserRow[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-gray-500 font-medium mt-1">{users.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["Pengguna", "Role", "Pesanan", "Produk", "Bergabung", "Aksi"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 font-medium">Tidak ada pengguna</td>
              </tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-emerald-700">
                        {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${ROLE_COLORS[user.role]}`}>
                    <UserCog className="w-3 h-3" />
                    <ChangeRoleSelect userId={user.id} currentRole={user.role} />
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-700">{user._count.orders}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-700">{user._count.products}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <DeleteUserButton userId={user.id} name={user.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
