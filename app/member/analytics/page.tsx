'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  ArrowRight,
  Clock,
  Eye
} from 'lucide-react';

export default function AnalyticsOverviewPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const overviewMetrics = [
    {
      label: 'Total Revenue',
      value: 'Rp 125,340,000',
      change: '+23.5%',
      icon: DollarSign,
      color: 'blue',
      trend: 'up'
    },
    {
      label: 'Total Users',
      value: '12,847',
      change: '+15.2%',
      icon: Users,
      color: 'purple',
      trend: 'up'
    },
    {
      label: 'Active Users',
      value: '8,523',
      change: '+18.7%',
      icon: Activity,
      color: 'green',
      trend: 'up'
    },
    {
      label: 'Conversion Rate',
      value: '3.42%',
      change: '+5.3%',
      icon: TrendingUp,
      color: 'orange',
      trend: 'up'
    }
  ];

  const analyticsPages = [
    {
      title: 'Real-Time Analytics',
      description: 'Monitor live user activity, page views, and conversions as they happen',
      icon: Zap,
      href: '/member/analytics/realtime',
      color: 'from-green-500 to-emerald-600',
      badge: 'LIVE',
      badgeColor: 'bg-green-500',
      features: ['Live users', 'Active sessions', 'Real-time events']
    },
    {
      title: 'Traffic Analysis',
      description: 'Understand your traffic sources, user behavior, and acquisition channels',
      icon: BarChart3,
      href: '/member/analytics/traffic',
      color: 'from-blue-500 to-blue-600',
      badge: 'Popular',
      badgeColor: 'bg-blue-500',
      features: ['Traffic sources', 'User flow', 'Channel performance']
    },
    {
      title: 'Conversion Tracking',
      description: 'Track conversions, funnel performance, and goal completions',
      icon: TrendingUp,
      href: '/member/analytics/conversions',
      color: 'from-purple-500 to-purple-600',
      badge: 'Key Metrics',
      badgeColor: 'bg-purple-500',
      features: ['Conversion funnel', 'Goal tracking', 'ROI analysis']
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
          <p className="text-gray-600">
            Comprehensive insights into your business performance
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 rounded-xl flex items-center justify-center`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-600">
                <TrendingUp className="w-4 h-4" />
                {metric.change}
              </div>
            </div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
              {metric.label}
            </h4>
            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-2">vs previous period</p>
          </div>
        ))}
      </div>

      {/* Analytics Navigation Cards */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {analyticsPages.map((page, index) => (
            <Link
              key={index}
              href={page.href}
              className="group bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all overflow-hidden"
            >
              <div className={`h-32 bg-gradient-to-br ${page.color} p-6 relative overflow-hidden`}>
                <div className="absolute top-4 right-4">
                  <span className={`${page.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                    {page.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-6">
                  <page.icon className="w-12 h-12 text-white opacity-90" />
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <page.icon className="w-32 h-32 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {page.title}
                </h4>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {page.description}
                </p>
                <div className="space-y-2 mb-4">
                  {page.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Need Custom Analysis?</h3>
            <p className="text-blue-100">
              Generate custom reports tailored to your specific business needs
            </p>
          </div>
          <Link
            href="/member/reports/create"
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl transition-all flex items-center gap-2"
          >
            Create Custom Report
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {[
            { time: '2 minutes ago', event: 'New user signup from Jakarta', icon: Users, color: 'blue' },
            { time: '5 minutes ago', event: 'Revenue milestone reached: Rp 125M', icon: DollarSign, color: 'green' },
            { time: '12 minutes ago', event: 'Traffic spike detected (+45%)', icon: TrendingUp, color: 'purple' },
            { time: '23 minutes ago', event: 'Page view record: 3,842 views/hour', icon: Eye, color: 'orange' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 bg-gradient-to-br from-${activity.color}-500 to-${activity.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <activity.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{activity.event}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
