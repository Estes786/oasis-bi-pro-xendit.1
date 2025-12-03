'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart,
  Activity,
  Eye,
  Clock,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface RealtimeMetrics {
  activeUsers: number;
  activeUsersChange: number;
  pageViews: number;
  pageViewsChange: number;
  revenue: number;
  revenueChange: number;
  conversions: number;
  conversionsChange: number;
  avgSessionDuration: string;
  bounceRate: number;
}

interface TrafficSource {
  name: string;
  users: number;
  percentage: number;
  change: number;
  color: string;
}

interface TopPage {
  path: string;
  views: number;
  uniqueUsers: number;
  avgTime: string;
  bounceRate: number;
}

interface DeviceStats {
  device: string;
  users: number;
  percentage: number;
  icon: any;
  color: string;
}

interface GeographicData {
  country: string;
  users: number;
  revenue: number;
  flag: string;
}

export default function RealtimeAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Real-time metrics state
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    activeUsers: 1247,
    activeUsersChange: 12.5,
    pageViews: 3842,
    pageViewsChange: 8.3,
    revenue: 15847000,
    revenueChange: -2.4,
    conversions: 89,
    conversionsChange: 15.7,
    avgSessionDuration: '3m 42s',
    bounceRate: 42.3
  });

  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([
    { name: 'Direct', users: 428, percentage: 34.3, change: 5.2, color: 'blue' },
    { name: 'Organic Search', users: 387, percentage: 31.0, change: 12.8, color: 'green' },
    { name: 'Social Media', users: 248, percentage: 19.9, change: -3.5, color: 'purple' },
    { name: 'Referral', users: 123, percentage: 9.9, change: 8.1, color: 'orange' },
    { name: 'Email', users: 61, percentage: 4.9, change: -1.2, color: 'pink' }
  ]);

  const [topPages, setTopPages] = useState<TopPage[]>([
    { path: '/dashboard', views: 842, uniqueUsers: 523, avgTime: '4m 12s', bounceRate: 28.5 },
    { path: '/pricing', views: 624, uniqueUsers: 487, avgTime: '2m 45s', bounceRate: 45.2 },
    { path: '/features', views: 518, uniqueUsers: 392, avgTime: '3m 18s', bounceRate: 38.7 },
    { path: '/blog/ai-analytics', views: 423, uniqueUsers: 318, avgTime: '5m 32s', bounceRate: 22.1 },
    { path: '/auth/signup', views: 387, uniqueUsers: 365, avgTime: '1m 28s', bounceRate: 52.8 }
  ]);

  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([
    { device: 'Mobile', users: 642, percentage: 51.5, icon: Smartphone, color: 'blue' },
    { device: 'Desktop', users: 486, percentage: 39.0, icon: Monitor, color: 'purple' },
    { device: 'Tablet', users: 119, percentage: 9.5, icon: Tablet, color: 'pink' }
  ]);

  const [geoData, setGeoData] = useState<GeographicData[]>([
    { country: 'Indonesia', users: 847, revenue: 8942000, flag: '🇮🇩' },
    { country: 'Singapore', users: 183, revenue: 3248000, flag: '🇸🇬' },
    { country: 'Malaysia', users: 124, revenue: 1847000, flag: '🇲🇾' },
    { country: 'Thailand', users: 68, revenue: 1124000, flag: '🇹🇭' },
    { country: 'Philippines', users: 25, revenue: 686000, flag: '🇵🇭' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time data changes
      setMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20 - 10),
        pageViews: prev.pageViews + Math.floor(Math.random() * 50 - 20)
      }));
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Analytics</h2>
          <p className="text-gray-600 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            <span>Live data updating every 5 seconds</span>
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString('id-ID')}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="5m">Last 5 minutes</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>

          {/* Export */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Live Status Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {formatNumber(metrics.activeUsers)} Active Users Right Now
              </h3>
              <p className="text-green-100">
                Viewing {formatNumber(metrics.pageViews)} pages • {metrics.avgSessionDuration} avg session
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">LIVE</span>
            </div>
            <p className="text-green-100 text-sm">Real-time monitoring active</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Users */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getChangeColor(metrics.activeUsersChange)}`}>
              {getChangeIcon(metrics.activeUsersChange)}
              {Math.abs(metrics.activeUsersChange)}%
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Active Users</h4>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.activeUsers)}</p>
          <p className="text-xs text-gray-500 mt-2">Currently browsing</p>
        </div>

        {/* Page Views */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getChangeColor(metrics.pageViewsChange)}`}>
              {getChangeIcon(metrics.pageViewsChange)}
              {Math.abs(metrics.pageViewsChange)}%
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Page Views</h4>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.pageViews)}</p>
          <p className="text-xs text-gray-500 mt-2">Last hour</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getChangeColor(metrics.revenueChange)}`}>
              {getChangeIcon(metrics.revenueChange)}
              {Math.abs(metrics.revenueChange)}%
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Revenue</h4>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.revenue)}</p>
          <p className="text-xs text-gray-500 mt-2">Today's earnings</p>
        </div>

        {/* Conversions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getChangeColor(metrics.conversionsChange)}`}>
              {getChangeIcon(metrics.conversionsChange)}
              {Math.abs(metrics.conversionsChange)}%
            </div>
          </div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Conversions</h4>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.conversions)}</p>
          <p className="text-xs text-gray-500 mt-2">Successful transactions</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Traffic Sources</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{source.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{formatNumber(source.users)} users</span>
                    <div className={`flex items-center gap-1 text-xs font-bold ${getChangeColor(source.change)}`}>
                      {getChangeIcon(source.change)}
                      {Math.abs(source.change)}%
                    </div>
                  </div>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${source.color}-500 to-${source.color}-600 rounded-full transition-all duration-500 group-hover:opacity-80`}
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{source.percentage}% of total traffic</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Device Breakdown</h3>
            <Monitor className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            {deviceStats.map((device) => (
              <div key={device.device} className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br from-${device.color}-500 to-${device.color}-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <device.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{device.device}</span>
                    <span className="text-sm text-gray-600">{device.percentage}%</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${device.color}-500 to-${device.color}-600 rounded-full`}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatNumber(device.users)} active users</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Top Pages (Real-time)</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Page Path</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Views</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Unique Users</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Avg Time</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, index) => (
                <tr key={page.path} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="font-mono text-sm text-gray-900 font-semibold">{page.path}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{formatNumber(page.views)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-700">{formatNumber(page.uniqueUsers)}</td>
                  <td className="py-4 px-4 text-right text-gray-600">{page.avgTime}</td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      page.bounceRate < 30 ? 'bg-green-100 text-green-700' :
                      page.bounceRate < 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {page.bounceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Geographic Distribution</h3>
          <Globe className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {geoData.map((country) => (
            <div key={country.country} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 transition-all">
              <div className="text-4xl mb-3 text-center">{country.flag}</div>
              <h4 className="font-bold text-gray-900 text-center mb-2">{country.country}</h4>
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(country.users)}</p>
                <p className="text-xs text-gray-500">users</p>
                <p className="text-sm font-semibold text-gray-700 mt-2">{formatCurrency(country.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
