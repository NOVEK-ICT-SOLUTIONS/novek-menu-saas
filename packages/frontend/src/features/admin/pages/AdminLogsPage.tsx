import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Activity, AlertCircle, CheckCircle, Info, Loader2, Search, XCircle } from "lucide-react";
import { useState } from "react";
import type { LogEntry } from "../api/admin-logs.api";
import { useLogs } from "../hooks/useLogs";

const columnHelper = createColumnHelper<LogEntry>();

const AdminLogsPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const { data: logs = [], isLoading, isError } = useLogs();

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const columns = [
    columnHelper.accessor("timestamp", {
      header: "Time",
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {new Date(info.getValue()).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ),
    }),
    columnHelper.accessor("level", {
      header: "Level",
      cell: (info) => (
        <div className="flex items-center gap-2">
          {getLevelIcon(info.getValue())}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadge(info.getValue())}`}
          >
            {info.getValue().toUpperCase()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("user", {
      header: "User",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue() || "System"}</span>,
    }),
    columnHelper.accessor("details", {
      header: "Details",
      cell: (info) => <span className="text-sm text-gray-600">{info.getValue()}</span>,
    }),
  ];

  const filteredData =
    logs?.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      return true;
    }) || [];

  const table = useReactTable({
    data: filteredData,
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
        pageSize: 20,
      },
      sorting: [{ id: "timestamp", desc: true }],
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Logs</h2>
          <p className="text-gray-600">An error occurred while fetching system logs</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: logs?.length || 0,
    success: logs?.filter((l) => l.level === "success").length || 0,
    errors: logs?.filter((l) => l.level === "error").length || 0,
    warnings: logs?.filter((l) => l.level === "warning").length || 0,
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-orange-600" />
          <h1 className="text-4xl font-bold">System Activity Logs</h1>
        </div>
        <p className="text-gray-600 mt-2">Real-time monitoring of all system actions and events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Total Events</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Successful</div>
          <div className="text-3xl font-bold mt-2 text-green-600">{stats.success}</div>
          <div className="text-xs text-gray-500 mt-1">Completed actions</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Errors</div>
          <div className="text-3xl font-bold mt-2 text-red-600">{stats.errors}</div>
          <div className="text-xs text-gray-500 mt-1">Failed operations</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600">Warnings</div>
          <div className="text-3xl font-bold mt-2 text-yellow-600">{stats.warnings}</div>
          <div className="text-xs text-gray-500 mt-1">Attention needed</div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Activity Log</h2>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Levels</option>
                <option value="success">Success Only</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="info">Info Only</option>
              </select>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
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
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogsPage;
