import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#F7F6F4]">
      <AdminSidebar adminEmail={session.user.email} />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
