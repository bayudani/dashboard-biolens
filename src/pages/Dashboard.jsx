import { useState } from 'react';
import { Menu, ChevronRight, UserCircle, LogOut } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Button } from "../components/ui/button";

// Components Halaman
import DashboardHome from '../components/DashboardHome'; 
import OrganManager from '../components/OrganManager'; 
import SystemManager from '../components/SystemManager'; 
import MarkerGenerator from '../components/MarkerGenerator'; 

// --- IMPORT MENU BARU ---
import QuizManager from '../components/quizManager';
import ScoreManager from '../components/scoreManager';

export default function Dashboard({ onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logic buat nentuin konten mana yang dirender
  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <DashboardHome onChangeView={setCurrentView} />;
      case 'systems': return <SystemManager />;
      case 'organs': return <OrganManager />;
      case 'markers': return <MarkerGenerator />;
      // --- CASE BARU ---
      case 'quizzes': return <QuizManager />;
      case 'scores': return <ScoreManager />;
      
      default: return <DashboardHome onChangeView={setCurrentView} />; 
    }
  };

  // Logic buat ganti Judul di Header
  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'systems': return 'Management Sistem Organ';
      case 'organs': return 'Overview Organ';
      case 'markers': return 'Generator Kartu AR';
      // --- JUDUL BARU ---
      case 'quizzes': return 'Management Kuis';
      case 'scores': return 'Data Nilai Siswa';
      
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          setMobileMenuOpen(false); 
        }}
      />

      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Header */}
        <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <span className="hidden md:inline">App</span>
              <ChevronRight className="h-4 w-4 hidden md:inline" />
              <span className="font-semibold text-slate-900">{getTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold">Admin</span>
              <span className="text-xs text-slate-500">biolens</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border">
                  <UserCircle className="h-6 w-6 text-slate-400" />
               </div>
               <Button variant="ghost" size="icon" onClick={onLogout} className="text-slate-400 hover:text-red-600">
                  <LogOut className="h-5 w-5" />
               </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}