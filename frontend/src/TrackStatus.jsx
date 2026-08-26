import React, { useState } from 'react';

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
      const res = await fetch(`http://localhost:5000/api/status/${refNumber.trim()}`);
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

  const stages = ['filed', 'verified', 'in_progress', 'resolved'];
  
  const getStageIndex = (status) => stages.indexOf(status);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-3xl relative overflow-hidden transition-all">
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Track Your Complaint</h2>

      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-10">
        <div className="relative">
          <input 
            type="text" 
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
            placeholder="Enter Reference Number (e.g. NGT2026123456)"
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary-500 outline-none text-center font-mono tracking-wider font-semibold uppercase text-slate-700 shadow-inner"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </form>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 inline-block">
                {data.complaint.type} • {data.complaint.category}
              </span>
              <h3 className="text-xl font-bold text-slate-800">{data.complaint.description}</h3>
            </div>
            
            <div className="bg-brand-green/10 border border-brand-green/20 px-4 py-3 rounded-xl text-brand-green text-sm flex items-center gap-2 min-w-max">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <div>
                <span className="font-semibold block">Estimated Resolution</span>
                <span>{new Date(data.estimated_resolution_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Timeline UI */}
          <div className="relative pl-8 md:pl-0 mb-10">
            {/* Desktop Line */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-1 bg-slate-100 z-0 rounded-full"></div>
            
            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
              {stages.map((stage, idx) => {
                const isCompleted = getStageIndex(data.complaint.status) >= idx;
                const isCurrent = getStageIndex(data.complaint.status) === idx;
                
                // Find log for this stage
                const stageLog = data.logs.find(l => l.new_status === stage);
                
                return (
                  <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center w-full relative">
                    {/* Mobile vertical line connecting nodes */}
                    {idx < stages.length - 1 && (
                      <div className={`md:hidden absolute left-6 top-10 bottom-[-2rem] w-0.5 ${getStageIndex(data.complaint.status) > idx ? 'bg-brand-green' : 'bg-slate-100'}`}></div>
                    )}
                    
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-[3px] shadow-sm z-10 bg-white transition-all duration-300 ${
                      isCompleted 
                        ? 'border-brand-green text-brand-green scale-110' 
                        : 'border-slate-200 text-slate-300'
                    } ${isCurrent ? 'ring-4 ring-brand-green/20' : ''}`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`font-bold capitalize mb-1 ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        {stage.replace('_', ' ')}
                      </h4>
                      {stageLog ? (
                        <>
                          <p className="text-xs text-slate-500 font-medium">{new Date(stageLog.timestamp).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(stageLog.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-300 font-medium">Pending</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Contact Info */}
          {data.complaint.department_name && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <svg className="text-primary-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
                  Assigned To
                </h4>
                <p className="text-slate-600">{data.complaint.department_name}</p>
              </div>
              
              {data.complaint.department_contact && (
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                    <svg className="text-primary-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    {data.complaint.department_contact}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default TrackStatus;
