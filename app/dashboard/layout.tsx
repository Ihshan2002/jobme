// app/dashboard/layout.tsx

import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Sidebar />
      {/* Main content — ml-56 to offset sidebar width */}
      <main className="ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}