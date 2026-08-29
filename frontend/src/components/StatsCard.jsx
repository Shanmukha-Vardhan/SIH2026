import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  const bgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-start">
      <div className={`p-3 rounded-full ${bgClass} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
