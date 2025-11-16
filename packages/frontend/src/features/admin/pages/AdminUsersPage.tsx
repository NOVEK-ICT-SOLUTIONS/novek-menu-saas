import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { type User, useAdminUsers, useUpdateUserRole } from "../services";

const columnHelper = createColumnHelper<User>();

const AdminUsersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: users, isLoading } = useAdminUsers();
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700";
      case "OWNER":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const columns = [
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 hover:text-gray-900"
        >
          Email
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => (
        <select
          value={info.getValue()}
          onChange={(e) => handleRoleChange(info.row.original.id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(info.getValue())}`}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
      ),
    }),
    columnHelper.accessor("_count.restaurants", {
      header: "Restaurants",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {new Date(info.getValue()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: users || [],
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Users Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage all platform users and roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Total Users</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{users?.length || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Admins</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{users?.filter((u) => u.role === "ADMIN").length || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Owners</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{users?.filter((u) => u.role === "OWNER").length || 0}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
            <h2 className="text-lg md:text-xl font-semibold">All Users</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 md:px-6 py-6 md:py-8 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 md:px-6 py-3 md:py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs md:text-sm text-gray-600">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
