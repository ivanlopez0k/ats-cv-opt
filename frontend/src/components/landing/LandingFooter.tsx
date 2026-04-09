import { FileText } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <FileText className="h-5 w-5" />
          CVMaster
        </div>
        <p className="text-muted-foreground text-sm">© 2026 CVMaster. Optimizá tu CV, conseguí más entrevistas.</p>
      </div>
    </footer>
  );
}
