import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.foster-care.co.uk'),
  title: {
    template: '%s | Foster Care UK',
    default: 'Find UK Foster Care Agencies — Compare 500+ Ofsted-Rated Agencies',
  },
  description: 'Find and compare verified fostering agencies across the UK. Search by location and service type. Read reviews, ratings, and contact details.',
  keywords: ['fostering agencies UK', 'foster care', 'foster parent', 'Ofsted rated agencies', 'child fostering', 'foster children'],
  authors: [{ name: 'Foster Care UK' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Foster Care UK',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-white/10">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Fostering Types */}
          <div>
            <h3 className="text-white font-semibold mb-4">Fostering Types</h3>
            <ul className="space-y-3">
              <li><a href="/fostering-types/short-term-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Short-Term Fostering</a></li>
              <li><a href="/fostering-types/long-term-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Long-Term Fostering</a></li>
              <li><a href="/fostering-types/emergency-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Emergency Fostering</a></li>
              <li><a href="/fostering-types/therapeutic-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Therapeutic Fostering</a></li>
              <li><a href="/fostering-types/respite-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Respite Fostering</a></li>
              <li><a href="/fostering-types/parent-and-child-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Parent & Child</a></li>
              <li><a href="/fostering-types/disability-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Disability Fostering</a></li>
              <li><a href="/fostering-types/kinship-fostering" className="text-slate-400 hover:text-[#f97316] transition-colors">Kinship Fostering</a></li>
            </ul>
          </div>

          {/* Column 2: UK Locations */}
          <div>
            <h3 className="text-white font-semibold mb-4">UK Locations</h3>
            <ul className="space-y-3">
              <li><a href="/locations/england/london" className="text-slate-400 hover:text-[#f97316] transition-colors">London</a></li>
              <li><a href="/locations/england/birmingham" className="text-slate-400 hover:text-[#f97316] transition-colors">Birmingham</a></li>
              <li><a href="/locations/england/manchester" className="text-slate-400 hover:text-[#f97316] transition-colors">Manchester</a></li>
              <li><a href="/locations/england/leeds" className="text-slate-400 hover:text-[#f97316] transition-colors">Leeds</a></li>
              <li><a href="/locations/england/liverpool" className="text-slate-400 hover:text-[#f97316] transition-colors">Liverpool</a></li>
              <li><a href="/locations/england/bristol" className="text-slate-400 hover:text-[#f97316] transition-colors">Bristol</a></li>
              <li><a href="/locations/england/glasgow" className="text-slate-400 hover:text-[#f97316] transition-colors">Glasgow</a></li>
              <li><a href="/locations/england" className="text-[#f97316] hover:text-orange-400 transition-colors">View all locations →</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="/blog" className="text-slate-400 hover:text-[#f97316] transition-colors">Foster Care Blog</a></li>
              <li><a href="/about" className="text-slate-400 hover:text-[#f97316] transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-slate-400 hover:text-[#f97316] transition-colors">Contact</a></li>
              <li><a href="/privacy" className="text-slate-400 hover:text-[#f97316] transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-slate-400 hover:text-[#f97316] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="/list-your-agency" className="text-slate-400 hover:text-[#f97316] transition-colors">List Your Agency</a></li>
              <li><a href="/careers" className="text-slate-400 hover:text-[#f97316] transition-colors">Careers</a></li>
              <li><a href="/press" className="text-slate-400 hover:text-[#f97316] transition-colors">Press</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-400">
          <p>© {new Date().getFullYear()} Foster Care UK. All rights reserved. Ofsted is a registered trademark.</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}