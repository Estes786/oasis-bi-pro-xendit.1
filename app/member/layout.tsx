'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import Sidebar from '@/components/Sidebar';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/auth/signin');
        return;
      }

      setUser(session.user);
    } catch (err) {
      console.error('Auth check error:', err);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    if (segments.length <= 1) return 'Dashboard';
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    return segments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + segments.slice(0, index + 1).join('/'),
      current: index === segments.length - 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Breadcrumbs & Page Title */}
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  {getBreadcrumbs().map((breadcrumb, index) => (
                    <div key={breadcrumb.href} className="flex items-center">
                      {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                      <a
                        href={breadcrumb.href}
                        className={`hover:text-blue-600 transition-colors ${
                          breadcrumb.current ? 'text-blue-600 font-semibold' : ''
                        }`}
                      >
                        {breadcrumb.name}
                      </a>
                    </div>
                  ))}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              </div>

              {/* Top Right Actions */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </button>
                  {searchOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                      <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <div className="mt-3 text-xs text-gray-500">
                        <p className="font-semibold mb-2">Quick Actions</p>
                        <div className="space-y-1">
                          <a href="/member/analytics/realtime" className="block hover:text-blue-600">Real-time Analytics</a>
                          <a href="/member/reports/create" className="block hover:text-blue-600">Create Report</a>
                          <a href="/member/insights" className="block hover:text-blue-600">AI Insights</a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">Member</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm px-8 py-6 mt-12">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2025 OASIS BI PRO. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="/legal/privacy" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="/legal/terms" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="/legal/contact" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
