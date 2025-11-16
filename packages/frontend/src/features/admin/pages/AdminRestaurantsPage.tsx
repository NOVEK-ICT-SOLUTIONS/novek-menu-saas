import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertCircle, ArrowUpDown, Eye, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminRestaurantsApi, type RestaurantListItem } from "../api/admin-restaurants.api";
import { useRestaurants } from "../hooks/useRestaurants";

const columnHelper = createColumnHelper<RestaurantListItem>();

const AdminRestaurantsPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();

  const { data: restaurants, isLoading, isError, error } = useRestaurants();

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 hover:text-gray-900"
        >
          Restaurant
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("slug", {
      header: "Slug",
      cell: (info) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{info.getValue()}</code>,
    }),
    columnHelper.accessor("owner.email", {
      header: "Owner",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("_count.menus", {
      header: "Menus",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("_count.categories", {
      header: "Categories",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
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
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/restaurants/${row.original.id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: restaurants || [],
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

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Restaurants</h2>
          <p className="text-gray-600">{error?.message || "An unexpected error occurred"}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = restaurants ? AdminRestaurantsApi.calculateStats(restaurants) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Restaurants Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage all restaurants across the platform</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="text-xs md:text-sm font-medium text-gray-600">Total Restaurants</div>
            <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="text-xs md:text-sm font-medium text-gray-600">With QR Codes</div>
            <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.withQrCodes}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="text-xs md:text-sm font-medium text-gray-600">Total Menus</div>
            <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.totalMenus}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="text-xs md:text-sm font-medium text-gray-600">Avg Menus/Restaurant</div>
            <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats.avgMenusPerRestaurant}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
            <h2 className="text-lg md:text-xl font-semibold">All Restaurants</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
                    No restaurants found
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

export default AdminRestaurantsPage;
