import { Shield, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";

export function InsuranceEducation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold mb-2">
          How Partner Organisation Support Works in the UK
        </h2>
        <p className="text-muted-foreground">
          Understanding how partner organisations support fostering agencies and carers across the UK.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold">Ofsted Registration</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All fostering agencies in England must be registered with Ofsted and meet the national minimum standards for fostering services, ensuring consistent quality of care for children.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold">Local Authority Partnerships</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Many independent fostering agencies work in partnership with local authorities to provide placements. These partnerships ensure children are matched with suitable carers in their local area.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold">Safeguarding Requirements</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All fostering agencies must comply with safeguarding regulations, including enhanced DBS checks, safer recruitment policies, and ongoing supervision by qualified social workers.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold">Training & Development</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Partner organisations provide comprehensive training programmes for foster carers, including the Skills to Foster course, safeguarding training, and continuous professional development.
          </p>
        </div>
      </div>
    </div>
  );
}
