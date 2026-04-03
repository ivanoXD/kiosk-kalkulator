'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  MonitorSmartphone, 
  Users, 
  Truck, 
  Settings,
  Zap
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ponude', href: '/ponude', icon: FileText },
  { name: 'Narudžbe', href: '/narudzbe', icon: ShoppingCart },
  { name: 'Modeli kioska', href: '/modeli', icon: MonitorSmartphone },
  { name: 'Kupci', href: '/kupci', icon: Users },
  { name: 'Dobavljači', href: '/dobavljaci', icon: Truck },
  { name: 'Postavke', href: '/postavke', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-zinc-950 text-zinc-300 h-screen border-r border-zinc-900 border-solid relative flex-shrink-0 z-50">
      <div className="flex h-16 items-center px-5 border-b border-zinc-900 border-solid shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="leading-none mt-1">Kiosk Kalkulator</span>
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-indigo-500' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-zinc-900">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400">
          <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/50">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">Administrator</span>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Offline Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
