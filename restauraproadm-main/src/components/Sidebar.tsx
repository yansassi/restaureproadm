import React from 'react';
import { 
  LayoutDashboard, 
  FileImage, 
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'requests';
  onTabChange: (tab: 'dashboard' | 'requests') => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      name: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'requests' as const,
      name: 'Pedidos',
      icon: FileImage
    }
  ];

  const handleMenuClick = (itemId: 'dashboard' | 'requests') => {
    console.log('Menu item clicked:', itemId);
    onTabChange(itemId);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-40 w-64 border-r border-gray-200
        lg:relative lg:translate-x-0 lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileImage className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Restore Admin</h2>
              <p className="text-sm text-gray-500">Painel Administrativo</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${
                  activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                }`} />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Sistema Online</span>
          </div>
        </div>
      </div>
    </>
  );
}