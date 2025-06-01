import React from 'react';
import {BarChart3} from "lucide-react";
import {MainLayout} from "../../widgets/layouts/main";

export const Dashboard: React.FC = () => {
    return (
        <MainLayout header={'Dashboard'}>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Welcome Back, John!</h1>
                <p className="text-stone-600">Here's what's happening with your dashboard today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total Users', value: '2,847', change: '+12%', color: 'text-green-600' },
                    { title: 'Revenue', value: '$45,231', change: '+8%', color: 'text-green-600' },
                    { title: 'Orders', value: '1,423', change: '-3%', color: 'text-red-600' },
                    { title: 'Growth', value: '23.5%', change: '+15%', color: 'text-green-600' },
                ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-stone-500">{stat.title}</h3>
                            <span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span>
                        </div>
                        <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-stone-200">
                    <h3 className="text-lg font-semibold text-stone-800 mb-4">Analytics Overview</h3>
                    <div className="h-64 bg-stone-50 rounded-md flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 size={48} className="text-stone-400 mx-auto mb-2" />
                            <p className="text-stone-500">Chart visualization would go here</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-stone-200">
                    <h3 className="text-lg font-semibold text-stone-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { user: 'Alice Johnson', action: 'Created new project', time: '2 hours ago' },
                            { user: 'Bob Smith', action: 'Updated profile', time: '4 hours ago' },
                            { user: 'Carol White', action: 'Completed task', time: '6 hours ago' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-stone-600">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-stone-800">{activity.user}</p>
                                    <p className="text-sm text-stone-600">{activity.action}</p>
                                    <p className="text-xs text-stone-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
};
