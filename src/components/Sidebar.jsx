import { LayoutDashboard, Database, Activity, Box, Printer, Network } from 'lucide-react'; 
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

export function Sidebar({ isOpen, onClose, currentView, onChangeView }) {

    const menuItems = [
        // Menu Baru Di Sini
        { id: 'organs', label: 'Management Organ', icon: Database },
        { id: 'systems', label: 'Sistem Organ', icon: Network }, 
        { id: 'markers', label: 'AR Marker Gen', icon: Printer },
    ];

    return (
        <>
            <aside className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-white p-6 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <Box className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">BioLens.</span>
                </div>

                <nav className="space-y-1">
                    <Button
                        variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2"
                        onClick={() => onChangeView('dashboard')}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>

                    <div className="pt-4 pb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase px-2">Menu</p>
                    </div>

                    {menuItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={currentView === item.id ? 'secondary' : 'ghost'}
                            className={cn("w-full justify-start gap-2", currentView === item.id ? "font-bold" : "text-slate-500")}
                            onClick={() => onChangeView(item.id)}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </aside>

            {isOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
            )}
        </>
    );
}