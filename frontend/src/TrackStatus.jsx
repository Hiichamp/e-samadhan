import React, { useState } from 'react';
import { API_URL } from './config';

function TrackStatus({ onBack, defaultRef = '' }) {
  const [refNumber, setRefNumber] = useState(defaultRef);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refNumber.trim()) return;
    
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch(`${API_URL}/api/status/${refNumber.trim()}`);
      const resData = await res.json();
      
      if (res.ok) {
        setData(resData);
      } else {
        setError(resData.msg || 'Complaint not found. Please check your reference number.');
      }
    } catch (err) {
      setError('Network error. Unable to track status.');
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: 'filed', title: 'Filed', desc: 'Complaint successfully registered in the system.' },
    { id: 'verified', title: 'Verified', desc: 'Gram Panchayat has reviewed and approved the issue.' },
    { id: 'in_progress', title: 'In Progress', desc: 'The Department has dispatched a team to your location.' },
    { id: 'resolved', title: 'Resolved', desc: 'Awaiting completion confirmation.' }
  ];
  
  const getStageIndex = (status) => stages.findIndex(s => s.id === status);

  return (
    <div className="w-full h-full flex flex-col md:max-w-md md:mx-auto">
      {/* Header */}
      <div className="flex items-center py-4 px-4 border-b border-slate-200 bg-white sticky top-0 z-20">
        <button onClick={onBack} className="text-primary-900 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-primary-900">Track Complaint</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {!data && (
          <form onSubmit={handleSearch} className="mb-6 animate-in fade-in duration-300">
            <label className="block text-sm font-bold text-slate-700 mb-2">Enter Reference Number</label>
            <div className="relative">
              <input 
                type="text" 
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
                placeholder="#GS-89241"
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-900 outline-none font-bold text-slate-800 shadow-sm"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-900 text-white rounded-lg font-bold hover:bg-primary-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
          </form>
        )}

        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            
            {/* Top Complaint Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4 mb-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-900 rounded-full flex items-center justify-center shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{data.complaint.description || 'Water Leakage in Main Pipe'}</h3>
                <p className="text-slate-500 text-sm font-medium mb-3">Complaint ID: #{data.complaint.reference_number}</p>
                <div className="inline-flex items-center gap-1.5 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                  <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
                  <span className="text-xs font-bold text-primary-900 capitalize">{data.complaint.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-6">Status Timeline</h3>

            {/* Timeline UI */}
            <div className="relative pl-4 mb-10">
              <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-slate-200 z-0"></div>
              
              <div className="flex flex-col gap-6 relative z-10">
                {stages.map((stageObj, idx) => {
                  const isCompleted = getStageIndex(data.complaint.status) > idx;
                  const isCurrent = getStageIndex(data.complaint.status) === idx;
                  const stageLog = data.logs.find(l => l.new_status === stageObj.id);
                  
                  return (
                    <div key={stageObj.id} className="flex gap-4 relative">
                      <div className="shrink-0 mt-1 z-10 bg-[#f4f7f8] py-1">
                        {isCompleted ? (
                           <div className="w-5 h-5 rounded-full bg-primary-900 text-white flex items-center justify-center ring-4 ring-[#f4f7f8]">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                           </div>
                        ) : isCurrent ? (
                           <div className="w-5 h-5 rounded-full border-2 border-primary-900 bg-white flex items-center justify-center ring-4 ring-[#f4f7f8]">
                             <div className="w-2 h-2 bg-primary-900 rounded-full"></div>
                           </div>
                        ) : (
                           <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white ring-4 ring-[#f4f7f8]"></div>
                        )}
                      </div>
                      
                      <div className={`flex-1 pb-2 ${isCurrent ? 'bg-primary-50 border border-primary-100 rounded-lg p-3 -mt-2' : ''}`}>
                        <h4 className={`font-bold ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                          {stageObj.title}
                        </h4>
                        <p className={`text-sm mt-1 leading-snug ${isCurrent || isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {stageObj.desc}
                        </p>
                        {isCurrent && (
                           <p className="text-xs font-bold text-primary-900 mt-2">Est. Completion: Today</p>
                        )}
                        {stageLog && !isCurrent && (
                          <p className="text-xs text-slate-500 font-medium mt-2">
                            {new Date(stageLog.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Contact Info */}
            <h3 className="text-lg font-bold text-slate-900 mb-4">Department Contact</h3>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden mb-6">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-900"></div>
              
              <div className="pl-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Assigned Department</span>
                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-3">
                  {data.complaint.department_name || 'Public Works Department (Water Supply)'}
                </h4>
                
                <div className="flex items-center gap-2 mb-4 text-slate-700 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span className="font-medium">Officer: <span className="font-bold">Shri Rajesh Kumar</span></span>
                </div>

                <button className="w-full bg-primary-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm shadow-md hover:bg-primary-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Call Department
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default TrackStatus;
