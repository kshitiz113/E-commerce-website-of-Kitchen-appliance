// components/admin/DashboardStats.js
export default function DashboardStats() {
  // In a real app, you would fetch these stats from your API
  const stats = [
    { name: 'Total Products', value: '124', change: '+12%', changeType: 'positive' },
    { name: 'Total Parts', value: '89', change: '+5%', changeType: 'positive' },
    { name: 'Active Users', value: '256', change: '-3%', changeType: 'negative' },
    { name: 'Pending Orders', value: '24', change: '+8%', changeType: 'positive' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                {/* Icon would go here */}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}