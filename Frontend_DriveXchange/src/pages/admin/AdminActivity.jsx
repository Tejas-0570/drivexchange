// src/pages/admin/AdminActivity.jsx   (route: /admin/activity)
// Read-only history of everything admins did: who, what, to what, and why.
import { Link } from "react-router-dom";
import { formatDateTime } from "../../components/dashboard/format";
import { AdminPill, DataTable, PageHeader, Pagination, Tabs } from "../../components/admin/adminUi";
import useAdminList from "../../hooks/useAdminList";
import { listAuditLog } from "../../api/adminApi";

const TABS = [
  { id: "", label: "Everything" },
  { id: "LISTING", label: "Listings" },
  { id: "USER", label: "Users" },
  { id: "TRANSACTION", label: "Orders" },
];

const targetPath = (type, id) =>
  ({ LISTING: `/admin/listings/${id}`, USER: `/admin/users/${id}`, TRANSACTION: `/admin/orders/${id}` })[String(type).toUpperCase()];

export default function AdminActivity() {
  const list = useAdminList(listAuditLog, { keys: ["targetType"], defaults: { targetType: "" }, size: 20 });

  const columns = [
    { key: "at", label: "When", render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.at)}</span> },
    { key: "adminName", label: "Admin", render: (r) => r.adminName || "—" },
    { key: "action", label: "Action", render: (r) => <AdminPill tone="blue">{String(r.action || "").replace(/_/g, " ")}</AdminPill> },
    {
      key: "target",
      label: "On",
      render: (r) => {
        const to = targetPath(r.targetType, r.targetId);
        const label = `${String(r.targetType || "").toLowerCase()} ${String(r.targetId || "").slice(0, 8)}`;
        return to ? <Link to={to} className="font-semibold text-[#1a6bff] hover:underline">{label}</Link> : label;
      },
    },
    { key: "reason", label: "Reason", render: (r) => <span className="block max-w-[320px] text-[#5f5f5f]">{r.reason || "—"}</span> },
  ];

  return (
    <>
      <PageHeader title="Activity log" subtitle="Every admin action is recorded here and can't be edited." />
      <div className="mb-5">
        <Tabs items={TABS} value={list.filters.targetType} onChange={(v) => list.setParam("targetType", v)} label="Type" />
      </div>
      <DataTable columns={columns} rows={list.data?.content} loading={list.loading} error={list.error} onRetry={list.reload} emptyTitle="No activity yet" emptyText="Admin actions will appear here." />
      <Pagination data={list.data} onPage={list.setPage} />
    </>
  );
}
