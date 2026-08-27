import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from './config';

/* ═══════════════════════════════════════════════════════
   CATEGORY DATA
═══════════════════════════════════════════════════════ */
const CIVIC_CATS = [
  { id: 'pothole',      icon: '🕳️', label: 'Pothole / Road',     desc: 'Damaged roads' },
  { id: 'streetlight',  icon: '💡', label: 'Streetlight',         desc: 'Broken / dark street' },
  { id: 'garbage',      icon: '🗑️', label: 'Garbage / Waste',    desc: 'Uncollected trash' },
  { id: 'water',        icon: '💧', label: 'Water Supply',        desc: 'No water / dirty' },
  { id: 'drainage',     icon: '🚿', label: 'Drainage / Sewage',  desc: 'Blocked drains' },
  { id: 'construction', icon: '🏗️', label: 'Encroachment',       desc: 'Illegal construction' },
  { id: 'tree',         icon: '🌳', label: 'Tree / Park',         desc: 'Fallen tree, park issue' },
  { id: 'other',        icon: '📋', label: 'Other',               desc: 'Any civic issue' },
];
const LEGAL_CATS = [
  { id: 'theft',        icon: '🔓', label: 'Theft / Burglary',   desc: 'Stolen property' },
  { id: 'assault',      icon: '⚠️', label: 'Assault / Violence',  desc: 'Physical attack' },
  { id: 'harassment',   icon: '🚫', label: 'Harassment',          desc: 'Verbal / online abuse' },
  { id: 'fraud',        icon: '💸', label: 'Fraud / Scam',        desc: 'Financial cheating' },
  { id: 'domestic',     icon: '🏠', label: 'Domestic Violence',   desc: 'Violence at home' },
  { id: 'lost_item',    icon: '🔍', label: 'Lost / Missing',      desc: 'Lost item or person' },
  { id: 'land',         icon: '📜', label: 'Land Dispute',        desc: 'Property encroachment' },
  { id: 'other',        icon: '📋', label: 'Other',               desc: 'Any legal matter' },
];
const ALL_CATS = [...CIVIC_CATS, ...LEGAL_CATS];

/* ═══════════════════════════════════════════════════════
   CATEGORY-SPECIFIC FIELD CONFIGS
═══════════════════════════════════════════════════════ */
const CATEGORY_FIELDS = {
  // ── CIVIC ──
  pothole: {
    title: 'Road / Pothole Details',
    hint: '📸 Photo helps department verify faster',
    hasPhoto: true,
    fields: [
      { key: 'road_name',    label: 'Road / Street Name',    type: 'text',   placeholder: 'e.g. Gandhi Road, Ward No. 5' },
      { key: 'pothole_size', label: 'Pothole Size',          type: 'select', options: ['Small (< 1ft)', 'Medium (1-3ft)', 'Large (3ft+)', 'Multiple potholes'] },
      { key: 'since_when',   label: 'Since How Long?',       type: 'select', options: ['Few days', '1-2 weeks', '1 month', 'More than 1 month'] },
      { key: 'accidents',    label: 'Any accident occurred?',type: 'select', options: ['No', 'Yes - vehicle damage', 'Yes - injury happened'] },
    ]
  },
  streetlight: {
    title: 'Streetlight Details',
    hasPhoto: true,
    fields: [
      { key: 'pole_number',  label: 'Pole Number (if visible)', type: 'text',   placeholder: 'e.g. SP-1024 (written on pole)' },
      { key: 'since_when',   label: 'Since How Long?',          type: 'select', options: ['Few days', '1-2 weeks', '1 month', 'More than 1 month'] },
      { key: 'area_dark',    label: 'How many lights affected?',type: 'select', options: ['Just 1 light', '2-5 lights', 'Entire street dark', 'Entire colony dark'] },
    ]
  },
  garbage: {
    title: 'Garbage / Waste Details',
    hasPhoto: true,
    fields: [
      { key: 'days_pending', label: 'Collection Pending Since', type: 'select', options: ['2-3 days', '1 week', '2 weeks', 'More than 2 weeks'] },
      { key: 'waste_type',   label: 'Type of Waste',            type: 'select', options: ['Household garbage', 'Construction debris', 'Dead animals', 'Mixed / open dump'] },
      { key: 'health_risk',  label: 'Health risk / smell?',     type: 'select', options: ['No major smell', 'Bad odor', 'Mosquito breeding', 'Major health hazard'] },
    ]
  },
  water: {
    title: 'Water Supply Issue Details',
    fields: [
      { key: 'no_water_days',label: 'No water since how long?', type: 'select', options: ['1 day', '2-3 days', '1 week', 'More than 1 week'] },
      { key: 'water_issue',  label: 'Type of issue',            type: 'select', options: ['No supply at all', 'Low pressure', 'Dirty / smelly water', 'Leaking pipe on road', 'Supply for very short time'] },
      { key: 'households',   label: 'How many households affected?', type: 'select', options: ['Just my house', '5-10 houses', 'Entire mohalla', 'Entire ward'] },
    ]
  },
  drainage: {
    title: 'Drainage / Sewage Details',
    hasPhoto: true,
    fields: [
      { key: 'drain_type',   label: 'Drainage Type',    type: 'select', options: ['Open drain / nala', 'Blocked gutter', 'Sewage overflow on road', 'Manhole overflowing'] },
      { key: 'flooding',     label: 'Water logging?',   type: 'select', options: ['No flooding', 'Occasional', 'Frequent flooding', 'Houses flooded'] },
      { key: 'smell',        label: 'Smell / Disease?', type: 'select', options: ['No major issue', 'Bad smell', 'Mosquitoes breeding', 'Illness reported nearby'] },
    ]
  },
  construction: {
    title: 'Encroachment Details',
    hasPhoto: true,
    fields: [
      { key: 'owner_name',   label: 'Owner / Builder Name (if known)', type: 'text',   placeholder: 'Leave blank if unknown' },
      { key: 'build_type',   label: 'Type of Encroachment',            type: 'select', options: ['On public road', 'On government land', 'Blocking footpath', 'Illegal extension of building', 'Temporary structure'] },
      { key: 'since_when',   label: 'Since How Long?',                 type: 'select', options: ['Few days', '1-2 weeks', '1 month', 'More than 1 month'] },
    ]
  },
  tree: {
    title: 'Tree / Park Issue Details',
    hasPhoto: true,
    fields: [
      { key: 'tree_issue',   label: 'Type of Issue',  type: 'select', options: ['Fallen tree blocking road', 'Dangerous leaning tree', 'Tree damaged property', 'Park not maintained', 'Broken park equipment'] },
    ]
  },

  // ── LEGAL ──
  theft: {
    title: '🔓 Theft / Burglary Details',
    hint: '⚠️ For major theft (₹10,000+), FIR is recommended',
    hasPhoto: true,
    fields: [
      { key: 'stolen_items', label: 'What was stolen?',         type: 'textarea', placeholder: 'e.g. Mobile phone (Samsung S23), Cash ₹5000, Gold chain...' },
      { key: 'total_value',  label: 'Estimated Total Value',    type: 'text',     placeholder: 'e.g. ₹15,000' },
      { key: 'theft_time',   label: 'Time of Theft (approx)',   type: 'time' },
      { key: 'theft_how',    label: 'How did theft happen?',    type: 'select',   options: ['Pocket picked', 'Snatched on road', 'House broken into', 'Vehicle theft', 'Theft at workplace', 'Online theft', 'Other'] },
      { key: 'suspect_desc', label: 'Suspect Description (if seen)', type: 'text', placeholder: 'e.g. Male, ~25 years, blue shirt, on bike' },
    ]
  },
  assault: {
    title: '⚠️ Assault / Violence Details',
    hint: '📸 Photo of injuries or scene helps significantly',
    hasPhoto: true,
    fields: [
      { key: 'assault_time', label: 'Time of Incident',          type: 'time' },
      { key: 'assault_type', label: 'Type of Assault',           type: 'select', options: ['Physical beating', 'Weapon used', 'Stabbing / shooting', 'Road rage', 'Group attack', 'Other'] },
      { key: 'injuries',     label: 'Injuries Sustained?',       type: 'select', options: ['No visible injury', 'Minor bruises', 'Significant injuries', 'Hospitalized', 'Life threatening'] },
      { key: 'assailants',   label: 'Number of Attackers',       type: 'select', options: ['1 person', '2-3 persons', '4-5 persons', 'Large group (5+)'] },
      { key: 'suspect_desc', label: 'Suspect Description',       type: 'text',   placeholder: 'Age, clothes, vehicle, name if known...' },
      { key: 'witness',      label: 'Witness Name(s)',           type: 'text',   placeholder: 'Leave blank if no witness' },
      { key: 'medical_done', label: 'Medical Treatment Taken?',  type: 'select', options: ['No', 'Yes - Primary health center', 'Yes - Private clinic', 'Yes - Government hospital', 'Yes - Private hospital'] },
    ]
  },
  harassment: {
    title: '🚫 Harassment Details',
    fields: [
      { key: 'harass_type',  label: 'Type of Harassment',        type: 'select', options: ['Verbal abuse / threats', 'Physical intimidation', 'Online / social media', 'Workplace harassment', 'Sexual harassment', 'Caste-based discrimination', 'Other'] },
      { key: 'since_when',   label: 'Since How Long?',           type: 'select', options: ['First time', 'Few days', 'Few weeks', 'Several months'] },
      { key: 'frequency',    label: 'Frequency',                 type: 'select', options: ['One-time incident', 'Happens occasionally', 'Regular / daily', 'Constant'] },
      { key: 'suspect_desc', label: 'Harasser Name / Description', type: 'text', placeholder: 'Name, relationship, contact if known' },
      { key: 'witness',      label: 'Witness(es)',               type: 'text',   placeholder: 'Names of people who witnessed it' },
    ]
  },
  fraud: {
    title: '💸 Fraud / Scam Details',
    hint: '💡 Save all transaction IDs and screenshots as evidence',
    fields: [
      { key: 'fraud_amount', label: 'Amount Involved',           type: 'text',   placeholder: 'e.g. ₹50,000' },
      { key: 'fraud_mode',   label: 'Mode of Fraud',             type: 'select', options: ['Cash payment', 'UPI / Online transfer', 'Cheque', 'Bank fraud', 'Fake job offer', 'Investment scheme', 'Land / property fraud', 'Other'] },
      { key: 'fraud_date',   label: 'Date of Fraud',             type: 'date' },
      { key: 'transaction',  label: 'Transaction ID / Reference',type: 'text',   placeholder: 'UPI ID, bank ref no., cheque no.' },
      { key: 'accused_name', label: 'Name of Fraudster',         type: 'text',   placeholder: 'Name, company name or phone number' },
    ]
  },
  domestic: {
    title: '🏠 Domestic Violence Details',
    hint: '🔒 Your information is kept confidential',
    fields: [
      { key: 'relationship', label: 'Relationship with Accused', type: 'select', options: ['Spouse / Partner', 'Parent', 'Sibling', 'In-laws', 'Relative', 'Other household member'] },
      { key: 'violence_type',label: 'Type of Violence',          type: 'select', options: ['Physical violence', 'Emotional / verbal abuse', 'Financial abuse', 'Sexual abuse', 'Multiple types'] },
      { key: 'children',     label: 'Are children involved?',    type: 'select', options: ['No', 'Yes - children witnessed', 'Yes - children also affected'] },
      { key: 'injuries',     label: 'Injuries / Medical needed?',type: 'select', options: ['No physical injury', 'Minor injuries', 'Requires medical attention', 'Already hospitalized'] },
      { key: 'safe_now',     label: 'Are you safe right now?',   type: 'select', options: ['Yes, I am safe', 'Somewhat unsafe', 'In immediate danger - URGENT'] },
    ]
  },
  lost_item: {
    title: '🔍 Lost / Missing Details',
    hasPhoto: true,
    fields: [
      { key: 'lost_what',    label: 'What is lost / missing?',   type: 'select', options: ['Mobile / Electronics', 'Wallet / Documents', 'Vehicle', 'Jewelry / Valuables', 'Missing Person (adult)', 'Missing Child', 'Pet animal', 'Other'] },
      { key: 'item_desc',    label: 'Description',               type: 'textarea', placeholder: 'Color, brand, IMEI (for mobile), physical features (for person)...' },
      { key: 'lost_where',   label: 'Last Known Location',       type: 'text',   placeholder: 'e.g. Bus stand, market, school...' },
      { key: 'lost_when',    label: 'Date / Time Last Seen',     type: 'datetime-local' },
    ]
  },
  land: {
    title: '📜 Land Dispute Details',
    hasPhoto: true,
    fields: [
      { key: 'land_type',    label: 'Type of Dispute',           type: 'select', options: ['Encroachment on my land', 'Boundary dispute', 'Illegal construction on my plot', 'Disputed ownership', 'Agricultural land dispute', 'Other'] },
      { key: 'land_area',    label: 'Land / Plot Details',       type: 'text',   placeholder: 'Survey no., khasra no., area in sq.ft.' },
      { key: 'opponent',     label: 'Other Party Name',          type: 'text',   placeholder: 'Name of person encroaching/disputing' },
      { key: 'since_when',   label: 'Dispute Since',             type: 'select', options: ['Few days', 'Weeks', 'Months', 'Years'] },
    ]
  },
  other: {
    title: '📋 Additional Details',
    hasPhoto: true,
    fields: []
  }
};

/* ═══════════════════════════════════════════════════════
   VOICE INSTRUCTIONS (category-wise)
═══════════════════════════════════════════════════════ */
const VOICE_INSTRUCTIONS = {
  default: {
    title: 'इस तरह बोलें',
    example: '"मेरे घर के पास MG Road पर एक बड़ा गड्ढा है जिससे 2 हफ्ते से लोगों को परेशानी हो रही है। यह बहुत जरूरी है।"',
    tips: [
      '📍 पहले अपनी जगह का नाम बताएं — गली, मोहल्ला, वार्ड',
      '🗣️ क्या हुआ है, साफ और आराम से बताएं',
      '⏰ कितने दिनों से समस्या है, यह भी बताएं',
      '🆘 अगर बहुत जरूरी है तो "बहुत जरूरी है" या "urgent है" बोलें',
    ]
  },
  theft: {
    title: 'चोरी की शिकायत ऐसे बोलें',
    example: '"आज सुबह 10 बजे MG Market में मेरा Samsung मोबाइल और ₹3000 नकद चोरी हो गए। चोर नीली टीशर्ट में था और बाइक पर था।"',
    tips: [
      '📱 क्या-क्या चोरी हुआ, नाम लेकर बताएं (मोबाइल, पैसे, सोना)',
      '💰 कितने रुपये का नुकसान हुआ, बताएं',
      '🕐 कब और कहाँ हुआ, ठीक से बताएं',
      '👤 चोर कैसा दिखता था — रंग, कपड़े, गाड़ी',
    ]
  },
  assault: {
    title: 'मारपीट की शिकायत ऐसे बोलें',
    example: '"कल रात 9 बजे रेलवे रोड पर 3 लड़कों ने मुझ पर हमला किया। मुझे चोट आई है। हमलावर लाल बाइक पर थे।"',
    tips: [
      '📍 घटना कहाँ हुई — सटीक जगह बताएं',
      '🕘 कितने बजे हुआ — समय जरूर बताएं',
      '👥 कितने लोगों ने हमला किया',
      '🤕 चोट कितनी गंभीर है — doctor गए या नहीं',
      '👤 हमलावर का हुलिया — कपड़े, उम्र, गाड़ी',
    ]
  },
  fraud: {
    title: 'धोखाधड़ी की शिकायत ऐसे बोलें',
    example: '"राजेश शर्मा नाम के व्यक्ति ने नौकरी दिलाने के नाम पर मुझसे ₹25,000 ले लिए और गायब हो गया। उसका नंबर 9876543210 है।"',
    tips: [
      '💰 कितना पैसा गया — exact amount बताएं',
      '👤 किसने किया — नाम, फोन नंबर अगर पता हो',
      '📅 कब हुआ — तारीख जरूर बताएं',
      '💳 पेमेंट कैसे किया — UPI, cash, cheque',
    ]
  },
  harassment: {
    title: 'उत्पीड़न की शिकायत ऐसे बोलें',
    example: '"पड़ोस में रहने वाला विकास पिछले 2 महीनों से मुझे धमकियाँ दे रहा है। आज उसने मेरे घर पर पत्थर फेंके।"',
    tips: [
      '👤 कौन परेशान कर रहा है — नाम या हुलिया',
      '📅 कब से हो रहा है — दिन, महीने',
      '🔁 कितनी बार हुआ — एक बार या बार-बार',
      '👀 कोई गवाह है तो उसका नाम बताएं',
    ]
  },
  water: {
    title: 'पानी की समस्या ऐसे बोलें',
    example: '"हमारे वार्ड 12 में पिछले 5 दिनों से पानी नहीं आ रहा। 50 से ज़्यादा घर प्रभावित हैं। पानी बहुत जरूरी है।"',
    tips: [
      '📍 अपना वार्ड नंबर या मोहल्ले का नाम बताएं',
      '📅 कितने दिनों से पानी नहीं आया',
      '🏠 कितने घर प्रभावित हैं',
      '🚱 पानी बिल्कुल नहीं या गंदा आ रहा है',
    ]
  },
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const cls = (...a) => a.filter(Boolean).join(' ');

const Spinner = ({ size = 5 }) => (
  <svg className={`animate-spin w-${size} h-${size}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   DYNAMIC CATEGORY FIELDS RENDERER
═══════════════════════════════════════════════════════ */
function CategoryFields({ category, extraData, setExtraData, photos, setPhotos }) {
  const config = CATEGORY_FIELDS[category] || CATEGORY_FIELDS['other'];
  
  const handlePhoto = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(prev => [...prev, { name: file.name, url: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  if (!config.fields.length && !config.hasPhoto) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 whitespace-nowrap">
          {config.title}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {config.hint && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
          {config.hint}
        </div>
      )}

      {config.fields.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {field.label}
            <span className="text-slate-400 font-normal ml-1 text-xs">(optional)</span>
          </label>

          {field.type === 'select' ? (
            <select
              value={extraData[field.key] || ''}
              onChange={e => setExtraData(p => ({ ...p, [field.key]: e.target.value }))}
              className="input-field"
            >
              <option value="">— Select —</option>
              {field.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={extraData[field.key] || ''}
              onChange={e => setExtraData(p => ({ ...p, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              rows={3}
              className="input-field resize-none text-sm"
            />
          ) : (
            <input
              type={field.type}
              value={extraData[field.key] || ''}
              onChange={e => setExtraData(p => ({ ...p, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="input-field"
            />
          )}
        </div>
      ))}

      {/* Photo Upload */}
      {config.hasPhoto && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            📸 Upload Photos / Evidence
            <span className="text-slate-400 font-normal ml-1 text-xs">(optional but helps)</span>
          </label>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-primary-400 hover:bg-primary-50 transition-all">
              <span className="text-3xl block mb-2">📷</span>
              <p className="text-sm font-semibold text-slate-600">Tap to upload photos</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, HEIC — Max 5MB each</p>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold hover:bg-red-600"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN FORM (Wizard)
═══════════════════════════════════════════════════════ */
const STEP_LABELS = { 1: 'Type', 2: 'Category', 3: 'Your Details', 4: 'Problem', 5: 'Review' };

function MainWizard({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: '', category: '', urgency: 'medium',
    description: '', location_mentioned: '', address_text: '',
    // complainant
    full_name: '', mobile: '', pincode: '',
    // legal extras
    cognizable: false, incident_date: '',
  });
  const [extraData, setExtraData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cats = form.type === 'civic' ? CIVIC_CATS : LEGAL_CATS;
  const selectedCat = ALL_CATS.find(c => c.id === form.category);

  // total steps: if legal → 5 else 5 (same, just legal step 4 has extra)
  const steps = [1, 2, 3, 4, 5];
  const idx = step - 1;

  const canNext = () => {
    if (step === 1) return !!form.type;
    if (step === 2) return !!form.category;
    if (step === 3) return form.full_name.trim().length > 1 && form.mobile.length === 10;
    if (step === 4) return form.description.trim().length > 10 && form.location_mentioned.trim().length > 2;
    return true;
  };

  const next = () => {
    if (!canNext()) { setError('Please fill in the required fields.'); return; }
    setError('');
    setStep(s => Math.min(s + 1, 5));
  };

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      const payload = {
        ...form,
        extra_details: extraData,
        photos: photos.map(p => p.url),
      };
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) onSuccess(data.reference_number, form);
      else setError(data.msg || 'Submission failed. Please try again.');
    } catch { setError('Network error. Check your connection.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span className="text-slate-500">Step {step} of 5</span>
          <span className="text-primary-700">{STEP_LABELS[step]}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-800 to-primary-500 rounded-full transition-all duration-500"
               style={{ width: `${(step / 5) * 100}%` }} />
        </div>
        <div className="flex gap-1 mt-2">
          {steps.map(s => (
            <div key={s} className={cls('flex-1 h-1.5 rounded-full transition-all',
              s < step ? 'bg-primary-700' : s === step ? 'bg-primary-400' : 'bg-slate-200')} />
          ))}
        </div>
      </div>

      {/* ── Step 1: Type ── */}
      {step === 1 && (
        <div>
          <div className="text-center mb-7">
            <span className="text-5xl">🏛️</span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">What kind of issue?</h2>
            <p className="text-slate-500 text-sm mt-1">Choose the type that best fits your problem</p>
          </div>
          <div className="space-y-4">
            {[
              { v: 'civic', icon: '🏙️', title: 'Civic Issue', sub: 'Municipal / Infrastructure', desc: 'Potholes, streetlights, water supply, garbage, drainage — problems handled by local bodies.', tags: ['Pothole','Streetlight','Water','Garbage'], border: 'border-primary-600 bg-primary-50', check: 'bg-primary-700' },
              { v: 'legal', icon: '⚖️', title: 'Legal Issue', sub: 'Police / Crime', desc: 'Theft, assault, fraud, harassment, domestic violence — handled by police.', tags: ['Theft','Assault','Fraud','Harassment'], border: 'border-red-400 bg-red-50', check: 'bg-red-500' },
            ].map(opt => (
              <button key={opt.v} type="button" onClick={() => { setForm(f => ({...f, type: opt.v, category: ''})); }}
                className={cls('w-full text-left p-5 rounded-2xl border-2 transition-all duration-200',
                  form.type === opt.v ? opt.border + ' shadow-md' : 'border-slate-200 bg-white hover:border-slate-300')}>
                <div className="flex items-start gap-4">
                  <div className={cls('w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0',
                    form.type === opt.v ? opt.check : 'bg-slate-100')}>{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-800">{opt.title}</h3>
                      <span className="text-xs text-slate-400">{opt.sub}</span>
                      {form.type === opt.v && <span className="ml-auto text-green-500">✓</span>}
                    </div>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{opt.desc}</p>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {opt.tags.map(t => <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{t}</span>)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Category ── */}
      {step === 2 && (
        <div>
          <div className="text-center mb-7">
            <span className="text-5xl">{form.type === 'civic' ? '🏙️' : '⚖️'}</span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Select Category</h2>
            <p className="text-slate-500 text-sm mt-1">What specifically is the issue?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cats.map(cat => (
              <button key={cat.id} type="button" onClick={() => setForm(f => ({...f, category: cat.id}))}
                className={cls('text-left p-4 rounded-2xl border-2 transition-all duration-150 flex flex-col gap-1',
                  form.category === cat.id
                    ? 'border-primary-700 bg-primary-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-primary-200')}>
                <span className="text-2xl">{cat.icon}</span>
                <p className={cls('font-bold text-sm leading-tight', form.category === cat.id ? 'text-primary-900' : 'text-slate-700')}>{cat.label}</p>
                <p className="text-[11px] text-slate-400">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Complainant Details ── */}
      {step === 3 && (
        <div>
          <div className="text-center mb-7">
            <span className="text-5xl">👤</span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Your Details</h2>
            <p className="text-slate-500 text-sm mt-1">Required for filing & SMS updates</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                placeholder="e.g. Ramesh Kumar" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">+91</span>
                <input type="tel" value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value.replace(/\D/,'').slice(0,10)}))}
                  placeholder="9876543210" className="input-field !pl-12" required maxLength={10} />
              </div>
              <p className="text-xs text-slate-400 mt-1">Reference number will be sent on this number</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">PIN Code <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="text" value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value.replace(/\D/,'').slice(0,6)}))}
                placeholder="e.g. 302001" className="input-field" maxLength={6} />
              <p className="text-xs text-slate-400 mt-1">Helps route complaint to correct department</p>
            </div>
          </div>

          <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">🔒 Your personal information is secure and will only be used for complaint processing.</p>
          </div>
        </div>
      )}

      {/* ── Step 4: Problem Details (dynamic) ── */}
      {step === 4 && (
        <div>
          <div className="text-center mb-7">
            <span className="text-5xl">📝</span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Describe the Problem</h2>
            <p className="text-slate-500 text-sm mt-1">
              {selectedCat ? `${selectedCat.icon} ${selectedCat.label}` : 'More detail = faster resolution'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Urgency */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Urgency Level <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'low',    e: '🟢', l: 'Low',    s: 'Can wait' },
                  { v: 'medium', e: '🟡', l: 'Medium', s: 'This week' },
                  { v: 'high',   e: '🔴', l: 'High',   s: 'Urgent!' },
                ].map(u => (
                  <button key={u.v} type="button" onClick={() => setForm(f => ({...f, urgency: u.v}))}
                    className={cls('p-3 rounded-xl border-2 text-center transition-all',
                      form.urgency === u.v ? 'border-primary-700 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
                    <span className="block text-xl mb-0.5">{u.e}</span>
                    <p className={cls('font-black text-sm', form.urgency === u.v ? 'text-primary-900' : 'text-slate-700')}>{u.l}</p>
                    <p className="text-[11px] text-slate-400">{u.s}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Describe the Problem <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                rows={4} placeholder="What happened? When? How is it affecting you? Be specific..."
                className="input-field resize-none text-sm leading-relaxed" required maxLength={1000} />
              <p className={cls('text-[11px] mt-1 text-right font-medium', form.description.length > 800 ? 'text-red-400' : 'text-slate-400')}>
                {form.description.length}/1000
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                📍 Location / Address <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.location_mentioned} onChange={e => setForm(f => ({...f, location_mentioned: e.target.value}))}
                placeholder="Street, area, ward no., mohalla..." className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nearest Landmark <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="text" value={form.address_text} onChange={e => setForm(f => ({...f, address_text: e.target.value}))}
                placeholder="e.g. 100m from the post office" className="input-field" />
            </div>

            {/* Legal: incident date + cognizable */}
            {form.type === 'legal' && (
              <div className="space-y-4 pt-2 border-t border-dashed border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Date of Incident <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="date" value={form.incident_date} onChange={e => setForm(f => ({...f, incident_date: e.target.value}))}
                    max={new Date().toISOString().split('T')[0]} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Is this a Cognizable Offence?</label>
                  <div className="space-y-2">
                    {[
                      { v: false, l: '📄 Non-Cognizable', d: 'Minor – police needs court permission (harassment, petty disputes)' },
                      { v: true,  l: '🚨 Cognizable',     d: 'Serious crime – police can arrest without warrant (assault, robbery, murder)' },
                    ].map(opt => (
                      <button key={String(opt.v)} type="button" onClick={() => setForm(f => ({...f, cognizable: opt.v}))}
                        className={cls('w-full text-left p-3.5 rounded-xl border-2 flex gap-3 items-start transition-all',
                          form.cognizable === opt.v
                            ? opt.v ? 'border-red-400 bg-red-50' : 'border-primary-600 bg-primary-50'
                            : 'border-slate-200 bg-white hover:border-slate-300')}>
                        <div className={cls('w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                          form.cognizable === opt.v ? (opt.v ? 'bg-red-500 border-red-500' : 'bg-primary-700 border-primary-700') : 'border-slate-300')}>
                          {form.cognizable === opt.v && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{opt.l}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.d}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category-specific extra fields */}
          <CategoryFields category={form.category} extraData={extraData} setExtraData={setExtraData} photos={photos} setPhotos={setPhotos} />
        </div>
      )}

      {/* ── Step 5: Review ── */}
      {step === 5 && (
        <div>
          <div className="text-center mb-7">
            <span className="text-5xl">✅</span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Review & Submit</h2>
            <p className="text-slate-500 text-sm mt-1">Verify all details before filing</p>
          </div>

          <div className="space-y-3">
            {/* Complainant */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide">👤 Complainant</p>
              </div>
              {[
                { l: 'Name',    v: form.full_name },
                { l: 'Mobile',  v: '+91 ' + form.mobile },
                { l: 'PIN',     v: form.pincode || '—' },
              ].map(r => (
                <div key={r.l} className="flex justify-between items-center px-4 py-3 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-400 w-20">{r.l}</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">{r.v}</span>
                </div>
              ))}
            </div>

            {/* Complaint */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide">📋 Complaint</p>
              </div>
              {[
                { l: 'Type',     v: form.type === 'civic' ? '🏙️ Civic' : '⚖️ Legal' },
                { l: 'Category', v: selectedCat ? `${selectedCat.icon} ${selectedCat.label}` : form.category },
                { l: 'Urgency',  v: form.urgency === 'high' ? '🔴 High' : form.urgency === 'medium' ? '🟡 Medium' : '🟢 Low' },
                { l: 'Location', v: form.location_mentioned },
              ].map(r => (
                <div key={r.l} className="flex justify-between items-center px-4 py-3 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-400 w-20">{r.l}</span>
                  <span className="text-sm font-semibold text-slate-800 text-right flex-1 pl-4">{r.v}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Description</p>
                <button type="button" onClick={() => setStep(4)} className="text-xs text-primary-600 font-bold hover:underline">Edit</button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{form.description}</p>
            </div>

            {/* Photos */}
            {photos.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wide mb-2">Photos ({photos.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((p, i) => (
                    <img key={i} src={p.url} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                  ))}
                </div>
              </div>
            )}

            {/* Extra details summary */}
            {Object.keys(extraData).filter(k => extraData[k]).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wide">📎 Additional Details</p>
                </div>
                {Object.entries(extraData).filter(([,v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center px-4 py-2.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400 font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-slate-700 text-right flex-1 pl-4 truncate">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">⚠️ {error}</div>}

            <button type="button" onClick={submit} disabled={submitting}
              className={cls('w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all mt-2',
                submitting ? 'bg-slate-200 text-slate-400' : 'bg-primary-900 text-white hover:bg-primary-800 shadow-xl shadow-primary-900/20 hover:-translate-y-0.5')}>
              {submitting ? <><Spinner size={5}/>Filing complaint...</> : <><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Complaint</>}
            </button>

            <p className="text-center text-xs text-slate-400 pb-2">🔒 Secure submission · SMS confirmation will be sent</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step < 5 && (
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
              className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
              ← Back
            </button>
          )}
          <button type="button" onClick={next}
            disabled={!canNext()}
            className={cls('flex-1 py-4 font-black rounded-2xl flex items-center justify-center gap-2 transition-all',
              canNext() ? 'bg-primary-900 text-white hover:bg-primary-800 shadow-lg hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
            Continue →
          </button>
        </div>
      )}

      {step < 5 && error && (
        <p className="text-red-500 text-sm font-medium text-center mt-3">⚠️ {error}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   VOICE MODE with Hindi Instructions
═══════════════════════════════════════════════════════ */
function VoiceMode({ selectedCategory, onSuccess }) {
  const [phase, setPhase] = useState('instructions'); // instructions | record | analyzing | review
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [form, setForm] = useState({ type: '', category: selectedCategory || '', description: '', urgency: 'medium', location_mentioned: '', full_name: '', mobile: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recRef = useRef(null);

  const instructions = VOICE_INSTRUCTIONS[selectedCategory] || VOICE_INSTRUCTIONS.default;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    recRef.current = new SR();
    recRef.current.continuous = true;
    recRef.current.interimResults = true;
    recRef.current.lang = 'hi-IN';
    recRef.current.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
    };
    recRef.current.onerror = (e) => { setListening(false); if (e.error !== 'no-speech') setError('Mic error: ' + e.error); };
    recRef.current.onend = () => setListening(false);
    return () => recRef.current?.stop();
  }, []);

  const toggle = () => {
    if (listening) { recRef.current?.stop(); setListening(false); }
    else { setTranscript(''); setError(''); recRef.current?.start(); setListening(true); }
  };

  const analyze = async () => {
    if (!transcript.trim()) { setError('Kuch nahi suna. Mic tap karke boliye.'); return; }
    setPhase('analyzing');
    try {
      const res = await fetch(`${API_URL}/api/complaints/voice-parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      setForm(f => ({
        ...f,
        type: data.type || 'civic',
        category: data.category || selectedCategory || 'other',
        description: data.description || transcript,
        urgency: data.urgency || 'medium',
        location_mentioned: data.location_mentioned || '',
      }));
    } catch { setForm(f => ({ ...f, description: transcript })); }
    setPhase('review');
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.mobile) { setError('Please fill your name and mobile number.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, voice_transcript: transcript }),
      });
      const data = await res.json();
      if (res.ok) onSuccess(data.reference_number, form);
      else setError(data.msg || 'Submission failed');
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  };

  /* Instructions Screen */
  if (phase === 'instructions') return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="text-5xl block mb-3">🎙️</span>
        <h2 className="text-2xl font-black text-slate-900">{instructions.title}</h2>
        <p className="text-slate-500 text-sm mt-1">पहले इन बातों को पढ़ें, फिर बोलें</p>
      </div>

      {/* Example script */}
      <div className="bg-primary-950 rounded-2xl p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-300 mb-3">✨ इस तरह बोल सकते हैं:</p>
        <p className="text-sm leading-relaxed text-white/90 italic font-medium">{instructions.example}</p>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-amber-800 font-black text-sm mb-3">📋 क्या-क्या बताएं:</p>
        <ul className="space-y-2.5">
          {instructions.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
              <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-black">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-slate-600 text-sm font-medium">
          💡 <strong>Hindi या English</strong> दोनों में बोल सकते हैं। AI दोनों समझता है।
        </p>
      </div>

      <button onClick={() => setPhase('record')}
        className="w-full py-4 bg-primary-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-800 shadow-lg text-base transition-all">
        🎙️ Recording शुरू करें →
      </button>
    </div>
  );

  /* Analyzing */
  if (phase === 'analyzing') return (
    <div className="flex flex-col items-center py-20 space-y-6 text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
        <Spinner size={8} />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900">AI analyze कर रहा है...</h3>
        <p className="text-slate-500 text-sm mt-1">आपकी बात से शिकायत तैयार हो रही है</p>
      </div>
      <div className="space-y-2 w-full max-w-xs text-left">
        {['भाषा पहचान रहे हैं...', 'शिकायत का प्रकार...', 'स्थान निकाल रहे हैं...', 'गंभीरता तय कर रहे हैं...'].map((s, i) => (
          <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 text-sm text-slate-600">
            <Spinner size={4} /> {s}
          </div>
        ))}
      </div>
    </div>
  );

  /* Record screen */
  if (phase === 'record') return (
    <div className="flex flex-col items-center space-y-6 py-4">
      <div className="text-center">
        <button onClick={() => setPhase('instructions')} className="text-xs text-primary-600 font-semibold hover:underline mb-3 block">
          ← वापस जाएं (instructions)
        </button>
        <h2 className="text-2xl font-black text-slate-900">अब बोलिए</h2>
        <p className="text-slate-500 text-sm mt-1">Microphone tap करें और बोलना शुरू करें</p>
      </div>

      <div className="relative flex items-center justify-center w-56 h-56">
        {listening && <>
          <span className="absolute inset-0 rounded-full bg-red-400/15 animate-ping" style={{animationDuration:'0.9s'}}/>
          <span className="absolute w-44 h-44 rounded-full bg-red-400/10 animate-ping" style={{animationDuration:'1.4s'}}/>
        </>}
        <button onClick={toggle}
          className={cls('relative w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1 text-white shadow-2xl z-10 transition-all duration-300',
            listening ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-primary-900 hover:bg-primary-800 hover:scale-105')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          <span className="text-[11px] font-bold">{listening ? 'Tap to Stop' : 'Tap to Speak'}</span>
        </button>
      </div>

      {listening && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full text-red-600 font-bold text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
          Recording हो रहा है...
        </div>
      )}

      {transcript && (
        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">आपने बोला:</p>
          <p className="text-slate-700 text-sm leading-relaxed italic">"{transcript}"</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

      {transcript && !listening && (
        <button onClick={analyze}
          className="w-full py-4 bg-primary-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-800 shadow-lg transition-all">
          ✨ AI से Analyze करें →
        </button>
      )}
    </div>
  );

  /* Review */
  if (phase === 'review') return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-primary-50 to-green-50 border border-primary-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">🤖</span>
        <div>
          <p className="font-black text-primary-900">AI ने form भर दिया है!</p>
          <p className="text-primary-600 text-xs mt-0.5">Check करें, edit करें, फिर submit करें</p>
          <button onClick={() => { setPhase('record'); setTranscript(''); }} className="text-xs text-primary-600 font-semibold hover:underline mt-1 block">
            🎤 फिर से record करें
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {transcript && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">आपने बोला था:</p>
            <p className="text-slate-600 text-sm italic">"{transcript}"</p>
          </div>
        )}

        {/* Quick fields */}
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'civic', l: '🏙️ Civic' },{ v: 'legal', l: '⚖️ Legal' }].map(t => (
            <button key={t.v} type="button" onClick={() => setForm(f => ({...f, type: t.v}))}
              className={cls('py-2.5 rounded-xl border-2 text-sm font-bold transition-all',
                form.type === t.v ? 'border-primary-700 bg-primary-50 text-primary-900' : 'border-slate-200 text-slate-500')}>
              {t.l}
            </button>
          ))}
        </div>

        <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-field">
          <option value="">Select Category</option>
          {(form.type === 'civic' ? CIVIC_CATS : LEGAL_CATS).map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2">
          {[['low','🟢'],['medium','🟡'],['high','🔴']].map(([v, e]) => (
            <button key={v} type="button" onClick={() => setForm(f => ({...f, urgency: v}))}
              className={cls('py-2.5 rounded-xl border-2 text-sm font-bold transition-all capitalize',
                form.urgency === v ? 'border-primary-700 bg-primary-50 text-primary-900' : 'border-slate-200 text-slate-500')}>
              {e} {v}
            </button>
          ))}
        </div>

        <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
          rows={4} className="input-field resize-none text-sm" placeholder="Description..." />

        <input type="text" value={form.location_mentioned} onChange={e => setForm(f => ({...f, location_mentioned: e.target.value}))}
          placeholder="📍 Location..." className="input-field" />

        <div className="border-t border-dashed border-slate-200 pt-3 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Your Details (required)</p>
          <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
            placeholder="Full Name *" className="input-field" />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">+91</span>
            <input type="tel" value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value.replace(/\D/,'').slice(0,10)}))}
              placeholder="Mobile Number *" className="input-field pl-12" />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}

        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 bg-primary-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 hover:bg-primary-800 transition-all">
          {submitting ? <><Spinner size={5}/> Submit हो रहा है...</> : '📤 Submit Complaint'}
        </button>
      </div>
    </div>
  );

  return null;
}

/* ═══════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════ */
function SuccessScreen({ refNumber, onTrack, onHome }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col items-center text-center py-4 space-y-6 max-w-md mx-auto">
      <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black text-slate-900">Complaint Filed!</h2>
        <p className="text-slate-500 mt-1">शिकायत सफलतापूर्वक दर्ज की गई ✅</p>
      </div>

      <div className="w-full bg-gradient-to-br from-primary-950 to-primary-800 rounded-2xl p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Reference Number / संदर्भ संख्या</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-black font-mono tracking-wider">#{refNumber}</span>
          <button onClick={() => { navigator.clipboard.writeText(refNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={cls('w-9 h-9 rounded-lg flex items-center justify-center transition-all', copied ? 'bg-green-400' : 'bg-white/20 hover:bg-white/30')}>
            {copied
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>}
          </button>
        </div>
        {copied && <p className="text-xs text-green-300 mt-1 font-medium">Copied!</p>}
        <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60 text-left space-y-1.5">
          <p>📱 SMS आपके mobile पर भेजा जाएगा</p>
          <p>📋 इस नंबर से complaint track करें</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button onClick={() => onTrack(refNumber)}
          className="w-full py-4 bg-primary-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-800 shadow-lg transition-all">
          🔍 Track Complaint
        </button>
        <button onClick={onHome}
          className="w-full py-4 border-2 border-primary-900 text-primary-900 font-black rounded-2xl hover:bg-primary-50 transition-all">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════ */
function ComplaintForm({ onBack }) {
  const [activeTab, setActiveTab] = useState('manual');
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const handleSuccess = (ref) => { setRefNumber(ref); setSubmitted(true); };

  if (submitted) return (
    <SuccessScreen
      refNumber={refNumber}
      onTrack={(ref) => { if (window.handleTrackNewComplaint) window.handleTrackNewComplaint(ref); }}
      onHome={onBack}
    />
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">File a Complaint</h1>
          <p className="text-xs text-slate-500">Choose your preferred method</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-2xl p-1.5 mb-8">
        {[
          { id: 'manual', icon: '✍️', label: 'Step-by-Step',  sub: 'Guided form — easy' },
          { id: 'voice',  icon: '🎙️', label: 'Voice Mode',   sub: 'Speak in Hindi / English' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cls('py-3 px-3 rounded-xl text-center transition-all duration-200',
              activeTab === tab.id ? 'bg-white shadow-md border border-slate-200' : 'hover:bg-white/50')}>
            <span className="text-xl block mb-0.5">{tab.icon}</span>
            <p className={cls('font-black text-sm', activeTab === tab.id ? 'text-primary-900' : 'text-slate-500')}>{tab.label}</p>
            <p className="text-[11px] text-slate-400">{tab.sub}</p>
          </button>
        ))}
      </div>

      {activeTab === 'manual'
        ? <MainWizard onSuccess={handleSuccess} />
        : <VoiceMode selectedCategory="" onSuccess={handleSuccess} />}
    </div>
  );
}

export default ComplaintForm;
