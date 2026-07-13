export type ModerationStatus = "pending" | "approved" | "rejected";

type ModerationStatusProps = {
  status: ModerationStatus;
  note?: string | null;
};

const statusLabels: Record<ModerationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ModerationStatus({ status, note }: ModerationStatusProps) {
  return (
    <div className="actor-moderation-status">
      <div className="actor-moderation-status-line">
        <span>Admin review</span>
        <span className={`status-pill status-pill--${status}`}>
          {statusLabels[status]}
        </span>
      </div>
      {note && status !== "approved" ? (
        <p className="moderation-note">Admin note: {note}</p>
      ) : null}
    </div>
  );
}
