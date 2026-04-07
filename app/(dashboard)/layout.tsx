import BottomNav from '@/components/layout/BottomNav'
import { DataProvider } from '@/contexts/DataContext'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DataProvider>
            {children}
            <BottomNav />
        </DataProvider>
    )
}