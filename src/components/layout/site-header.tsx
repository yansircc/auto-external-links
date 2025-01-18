import { ThemeToggle } from "@/components/theme-toggle";
import BlacklistDialog from "@/components/settings/dialog";
import FeedbackDialog from "@/components/feedback/dialog";
import LocaleSwitcher from "@/components/locale/swither";
import LoginLogoutBtn from "@/components/auth/login-logout-btn";
import Logo from "./logo";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <FeedbackDialog />
          <BlacklistDialog />
          <ThemeToggle />
          <LocaleSwitcher />
          <LoginLogoutBtn />
        </nav>
      </div>
    </header>
  );
}
