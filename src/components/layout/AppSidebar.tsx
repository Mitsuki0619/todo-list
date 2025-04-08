"use client";

import Link from "next/link";
import { Home, CheckSquare, LogOut } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { logout } from "@/features/auth/actions/logout";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth";

export function AppSidebar() {
	const pathname = usePathname();
	const user = useUser();
	if (!user) {
		return null;
	}
	return (
		<Sidebar>
			<SidebarHeader>
				<h2 className="px-4 text-xl font-bold">TODO</h2>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={pathname === "/"}>
							<Link href="/" className="flex items-center gap-2">
								<Home className="h-4 w-4" />
								<span>ホーム</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={pathname === "/todos"}>
							<Link href="/todos" className="flex items-center gap-2">
								<CheckSquare className="h-4 w-4" />
								<span>タスク</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter className="p-4">
				<form action={logout}>
					<Button
						type="submit"
						variant="outline"
						className="w-full justify-start gap-2"
					>
						<LogOut className="h-4 w-4" />
						<span>ログアウト</span>
					</Button>
				</form>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
