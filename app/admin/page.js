import AdminLayout from '@/components/AdminLayout';
import DashboardStats from '@/components/admin/DashboardStats';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <DashboardStats />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <DashboardCard 
            title="Products" 
            count={1} 
            link="/admin/products"
            icon="🛍️"
          />
          <DashboardCard 
            title="Parts" 
            count={5} 
            link="/admin/parts"
            icon="🔧"
          />
          <DashboardCard 
            title="Users" 
            count={7} 
            link="/admin/users"
            icon="👥"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ title, count, link, icon }) {
  return (
    <a href={link} className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </a>
  );
}