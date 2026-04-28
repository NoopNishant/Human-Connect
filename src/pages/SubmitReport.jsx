import React, { useState, useEffect } from 'react';
import { Send, FileText, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { store, mockOrganizations, mockCategories, commonQuestionPool } from '../store';
import { useToast } from '../components/Toast';

const SubmitReport = () => {
  const toast = useToast();
  const [selectedOrg, setSelectedOrg] = useState(mockOrganizations[0].id);
  const [selectedCat, setSelectedCat] = useState(mockCategories[0].id);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load template when org/cat changes
  useEffect(() => {
    const currentState = store.getState();
    const template = currentState.templates.find(
      t => t.orgId === selectedOrg && t.categoryId === selectedCat
    );
    setActiveTemplate(template || null);
    setFormData({});
  }, [selectedOrg, selectedCat]);

  const handleInputChange = (qId, value) => {
    setFormData(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeTemplate) return;

    setIsSubmitting(true);
    
    const report = {
      templateId: activeTemplate.id,
      orgId: selectedOrg,
      categoryId: selectedCat,
      location,
      urgency,
      responses: formData
    };

    // Simulate network delay for UX
    setTimeout(() => {
      try {
        store.submitReport(report);
        toast.success('Report Transmitted', `Field data for ${location} has been routed to the dashboard.`);
        
        // Reset form
        setFormData({});
        setLocation('');
        setUrgency('medium');
      } catch (error) {
        toast.error('Transmission Failed', error.message);
      } finally {
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--secondary-color)', color: 'white', padding: '0.75rem', borderRadius: '14px' }}>
          <FileText size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Field Assessment</h1>
          <p className="text-muted">Transmit critical operational data to the command center.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Destination Organization</label>
            <select 
              className="form-select" 
              value={selectedOrg} 
              onChange={e => setSelectedOrg(e.target.value)}
            >
              {mockOrganizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assessment Domain</label>
            <select 
              className="form-select" 
              value={selectedCat} 
              onChange={e => setSelectedCat(e.target.value)}
            >
              {mockCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!activeTemplate ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">
            <AlertTriangle size={32} />
          </div>
          <h3>Protocol Not Defined</h3>
          <p className="text-muted">Selected organization has not configured a data collection template for this domain.</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => window.location.href='/templates'}>
            Initialize Template
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>{activeTemplate.name}</h3>
              <span className="badge badge-info">Active Operational Protocol</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Protocol ID: {activeTemplate.id}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div className="form-group">
              <label className="form-label">Tactical Location / Zone</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="e.g. Sector 7-G, East Corridor"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Mission Urgency</label>
              <select className="form-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
                <option value="low">Low - Routine Assessment</option>
                <option value="medium">Medium - Standard Response</option>
                <option value="high">High - Immediate Intervention</option>
              </select>
            </div>
          </div>

          <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Tactical Questionnaire <span className="badge badge-moderate" style={{ fontSize: '0.7rem' }}>Mandatory Fields</span>
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {commonQuestionPool.filter(q => activeTemplate.questions[q.id]).map(q => (
               <div key={q.id} className="form-group" style={{ 
                 backgroundColor: 'var(--surface-secondary)', 
                 padding: '1.25rem', 
                 borderRadius: '12px',
                 border: '1px solid var(--border-color)'
               }}>
                 <label className="form-label" style={{ fontWeight: 600 }}>{q.text}</label>
                 
                 {q.type === 'boolean' && (
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                     <label style={{ flex: 1 }}>
                       <input 
                         type="radio" 
                         name={q.id} 
                         required
                         style={{ display: 'none' }}
                         checked={formData[q.id] === 'yes'}
                         onChange={() => handleInputChange(q.id, 'yes')}
                       />
                       <div className={`btn btn-secondary ${formData[q.id] === 'yes' ? 'btn-primary' : ''}`} style={{ width: '100%', padding: '0.5rem' }}>
                         Yes
                       </div>
                     </label>
                     <label style={{ flex: 1 }}>
                       <input 
                         type="radio" 
                         name={q.id} 
                         required
                         style={{ display: 'none' }}
                         checked={formData[q.id] === 'no'}
                         onChange={() => handleInputChange(q.id, 'no')}
                       />
                       <div className={`btn btn-secondary ${formData[q.id] === 'no' ? 'btn-primary' : ''}`} style={{ width: '100%', padding: '0.5rem' }}>
                         No
                       </div>
                     </label>
                   </div>
                 )}

                 {q.type === 'number' && (
                   <input 
                     type="number" 
                     className="form-input" 
                     required
                     placeholder="Enter numeric value"
                     value={formData[q.id] || ''}
                     onChange={e => handleInputChange(q.id, e.target.value)}
                   />
                 )}

                 {q.type === 'select' && (
                   <select 
                     className="form-select" 
                     required
                     value={formData[q.id] || ''}
                     onChange={e => handleInputChange(q.id, e.target.value)}
                   >
                     <option value="" disabled>Select intelligence factor</option>
                     {q.options.map(opt => (
                       <option key={opt} value={opt}>{opt}</option>
                     ))}
                   </select>
                 )}
               </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button type="button" className="btn btn-secondary" onClick={() => setFormData({})}>
               Reset Form
             </button>
             <button type="submit" className={`btn btn-primary ${isSubmitting ? 'pulse' : ''}`} disabled={isSubmitting}>
               {isSubmitting ? 'Transmitting...' : <><Send size={18} /> Transmit Intelligence</>}
             </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SubmitReport;
