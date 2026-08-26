import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

function ComplaintForm({ onBack }) {
  const { token } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'civic',
    category: 'pothole',
    subcategory: '',
    description: '',
    urgency: 'low',
    location_mentioned: '',
    location_lat: null,
    location_lng: null,
    address_text: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + ' ' + currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setError('Microphone error: ' + event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Web Speech API is not supported in this browser. Please use manual mode.');
      setManualMode(true);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim().length > 0) {
        analyzeTranscript(transcript);
      }
    } else {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const analyzeTranscript = async (text) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:5000/api/complaints/voice-parse', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ transcript: text })
      });
      const data = await res.json();
      
      if (res.ok) {
        setFormData({
          ...formData,
          type: data.type || 'civic',
          category: data.category || 'other',
          description: data.description || text,
          urgency: data.urgency || 'medium',
          location_mentioned: data.location_mentioned || '',
        });
        setManualMode(true); // Open the form with pre-filled data
      } else {
        setError('Failed to analyze audio');
        setManualMode(true);
      }
    } catch (err) {
      console.error(err);
      setError('Network error during analysis');
      setManualMode(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        setRefNumber(data.reference_number);
      } else {
        setError(data.msg || 'Error submitting complaint');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg text-center animate-in zoom-in-95 duration-500 border border-slate-100 relative overflow-hidden">
        {/* Confetti-like background blob */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-green/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-brand-green to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-green/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Complaint Filed!</h2>
        <p className="text-slate-500 mb-8 font-medium">An SMS confirmation has been sent to your registered mobile number.</p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative group">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest block mb-2">Reference Number</span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black tracking-widest text-primary-700 font-mono">{refNumber}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(refNumber);
                // Simple visual feedback could be added here
              }}
              className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 flex items-center justify-center transition-colors group-hover:scale-110 active:scale-95"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              if (window.handleTrackNewComplaint) {
                 window.handleTrackNewComplaint(refNumber);
              }
            }}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            Track Status
          </button>
          <button 
            onClick={onBack} 
            className="w-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl relative overflow-hidden transition-all">
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">File a Complaint</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {!manualMode ? (
        <div className="flex flex-col items-center py-10">
          <button 
            onClick={toggleListening}
            className={`w-40 h-40 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-tr from-primary-600 to-primary-400'
            }`}
            disabled={isAnalyzing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
          </button>

          <div className="mt-10 min-h-[100px] w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
            {isAnalyzing ? (
              <div className="flex flex-col items-center text-primary-600">
                <svg className="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium animate-pulse">Analyzing with AI...</span>
              </div>
            ) : isListening ? (
              <p className="text-slate-800 text-lg font-medium">{transcript || "Listening..."}</p>
            ) : (
              <p className="text-slate-400">Tap the microphone and speak your problem in Hindi or English. Tap again to stop.</p>
            )}
          </div>

          <button 
            onClick={() => setManualMode(true)}
            className="mt-8 text-slate-500 hover:text-primary-600 font-medium underline-offset-4 hover:underline transition-all"
            disabled={isAnalyzing}
          >
            Or type it manually
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Track</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="civic">Civic (Municipal)</option>
                <option value="legal">Legal (Police)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="pothole">Pothole</option>
                <option value="streetlight">Streetlight</option>
                <option value="garbage">Garbage</option>
                <option value="water">Water Supply</option>
                <option value="theft">Theft</option>
                <option value="assault">Assault</option>
                <option value="lost_item">Lost Item</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location Mentioned (AI extracted)</label>
            <input 
              type="text"
              value={formData.location_mentioned}
              onChange={(e) => setFormData({...formData, location_mentioned: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
             <div className="mt-1 text-blue-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
             </div>
             <div className="text-sm text-blue-800">
               <p className="font-semibold mb-1">Location Tagging</p>
               <p className="text-blue-600/80">In a full implementation, a Google Map would appear here to let you pin the exact coordinates before submitting.</p>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl mt-4"
          >
            Submit Complaint
          </button>
        </form>
      )}
    </div>
  );
}

export default ComplaintForm;
