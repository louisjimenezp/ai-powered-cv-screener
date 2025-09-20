import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, Upload, MessageSquare, BarChart3, Menu, X } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className={`flex h-16 items-center border-b border-gray-200 ${
          isSidebarCollapsed ? 'justify-center px-4' : 'px-6'
        }`}>
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
        </div>
        
        <nav className={`mt-8 ${isSidebarCollapsed ? 'px-1' : 'px-4'}`}>
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
                      isSidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4'
                    }`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
