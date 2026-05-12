import { Outlet } from "react-router-dom"
import { SidebarNav } from "./SidebarNav"
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Application Header */}
      <header className="h-16 bg-[#0a192f] border-b border-white/10 flex items-center justify-center px-4 lg:px-6 flex-shrink-0 z-20 relative shadow-lg">
        <div className="absolute left-4 lg:left-6 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-white hover:bg-white/10 -ml-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center h-[60px]">
          <img 
            src="/northstar-logo.svg" 
            alt="North Star Resource Group" 
            className="h-[60px] w-auto object-contain shrink-0" 
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 top-16 bg-slate-900/40 z-20 lg:hidden backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Container */}
        <div 
          className={`
            fixed inset-y-0 top-16 left-0 z-30 lg:relative lg:top-0
            transition-all duration-300 ease-in-out lg:overflow-hidden
            ${isSidebarOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}
            h-[calc(100vh-4rem)] lg:h-auto
          `}
        >
          <div className="w-64 h-full shadow-2xl lg:shadow-none bg-slate-900 flex flex-col shrink-0">
            <SidebarNav onClose={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          </div>
        </div>
        
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full relative scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
