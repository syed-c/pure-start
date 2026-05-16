import { Shield } from "lucide-react";

interface InsuranceFAQProps {
  insuranceName: string;
}

const faqs = [
  {
    q: "How do I apply for {insurance} fostering?",
    a: "Contact your local {insurance} fostering agency or visit their website to begin the application process. Agencies typically provide information sessions and initial assessments to help you understand the requirements and steps involved.",
  },
  {
    q: "What allowances and support are available?",
    a: "Foster carers receive weekly allowances to cover the cost of caring for a child, including food, clothing, and activities. Additional support such as respite care, training, and 24/7 helpline access is also provided by most agencies.",
  },
  {
    q: "What types of fostering are there?",
    a: "There are several types of fostering including short-term, long-term, emergency, respite, and specialist fostering for children with complex needs. Your agency will help match you with the type that best suits your circumstances.",
  },
  {
    q: "Do I need my own home to foster?",
    a: "You can foster if you own your home or rent, as long as you have a spare bedroom. Agencies assess your living situation to ensure it meets the requirements for providing a safe and nurturing environment.",
  },
  {
    q: "Can I foster if I work full-time?",
    a: "Many foster carers work full-time, though some types of fostering may require more flexibility. Agencies discuss availability and commitments during the assessment process to find the right balance for you.",
  },
];

export function InsuranceFAQ({ insuranceName }: InsuranceFAQProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-xl border border-border bg-card overflow-hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between p-4 font-medium hover:bg-muted/50 transition-colors">
              <span>{faq.q.replace("{insurance}", insuranceName)}</span>
              <span className="ml-4 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              {faq.a.replace("{insurance}", insuranceName)}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
