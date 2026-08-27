import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';

function PublicDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const resData = await res.json();
        
        if (res.ok) {
          setData(resData);
        } else {
          setError('Failed to load dashboard data.');
        }
      } catch (err) {
        setError('Network error. Unable to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/50 rounded-3xl w-full max-w-7xl animate-pulse p-4 md:p-8">
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2">
            <div className="h-10 bg-slate-200 rounded-lg w-3/4 mb-3"></div>
            <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="mt-6 md:mt-0 bg-white p-4 rounded-2xl w-full md:w-64 h-24 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
            <div className="w-full">
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-3xl h-[400px] border border-slate-100">
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="h-full bg-slate-100 rounded-xl"></div>
          </div>
          <div className="bg-white p-8 rounded-3xl h-[400px] border border-slate-100">
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="h-full bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500 py-10 bg-white rounded-3xl p-10 shadow-xl max-w-lg mx-auto">
        <p className="text-xl font-bold">{error}</p>
        <button onClick={onBack} className="mt-4 text-primary-600 font-semibold hover:underline">Return Home</button>
      </div>
    );
  }

  // Sort by lowest rate for the "Slowest Departments" leaderboard
  const slowestDepartments = [...data.resolutionRates].sort((a, b) => a.rate - b.rate).slice(0, 3);

  return (
    <div className="bg-white/50 rounded-3xl w-full max-w-7xl animate-in fade-in duration-500 relative">
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Transparency Dashboard</h2>
          <p className="text-slate-500 font-medium">Real-time civic accountability and resolution metrics.</p>
        </div>
        <div className="mt-6 md:mt-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
          </div>
          <div className="text-left">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total Complaints (30 Days)</p>
            <p className="text-3xl font-black text-slate-800">{data.totalComplaints}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Chart 1: Resolution Rate by Department */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="text-brand-green" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Department Resolution Rates
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.resolutionRates} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="department" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Resolution Rate']}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {data.resolutionRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate > 75 ? '#10b981' : entry.rate > 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints Over Time */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="text-primary-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Filing vs Resolution Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="filed" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Leaderboard: Slowest Departments */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 bg-red-50/50 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Attention Required: Most Overdue
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="pb-4 text-sm font-bold uppercase text-slate-400 border-b border-slate-100">Department</th>
                    <th className="pb-4 text-sm font-bold uppercase text-slate-400 border-b border-slate-100 text-center">Resolution Rate</th>
                    <th className="pb-4 text-sm font-bold uppercase text-slate-400 border-b border-slate-100 text-right">Pending Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {slowestDepartments.map((dept, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-4 border-b border-slate-50 text-slate-800 font-semibold group-hover:bg-slate-50 transition-colors rounded-l-xl px-2">{dept.department}</td>
                      <td className="py-4 border-b border-slate-50 text-center group-hover:bg-slate-50 transition-colors">
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                          {dept.rate}%
                        </span>
                      </td>
                      <td className="py-4 border-b border-slate-50 text-right text-slate-600 font-medium group-hover:bg-slate-50 transition-colors rounded-r-xl px-2">
                        {dept.pending} pending
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Averages List */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-lg border border-slate-700 p-8 text-white hover:shadow-xl transition-shadow relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
          
          <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
            <svg className="text-primary-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Avg Resolution Time
          </h3>
          <div className="space-y-5 relative z-10">
            {data.avgResolutionTime.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">{item.category}</span>
                <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg tabular-nums">
                  {item.days} <span className="text-xs text-slate-400">days</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PublicDashboard;
