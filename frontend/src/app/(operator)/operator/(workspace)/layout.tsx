import type { ReactNode } from "react";

import { OperatorHeaderNotifications } from "../../../../components/operator/operator-header-notifications";
import { OperatorTabNavigation } from "../../../../components/operator/operator-tab-navigation";
import { CasIcon } from "../../../../components/ui/cas-icon";
import { ThemeToggle } from "../../../../components/ui/theme-toggle";

type OperatorWorkspaceLayoutProps = {
	children: ReactNode;
};

export default function OperatorWorkspaceLayout({ children }: OperatorWorkspaceLayoutProps) {
	return (
		<main className="min-h-screen bg-cas-surface text-cas-on-surface">
			<div className="sticky top-0 z-40 shadow-xs">
				<header className="relative z-20 bg-cas-header px-4 py-4 backdrop-blur-xl sm:px-8 xl:px-12 border-b border-cas-outline-variant/15">
					<div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<span className="grid size-10 place-items-center rounded-xl bg-cas-primary text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)]">
								<CasIcon className="size-5.5" name="restaurant" />
							</span>
							<div className="flex items-center gap-2">
								<span className="text-xl font-black tracking-tight text-cas-primary">CAS</span>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<ThemeToggle />
							<OperatorHeaderNotifications />

							<div className="flex items-center gap-3 rounded-xl bg-cas-glass px-3 py-2">
								<span className="grid size-8 place-items-center rounded-lg bg-cas-secondary-container/30 text-cas-secondary">
									<CasIcon className="size-4.5" name="user" />
								</span>
								<div className="hidden sm:block">
									<p className="text-xs font-extrabold">Nhân viên CAS</p>
									<p className="text-[0.68rem] text-cas-on-surface-variant">Đang trực</p>
								</div>
							</div>
						</div>
					</div>
				</header>

				<OperatorTabNavigation />
			</div>

			<div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-8 sm:py-9 xl:px-12">{children}</div>
		</main>
	);
}
