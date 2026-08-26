import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function MyComplaints({ onBack, onTrack }) {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setComplaints(data);
      } else {
        setError('Failed to load complaints.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'filed': return 'bg-blue-100 text-blue-700';
      case 'verified': return 'bg-purple-100 text-purple-700';
      case 'in_progress': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-brand-green/20 text-brand-green';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-5xl relative overflow-hidden transition-all">
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">My Complaints</h2>
      <p className="text-center text-slate-500 mb-8 font-medium">History of all complaints registered by {user?.name}</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
          </div>
          <p className="text-slate-500 text-lg">You haven't registered any complaints yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {complaints.map(complaint => (
            <div key={complaint.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-shadow relative group">
               <div className="absolute top-6 right-6">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                   {complaint.status.replace('_', ' ')}
                 </span>
               </div>
               
               <p className="text-sm font-mono font-bold text-primary-600 mb-1">{complaint.reference_number}</p>
               <h3 className="text-lg font-bold text-slate-800 mb-2 truncate pr-20">{complaint.description}</h3>
               
               <div className="flex gap-2 mb-4">
                 <span className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-xs font-semibold capitalize">{complaint.type}</span>
                 <span className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-xs font-semibold capitalize">{complaint.category.replace('_', ' ')}</span>
               </div>

               <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
                 <div>
                   <p className="text-xs text-slate-400 font-medium">Filed On</p>
                   <p className="text-sm text-slate-600 font-semibold">{new Date(complaint.created_at).toLocaleDateString()}</p>
                 </div>
                 <button 
                   onClick={() => onTrack(complaint.reference_number)}
                   className="text-sm text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1 group-hover:underline"
                 >
                   Track Details
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
