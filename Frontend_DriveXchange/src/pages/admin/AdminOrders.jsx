// src/pages/admin/AdminOrders.jsx   (route: /admin/orders)
// Every deal. The tabs are the admin's to-do lists: awaiting delivery, awaiting payout, disputed.
import { useNavigate, useOutletContext } from "react-router-dom";
import { formatDateTime, formatPaise } from "../../components/dashboard/format";
import { DataTable, PageHeader, Pagination, SearchBox, Tabs, orderStatusPill } from "../../components/admin/adminUi";
import useAdminList from "../../hooks/useAdminList";
import { listTransactions } from "../../api/adminApi";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { overview } = useOutletContext();
  const list = useAdminList(listTransactions, { keys: ["status"], defaults: { status: "" } });

  const tabs = [
    { id: "", label: "All" },
    { id: "PAID_HELD", label: "Awaiting delivery", count: overview?.ordersAwaitingDelivery },
    { id: "DELIVERED", label: "Awaiting payout", count: overview?.payoutsWaiting },
    { id: "DISPUTED", label: "Disputed", count: overview?.openDisputes },
    { id: "RELEASED", label: "Completed" },
    { id: "REFUNDED", label: "Refunded" },
  ];

  const columns = [
    { key: "id", label: "Order", render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8).toUpperCase()}</span> },
    { key: "carTitle", label: "Car", render: (r) => <span className="block max-w-[220px] truncate font-semibold">{r.carTitle}</span> },
    { key: "buyerName", label: "Buyer", render: (r) => r.buyerName || "—" },
    { key: "sellerName", label: "Seller", render: (r) => r.sellerName || "—" },
    {
      key: "amountPaise",
      label: "Booking",
      render: (r) => (
        <span className="block">
          <span className="block font-semibold">{formatPaise(r.amountPaise)}</span>
          <span className="block text-xs text-[#8c8c8c]">of {formatPaise(r.carPricePaise)}</span>
        </span>
      ),
    },
    { key: "status", label: "Status", render: (r) => orderStatusPill(r.status) },
    { key: "paidAt", label: "Paid", render: (r) => (r.paidAt ? formatDateTime(r.paidAt) : "—") },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Bookings, deliveries and seller payouts." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs items={tabs} value={list.filters.status} onChange={(v) => list.setParam("status", v)} label="Order status" />
        <SearchBox value={list.search} onChange={list.setSearch} placeholder="Search car, buyer, seller or order" />
      </div>
      <DataTable
        columns={columns}
        rows={list.data?.content}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={(r) => navigate(`/admin/orders/${r.id}`)}
        emptyTitle="No orders here"
        emptyText="Nothing matches this filter."
      />
      <Pagination data={list.data} onPage={list.setPage} />
    </>
  );
}
