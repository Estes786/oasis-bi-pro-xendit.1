'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  Users,
  Database,
  FileText,
  Brain,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart,
  TrendingUp,
  Zap,
  BookOpen,
  Map,
  CreditCard,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  submenu?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Analytics',
    href: '/member/analytics',
    icon: TrendingUp,
    submenu: [
      { name: 'Overview', href: '/member/analytics', icon: BarChart3 },
      { name: 'Real-time', href: '/member/analytics/realtime', icon: Zap },
      { name: 'Traffic', href: '/member/analytics/traffic', icon: PieChart },
      { name: 'Conversions', href: '/member/analytics/conversions', icon: TrendingUp },
    ],
  },
  {
    name: 'Reports',
    href: '/member/reports',
    icon: FileText,
    submenu: [
      { name: 'All Reports', href: '/member/reports', icon: FileText },
      { name: 'Create Report', href: '/member/reports/create', icon: Sparkles },
      { name: 'Scheduled', href: '/member/reports/scheduled', icon: LineChart },
    ],
  },
  {
    name: 'AI Insights',
    href: '/member/insights',
    icon: Brain,
    badge: 'NEW',
  },
  {
    name: 'Integrations',
    href: '/member/integrations',
    icon: Database,
  },
  {
    name: 'Team',
    href: '/member/team',
    icon: Users,
  },
  {
    name: 'Tutorial',
    href: '/member/tutorial',
    icon: BookOpen,
  },
  {
    name: 'Roadmap',
    href: '/member/roadmap',
    icon: Map,
  },
];

const bottomNav: NavItem[] = [
  {
    name: 'Billing',
    href: '/member/billing',
    icon: CreditCard,
  },
  {
    name: 'Settings',
    href: '/member/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const toggleSubmenu = (name: string) => {
    setExpandedMenu(expandedMenu === name ? null : name);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-gray-900">OASIS BI</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedMenu === item.name ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </button>
                  {!collapsed && expandedMenu === item.name && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive(subitem.href)
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <subitem.icon className="w-4 h-4 flex-shrink-0" />
                          <span>{subitem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-gray-200 space-y-1">
          {bottomNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
