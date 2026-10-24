// src/components/dashboard/approval.jsx
// Shows the admin-review state of a listing to its owner.
//   approvalStatus: "PENDING" | "APPROVED" | "REJECTED"   (comes from my-listings)
import { Pill } from "./ui";

const MAP = {
  PENDING: { label: "In review", tone: "amber" },
  APPROVED: { label: "Live", tone: "green" },
  REJECTED: { label: "Rejected", tone: "red" },
};

export const ApprovalBadge = ({ status }) => {
  const m = MAP[status];
  return m ? <Pill tone={m.tone}>{m.label}</Pill> : null;
};

// the line under a listing explaining what is going on
export const ApprovalNote = ({ status, reason }) => {
  if (status === "PENDING")
    return <p className="mt-2 text-xs text-[#8a6100]">Our team is checking this listing. It will go live once approved.</p>;
  if (status === "REJECTED")
    return (
      <p className="mt-2 rounded-lg bg-[#fdecec] px-3 py-2 text-xs text-[#b42318]">
        Not approved{reason ? `: ${reason}` : "."} Fix the problem and list the car again.
      </p>
    );
  return null;
};

// only approved listings can be shown to buyers / edited as "live"
export const isLive = (l) => !l.approvalStatus || l.approvalStatus === "APPROVED";
