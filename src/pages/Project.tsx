import { Card, CardHeader, PageHeader } from "../components/ui";

export default function Project() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Founding partner · Indirect welcome"
        subtitle="A desk for the welcome call, and a link if nobody picks up. Built with you, not thrown over the wall."
      >
        <span className="pill bg-ca-50 text-ca-700 ring-1 ring-ca-100">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> This meeting
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="What this is" />
          <div className="space-y-3 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600">
            <p>
              Consultant desk (queue, script, Call or Send link) plus member phone
              (leftover → Add → Enroll). One book.
            </p>
            <p>Not a core project. Not a new carrier.</p>
            <p>
              Works with ASG GAP/VSC at the dealer and with whoever they already have
              on debt protection.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="What we need from you" />
          <div className="space-y-3 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600">
            <p>A yes from this room.</p>
            <p>Who owns welcome calls, and we can talk to them.</p>
            <p>One week of unprotected indirect loans so we score real members.</p>
            <p>Thirty minutes a week while we build.</p>
            <p>Say what’s wrong in the room, don’t wait for a committee.</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="What you get" />
          <div className="space-y-3 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600">
            <p>You shape scripts and who we call first.</p>
            <p>It works with products you already have.</p>
            <p>No Finastra project.</p>
            <p>Founding terms in writing Friday.</p>
            <p>You’re in the room while we make it.</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Timeline" />
          <ol className="space-y-3 px-5 pb-5 pt-3">
            {[
              "This week: green light, owner, data.",
              "Friday: how it works, in writing.",
              "Next: your members in the queue.",
              "Live for the welcome team is a later yes.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ca-600" />
                <p className="text-sm leading-relaxed text-slate-600">{line}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Not this meeting" />
        <div className="grid gap-3 px-5 pb-5 pt-3 sm:grid-cols-2">
          {[
            "No price.",
            "No carrier switch.",
            "Dealer-sold GAP/VSC stays.",
            "Draft, not production, not hooked to the core.",
          ].map((line) => (
            <p
              key={line}
              className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-600"
            >
              {line}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
