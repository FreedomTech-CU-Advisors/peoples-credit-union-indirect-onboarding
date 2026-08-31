import MemberPhone from "../components/MemberPhone";
import { PageHeader } from "../components/ui";

export default function SelfServe() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Self-serve"
        subtitle="Member phone · leftover → Add → Enroll. DEMO member — not this credit union’s book."
      >
        <span className="pill bg-ca-50 text-ca-700 ring-1 ring-ca-100">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> DEMO · Derek Hale · 2024
          Silverado
        </span>
      </PageHeader>

      <div className="flex justify-center pb-4">
        <MemberPhone />
      </div>
    </div>
  );
}
