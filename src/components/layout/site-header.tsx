import LoginLogoutBtn from "@/components/auth/login-logout-btn";
import FeedbackDialog from "@/components/feedback/dialog";
import LocaleSwitcher from "@/components/locale/swither";
import SettingsButton from "@/components/settings/settings-button";
import { ThemeToggle } from "@/components/theme-toggle";
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
					<SettingsButton />
					<ThemeToggle />
					<LocaleSwitcher />
					<LoginLogoutBtn />
				</nav>
			</div>
		</header>
	);
}
