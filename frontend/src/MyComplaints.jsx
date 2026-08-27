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

  const getStatusInfo = (status) => {
    switch(status) {
      case 'filed': return { color: 'bg-primary-50 text-primary-900 border-primary-200', dot: 'bg-brand-orange' };
      case 'verified': return { color: 'bg-primary-50 text-primary-900 border-primary-200', dot: 'bg-blue-500' };
      case 'in_progress': return { color: 'bg-primary-50 text-primary-900 border-primary-200', dot: 'bg-yellow-500' };
      case 'resolved': return { color: 'bg-brand-green/20 text-primary-900 border-brand-green/40', dot: 'bg-brand-green' };
      default: return { color: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:max-w-md md:mx-auto">
      {/* Header */}
      <div className="flex items-center py-4 px-4 border-b border-slate-200 bg-white sticky top-0 z-20">
        <button onClick={onBack} className="text-primary-900 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-primary-900">My Complaints</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-primary-50 text-primary-900 rounded-full flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
            </div>
            <p className="text-slate-500 font-medium text-lg">No complaints found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {complaints.map(complaint => {
              const statusInfo = getStatusInfo(complaint.status);
              return (
                <div 
                  key={complaint.id} 
                  onClick={() => onTrack(complaint.reference_number)}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                >
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-mono font-bold text-slate-500">#{complaint.reference_number}</p>
                     <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${statusInfo.color}`}>
                       <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></div>
                       <span className="text-[10px] font-bold uppercase tracking-wide">{complaint.status.replace('_', ' ')}</span>
                     </div>
                   </div>
                   
                   <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3 truncate">{complaint.description}</h3>
                   
                   <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                     <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Filed On</p>
                       <p className="text-sm text-slate-700 font-medium">{new Date(complaint.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="text-primary-900 bg-primary-50 p-2 rounded-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                     </div>
                   </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyComplaints;
