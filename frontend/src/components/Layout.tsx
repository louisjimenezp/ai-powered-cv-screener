import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, Upload, MessageSquare, BarChart3, Menu, X, PanelLeftClose } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Upload CVs', href: '/upload', icon: Upload },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 md:hidden">
          <div className="flex h-16 items-center px-4">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors mr-3"
              aria-label={isMobileSidebarOpen ? "Cerrar panel lateral" : "Abrir menú"}
            >
              {isMobileSidebarOpen ? (
                <PanelLeftClose className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                CV Screener
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        isMobile 
          ? (isMobileSidebarOpen ? 'w-64' : '-translate-x-full')
          : (isSidebarCollapsed ? 'w-16' : 'w-64')
      } ${isMobile ? 'md:translate-x-0' : ''}`}>
        <div className={`flex h-16 items-center border-b border-gray-200 ${
          isMobile 
            ? 'justify-between px-6' 
            : (isSidebarCollapsed ? 'justify-center px-4' : 'px-6')
        }`}>
          {isMobile ? (
            <>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">
                  CV Screener
                </h1>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </>
          ) : (
            <>
              {!isSidebarCollapsed && (
                <>
                  <FileText className="h-8 w-8 text-primary-600 flex-shrink-0" />
                  <h1 className="ml-2 text-xl font-bold text-gray-900 flex-1">
                    CV Screener
                  </h1>
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Colapsar sidebar"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
              {isSidebarCollapsed && (
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Expandir sidebar"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </>
          )}
        </div>
        
        <nav className={`mt-8 ${isMobile ? 'px-4' : (isSidebarCollapsed ? 'px-1' : 'px-4')}`}>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${
                      isMobile 
                        ? 'px-4' 
                        : (isSidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4')
                    }`}
                    title={isMobile ? undefined : (isSidebarCollapsed ? item.name : undefined)}
                  >
                    <item.icon className={`h-5 w-5 ${(isMobile || !isSidebarCollapsed) ? 'mr-3' : ''}`} />
                    {(isMobile || !isSidebarCollapsed) && item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        isMobile 
          ? 'pt-16' 
          : (isSidebarCollapsed ? 'pl-16' : 'pl-64')
      }`}>
        <main className={`${isMobile ? 'py-4' : 'py-8'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
