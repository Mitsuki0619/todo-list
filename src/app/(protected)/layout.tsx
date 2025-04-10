import AppLayout from "@/components/layout/AppLayout";
import { UserProvider } from "@/lib/auth";
import { getUser } from "@/lib/db/queries";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const userPromise = getUser();
	return (
		<UserProvider userPromise={userPromise}>
			<AppLayout>{children}</AppLayout>
		</UserProvider>
	);
}
