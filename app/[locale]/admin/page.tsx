import { auth } from "@/auth";
import AdminDashboardClient from './AdminDashboardClient';
import { getTranslations } from "next-intl/server";

export default async function AdminPage() {
  const session = await auth();
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] text-[#d4a017]">
        <div className="text-center">
          <h1 className="text-3xl font-serif mb-4">Sacred Ground</h1>
          <p className="text-sm tracking-widest uppercase opacity-80">Only the temple keepers may enter here.</p>
        </div>
      </main>
    );
  }

  return <AdminDashboardClient />;
}
