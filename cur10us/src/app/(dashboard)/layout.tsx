import { SidebarProvider } from "@/hooks/useSidebar"
import AppSidebar from "@/components/layout/app-sidebar"
import DashboardHeader from "@/components/layout/dashboard-header"
import SidebarMobile from "@/components/layout/sidebar-mobile"
import PendingAccountGate from "@/components/layout/PendingAccountGate"
import TwoFactorGate from "@/components/layout/TwoFactorGate"
import MustChangePasswordGate from "@/components/layout/MustChangePasswordGate"
import MaintenanceGuard from "@/components/layout/MaintenanceGuard"
import SessionGuard from "@/components/layout/SessionGuard"
import { SchoolBrandingProvider } from "@/provider/school-branding"
import FloatingHelpButton from "@/components/ui/FloatingHelpButton"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionGuard>
      <MaintenanceGuard>
        <SchoolBrandingProvider>
          <TwoFactorGate>
            <PendingAccountGate>
              <MustChangePasswordGate>
                <SidebarProvider>
                  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
                    <AppSidebar />
                    <SidebarMobile />
                    <div className="flex-1 flex flex-col min-w-0 w-full">
                      <DashboardHeader />
                      <main className="flex-1 overflow-y-auto styled-scroll">
                        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                          {children}
                        </div>
                      </main>
                    </div>
                  </div>
                  <FloatingHelpButton />
                </SidebarProvider>
              </MustChangePasswordGate>
            </PendingAccountGate>
          </TwoFactorGate>
        </SchoolBrandingProvider>
      </MaintenanceGuard>
    </SessionGuard>
  )
}
