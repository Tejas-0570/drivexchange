// src/pages/admin/AdminUsers.jsx   (route: /admin/users)
import { useNavigate } from "react-router-dom";
import { formatDateTime, isAdminRole } from "../../components/dashboard/format";
import { AdminPill, DataTable, PageHeader, Pagination, SearchBox, Tabs, userStatusPill } from "../../components/admin/adminUi";
import useAdminList from "../../hooks/useAdminList";
import { listUsers } from "../../api/adminApi";

const TABS = [
  { id: "", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "SUSPENDED", label: "Suspended" },
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const list = useAdminList(listUsers, { keys: ["status"], defaults: { status: "" } });

  const columns = [
    {
      key: "name",
      label: "User",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1a6bff] to-[#0b57ef] text-sm font-semibold text-white">
            {(r.name || r.email || "U")[0].toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{r.name || "—"}</span>
            <span className="block truncate text-xs text-[#8c8c8c]">{r.email}</span>
          </span>
        </div>
      ),
    },
    { key: "mobile", label: "Mobile", render: (r) => r.mobile || "—" },
    { key: "roles", label: "Role", render: (r) => <AdminPill tone={isAdminRole(r.roles ?? [])  ? "amber" : "blue"}>{isAdminRole(r.roles ?? []) ? "Admin" : "User"}</AdminPill> },
    { key: "status", label: "Status", render: (r) => userStatusPill(r.status) },
    { key: "listingsCount", label: "Listings", render: (r) => r.listingsCount ?? 0 },
    { key: "ordersCount", label: "Orders", render: (r) => r.ordersCount ?? 0 },
    { key: "joinedAt", label: "Joined", render: (r) => formatDateTime(r.joinedAt) },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Everyone with a Drivexchange account." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={TABS} value={list.filters.status} onChange={(v) => list.setParam("status", v)} label="Account status" />
        <SearchBox value={list.search} onChange={list.setSearch} placeholder="Search name, email or mobile" />
      </div>
      <DataTable
        columns={columns}
        rows={list.data?.content}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(r) => navigate(`/admin/users/${r.id}`)}
        emptyTitle="No users found"
      />
      <Pagination data={list.data} onPage={list.setPage} />
    </>
  );
}
