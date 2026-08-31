import MemberPhone from "../components/MemberPhone";
import { PageHeader } from "../components/ui";

export default function SelfServe() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Member self-serve"
        subtitle="New indirect member · verify in seconds · enroll protection the dealer didn't include. DEMO member — not live book data."
      >
        <span className="pill bg-ca-50 text-ca-700 ring-1 ring-ca-100">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> ~60 sec · Derek Hale ·
          2024 F-150 Raptor · Kruse Motors
        </span>
      </PageHeader>

      <div className="flex justify-center pb-4">
        <MemberPhone />
      </div>
    </div>
  );
}
