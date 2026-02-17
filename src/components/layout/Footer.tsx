import Link from "next/link";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-bold">ATS Resume Analyzer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered resume optimization for ATS compatibility. Get your resume past the bots.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/analyze" className="hover:text-foreground">ATS Score Checker</Link></li>
              <li><Link href="/templates" className="hover:text-foreground">Resume Templates</Link></li>
              <li><Link href="/cover-letter" className="hover:text-foreground">Cover Letter Generator</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">ATS Guide</Link></li>
              <li><Link href="#" className="hover:text-foreground">Resume Tips</Link></li>
              <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ATS Resume Analyzer. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
