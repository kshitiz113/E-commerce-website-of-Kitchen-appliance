// components/AdminLayout.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Navigation items
  const navItems = [
    { href: '/admin', name: 'Dashboard', icon: '🏠' },
    { href: '/admin/products', name: 'Products', icon: '🛍️' },
    { href: '/admin/parts', name: 'Parts', icon: '🔧' },
    { href: '/admin/users', name: 'Users', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Appliance Admin</h1>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg ${pathname === item.href ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-200">
                <span className="text-gray-600">🔔</span>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  A
                </div>
                <span className="ml-2 text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}