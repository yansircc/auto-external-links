import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import BlacklistDialog from "@/components/blacklist/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/feedback/dialog";

interface SiteHeaderProps {
  onLogoClick?: () => void;
}

export function SiteHeader({ onLogoClick }: SiteHeaderProps) {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full p-0"
            onClick={onLogoClick}
          >
            <Image
              src="/site-logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-full transition-transform hover:rotate-12"
              priority
            />
          </Button>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <FeedbackDialog />
            <BlacklistDialog />
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </TooltipProvider>
  );
}
