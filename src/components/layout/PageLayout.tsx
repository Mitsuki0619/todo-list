export function PageLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">{title}</h1>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
