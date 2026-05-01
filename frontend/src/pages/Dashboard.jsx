
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SectionCards } from "@/components/section-cards"
import { DataTable } from "@/components/data-table"
import data from "../app/dashboard/data.json"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-1">
        <AppSidebar />
        <div className="flex-1">
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
            <SectionCards />
            <DataTable data={data} />
          </main>
        </div>
      </div>
    </div>
  )
}
