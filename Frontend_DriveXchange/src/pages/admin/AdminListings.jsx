// src/pages/admin/AdminListings.jsx   (route: /admin/listings)
// Review queue. Tabs = approval status. Click a row to open the listing and approve / reject it.
import { useNavigate, useOutletContext } from "react-router-dom";
import { Icons } from "../../components/dashboard/ui";
import { formatDateTime, formatPrice } from "../../components/dashboard/format";
import { DataTable, PageHeader, Pagination, SearchBox, Tabs, approvalPill, availabilityPill } from "../../components/admin/adminUi";
import useAdminList from "../../hooks/useAdminList";
import { listListings } from "../../api/adminApi";

export default function AdminListings() {
  const navigate = useNavigate();
  const { overview } = useOutletContext();
  const list = useAdminList(listListings, { keys: ["approval"], defaults: { approval: "PENDING" } });

  const tabs = [
    { id: "PENDING", label: "Pending", count: overview?.pendingListings },
    { id: "APPROVED", label: "Approved" },
    { id: "REJECTED", label: "Rejected" },
  ];

  const columns = [
    {
      key: "title",
      label: "Car",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#efece6] text-[#c9c5bb]">
            {r.photo ? <img src={r.photo} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Icons.car width={20} height={20} />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{r.title}</span>
            {r.vin && <span className="block truncate font-mono text-xs text-[#a8a59e]">{r.vin}</span>}
          </span>
        </div>
      ),
    },
    {
      key: "seller",
      label: "Seller",
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate">{r.sellerName || "—"}</span>
          <span className="block truncate text-xs text-[#8c8c8c]">{r.sellerEmail}</span>
        </span>
      ),
    },
    { key: "price", label: "Price", render: (r) => formatPrice(r.price) },
    { key: "submittedAt", label: "Submitted", render: (r) => formatDateTime(r.submittedAt) },
    { key: "status", label: "Availability", render: (r) => availabilityPill(r.status) },
    { key: "approvalStatus", label: "Review", render: (r) => approvalPill(r.approvalStatus) },
  ];

  return (
    <>
      <PageHeader title="Listings" subtitle="Every new listing must be approved before buyers can see it." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={tabs} value={list.filters.approval} onChange={(v) => list.setParam("approval", v)} label="Review status" />
        <SearchBox value={list.search} onChange={list.setSearch} placeholder="Search car, seller or VIN" />
      </div>

      <DataTable
        columns={columns}
        rows={list.data?.content}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(r) => navigate(`/admin/listings/${r.id}`)}
        emptyTitle={list.filters.approval === "PENDING" ? "No listings waiting" : "No listings here"}
        emptyText={list.filters.approval === "PENDING" ? "New listings will appear here for review." : "Nothing matches these filters."}
      />
      <Pagination data={list.data} onPage={list.setPage} />
    </>
  );
}
