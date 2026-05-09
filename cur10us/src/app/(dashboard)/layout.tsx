import Menu from "@/components/layout/Menu"
import NavBar from "@/components/layout/Navbar"
import MobileNav from "@/components/layout/MobileNav"
import PendingAccountGate from "@/components/layout/PendingAccountGate"
import MustChangePasswordGate from "@/components/layout/MustChangePasswordGate"
import MaintenanceGuard from "@/components/layout/MaintenanceGuard"
import SessionGuard from "@/components/layout/SessionGuard"
import { SchoolBrandingProvider } from "@/provider/school-branding"
import SidebarBrand from "@/components/layout/SidebarBrand"
import FloatingHelpButton from "@/components/ui/FloatingHelpButton"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionGuard>
    <MaintenanceGuard>
    <SchoolBrandingProvider>
    <PendingAccountGate>
    <MustChangePasswordGate>
      <div className="h-screen flex flex-col md:flex-row">
        {/* SIDEBAR — hidden on mobile, visible md+ */}
        <aside className="hidden md:flex md:flex-col md:w-[72px] lg:w-[220px] xl:w-[200px] shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
          <SidebarBrand />
          <div className="flex-1 overflow-y-auto styled-scroll px-2 pb-4">
            <Menu />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f7f8fa] dark:bg-zinc-950">
          <NavBar />
          <main className="flex-1 overflow-y-auto styled-scroll pb-20 md:pb-0">
            {children}
          </main>
        </div>

        {/* MOBILE BOTTOM NAV — visible on mobile only */}
        <MobileNav />
        <FloatingHelpButton />
      </div>
    </MustChangePasswordGate>
    </PendingAccountGate>
    </SchoolBrandingProvider>
    </MaintenanceGuard>
    </SessionGuard>
  );
}
