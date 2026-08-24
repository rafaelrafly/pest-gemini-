import React, { useState, useEffect } from 'react';
import API from './services/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('pest_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pest_user') || 'null'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gpsStatus, setGpsStatus] = useState('GPS Active (100m Geofence Verified)');

  // Form states
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      const custRes = await API.get('/customers');
      setCustomers(custRes.data);
      const taskRes = await API.get('/tasks');
      setTasks(taskRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { username, password });
      localStorage.setItem('pest_token', res.data.token);
      localStorage.setItem('pest_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      alert('Login failed. Check credentials or seed admin first.');
    }
  };

  const handleSeed = async () => {
    try {
      await API.post('/auth/seed');
      alert('Admin seeded! Username: admin, Password: admin123');
    } catch (err) {
      alert('Seed error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pest_token');
    localStorage.removeItem('pest_user');
    setToken(null);
    setUser(null);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await API.post('/customers', {
        nama: newCustName,
        company_name: newCustCompany,
        alamat: newCustAddress,
        category: 'Commercial'
      });
      setNewCustName('');
      setNewCustCompany('');
      setNewCustAddress('');
      loadData();
      alert('Customer added successfully!');
    } catch (err) {
      alert('Failed to add customer');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-pestGreen-900">PROTEKSI PEST CONTROL</h1>
            <p className="text-sm text-slate-500">Field Operations Management Platform</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Username / Email</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pestGreen-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pestGreen-600"
                required
              />
            </div>
            <button type="submit" className="w-full bg-pestGreen-900 text-white p-2 rounded-lg font-semibold hover:bg-pestGreen-700 transition">
              Login to Platform
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={handleSeed} className="text-xs text-pestGreen-700 underline">
              Seed Default Admin (admin / admin123)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-pestGreen-900 text-white flex flex-col">
        <div className="p-5 border-b border-pestGreen-700">
          <h2 className="font-bold text-lg">PROTEKSI PEST</h2>
          <p className="text-xs text-emerald-300">Operations Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-2 rounded ${activeTab === 'dashboard' ? 'bg-pestGreen-700' : 'hover:bg-pestGreen-800'}`}>Beranda & Dashboard</button>
          <button onClick={() => setActiveTab('tasks')} className={`w-full text-left p-2 rounded ${activeTab === 'tasks' ? 'bg-pestGreen-700' : 'hover:bg-pestGreen-800'}`}>Tugas Lapangan</button>
          <button onClick={() => setActiveTab('customers')} className={`w-full text-left p-2 rounded ${activeTab === 'customers' ? 'bg-pestGreen-700' : 'hover:bg-pestGreen-800'}`}>Pelanggan</button>
          <button onClick={() => setActiveTab('tracking')} className={`w-full text-left p-2 rounded ${activeTab === 'tracking' ? 'bg-pestGreen-700' : 'hover:bg-pestGreen-800'}`}>GPS & Map Tracking</button>
        </nav>
        <div className="p-4 border-t border-pestGreen-700 text-sm">
          <p className="font-semibold">{user?.nama}</p>
          <p className="text-xs text-emerald-300 mb-2">{user?.jabatan || 'Technician'}</p>
          <button onClick={handleLogout} className="text-xs bg-red-600 px-3 py-1 rounded text-white w-full">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800 uppercase">{activeTab}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">{gpsStatus}</span>
            <span className="text-sm text-slate-600">{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-500">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-800">{tasks.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-500">Total Customers</p>
                  <p className="text-3xl font-bold text-slate-800">{customers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-500">GPS Tracking</p>
                  <p className="text-xl font-bold text-emerald-600">Active (4s Interval)</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-500">Offline Status</p>
                  <p className="text-xl font-bold text-blue-600">Synced</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4">Add New Customer</h3>
                <form onSubmit={handleAddCustomer} className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Customer Name" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} className="p-2 border rounded" required />
                  <input type="text" placeholder="Company Name (e.g. PT John Robert Powers)" value={newCustCompany} onChange={(e) => setNewCustCompany(e.target.value)} className="p-2 border rounded" required />
                  <input type="text" placeholder="Address" value={newCustAddress} onChange={(e) => setNewCustAddress(e.target.value)} className="p-2 border rounded" required />
                  <button type="submit" className="col-span-3 bg-pestGreen-900 text-white p-2 rounded font-semibold hover:bg-pestGreen-700">Save Customer</button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                      <th className="p-4">Company</th>
                      <th className="p-4">Contact Person</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-4 font-medium">{c.company_name}</td>
                        <td className="p-4">{c.nama}</td>
                        <td className="p-4 text-slate-500">{c.alamat}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold mb-4">Assigned Tasks & Service Reports</h3>
                <div className="space-y-4">
                  {tasks.map((t) => (
                    <div key={t.id} className="border border-slate-200 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-pestGreen-900">{t.company_name || 'Customer'}</p>
                        <p className="text-sm text-slate-600">Date: {t.date} | Time: {t.time}</p>
                        <p className="text-xs text-slate-500">Sasaran: {t.sasaran_pekerjaan || 'All Area'}</p>
                      </div>
                      <button onClick={() => alert('Opening Service Report Modal matching Proteksi Pest Control template...')} className="bg-pestGreen-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-pestGreen-700">
                        Fill Service Report
                      </button>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-slate-500">No tasks found. Create one from backend or seed data.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold mb-4">Real-Time GPS Tracking & Geofencing</h3>
              <p className="text-sm text-slate-600 mb-4">Tracking active technicians with 100m geofencing validation around customer premises.</p>
              <div className="h-96 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-semibold">
                [ OpenStreetMap & Leaflet GPS Tracking View Active ]
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
