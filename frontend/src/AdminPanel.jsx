import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from './config';

function AdminPanel({ onBack }) {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'officer') {
      fetchComplaints();
    } else {
      setError('Access Denied. You must be an admin or officer.');
      setLoading(false);
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setComplaints(data);
      } else {
        setError(data.msg || 'Failed to load complaints.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !note) return;

    setUpdateLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus, note })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update local state
        setComplaints(complaints.map(c => 
          c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
        ));
        setSelectedComplaint(null);
        setNewStatus('');
        setNote('');
      } else {
        alert(data.msg || data.errors?.[0]?.msg || 'Error updating status');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setUpdateLoading(false);
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

  if (error) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-3xl relative text-center">
        <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{error}</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl relative overflow-hidden transition-all flex h-[80vh]">
      
      {/* Left List View */}
      <div className={`w-full ${selectedComplaint ? 'hidden md:flex md:w-1/3 border-r border-slate-200' : 'md:w-full'} flex-col`}>
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-4 sticky top-0">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-slate-500 py-10">Loading complaints...</p>
          ) : complaints.map(c => (
            <div 
              key={c.id} 
              onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); setNote(''); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedComplaint?.id === c.id 
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20' 
                  : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-bold text-primary-700">{c.reference_number}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 truncate">{c.description}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                <span className="capitalize">{c.type} • {c.category}</span>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail View */}
      {selectedComplaint && (
        <div className="w-full md:w-2/3 flex flex-col bg-slate-50 animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0">
            <h3 className="text-xl font-bold text-slate-800">Complaint Details</h3>
            <button onClick={() => setSelectedComplaint(null)} className="md:hidden text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 text-left">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-1">Ref Number</h4>
                  <p className="text-2xl font-mono font-bold text-primary-700">{selectedComplaint.reference_number}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-1">Citizen</h4>
                  <p className="font-semibold text-slate-800">{selectedComplaint.citizen_name || 'Nagrik User'}</p>
                  <p className="text-sm text-slate-500">{selectedComplaint.citizen_phone}</p>
                </div>
              </div>
              
              <div className="mb-6">
                 <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-2">Description / Transcript</h4>
                 <p className="text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 text-lg leading-relaxed">
                   {selectedComplaint.description}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                   <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-1">Type</h4>
                   <p className="font-semibold text-slate-800 capitalize">{selectedComplaint.type}</p>
                 </div>
                 <div>
                   <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-1">Category</h4>
                   <p className="font-semibold text-slate-800 capitalize">{selectedComplaint.category.replace('_', ' ')}</p>
                 </div>
                 <div>
                   <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-1">Location Mentioned</h4>
                   <p className="font-semibold text-slate-800">{selectedComplaint.location_mentioned || 'N/A'}</p>
                 </div>
                 <div>
                   <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-1">Cognizable (Legal)</h4>
                   <p className="font-semibold text-slate-800">{selectedComplaint.cognizable === true ? 'Yes' : selectedComplaint.cognizable === false ? 'No' : 'N/A'}</p>
                 </div>
              </div>

              {/* Mock Map View */}
              <div>
                <h4 className="text-sm text-slate-500 uppercase tracking-wider mb-2">Location Map</h4>
                <div className="w-full h-40 bg-slate-200 rounded-xl flex items-center justify-center border border-slate-300 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                   <div className="z-10 flex flex-col items-center">
                     <svg className="text-red-500 mb-1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                     <span className="text-sm font-semibold text-slate-700 bg-white/80 px-2 py-1 rounded backdrop-blur">
                       {selectedComplaint.location_lat && selectedComplaint.location_lng 
                         ? `${selectedComplaint.location_lat}, ${selectedComplaint.location_lng}` 
                         : 'Coordinates not provided'}
                     </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <form onSubmit={handleUpdateStatus} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="text-primary-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Update Status
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-semibold text-slate-700"
                >
                  <option value="filed">Filed</option>
                  <option value="verified">Verified</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Update Note (Sent to citizen)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="e.g. Officer dispatched to location..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={updateLoading || !note || newStatus === selectedComplaint.status}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading ? 'Saving...' : 'Save & Notify Citizen'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
