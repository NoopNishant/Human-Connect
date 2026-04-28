import React, { useState, useEffect } from 'react';
import { Users, UserCheck, MapPin, Activity, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { store, mockCategories } from '../store';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Volunteers = () => {
  const toast = useToast();
  const [volunteers, setVolunteers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVol, setEditingVol] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  
  const [formData, setFormData] = useState({ name: '', location: '', skills: '' });

  useEffect(() => {
    const updateState = () => {
      const state = store.getState();
      setVolunteers(state.volunteers);
      setReports(state.reports.filter(r => r.status === 'open'));
    };
    
    updateState();
    const unsubscribe = store.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const volData = {
      ...formData,
      id: editingVol ? editingVol.id : undefined,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      active: editingVol ? editingVol.active : true
    };
    
    try {
      store.saveVolunteer(volData);
      toast.success(editingVol ? 'Volunteer Updated' : 'Volunteer Added', `${volData.name} has been saved to the roster.`);
      resetForm();
    } catch (error) {
      toast.error('Registration Failed', error.message);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingVol(null);
    setFormData({ name: '', location: '', skills: '' });
  };

  const handleEdit = (vol) => {
    setEditingVol(vol);
    setFormData({ name: vol.name, location: vol.location, skills: vol.skills.join(', ') });
    setIsAdding(true);
  };

  const handleDelete = () => {
    try {
      store.deleteVolunteer(deleteModal.id);
      toast.error('Volunteer Removed', 'The volunteer record has been deleted.');
    } catch (error) {
      toast.error('Deletion Failed', error.message);
    }
    setDeleteModal({ open: false, id: null });
    if (selectedVolunteer?.id === deleteModal.id) setSelectedVolunteer(null);
  };

  const handleToggleStatus = (id) => {
    try {
      store.toggleVolunteerStatus(id);
      toast.info('Status Updated', 'Volunteer availability has been toggled.');
    } catch (error) {
      toast.error('Update Failed', error.message);
    }
  };

  // Smart Matching Logic
  const getMatchesForVolunteer = (volunteer) => {
    return reports.map(report => {
      let score = 0;
      let reasons = [];

      if (report.location.toLowerCase().includes(volunteer.location.toLowerCase()) || 
          volunteer.location.toLowerCase().includes(report.location.toLowerCase())) {
        score += 50;
        reasons.push('Location Proximity');
      }

      const cat = mockCategories.find(c => c.id === report.categoryId);
      if (cat) {
        const needsMedical = cat.name.includes('Medical');
        const needsLabor = cat.name.includes('Rescue') || cat.name.includes('Logistics');
        
        if (needsMedical && volunteer.skills.some(s => s.toLowerCase().includes('medical'))) {
          score += 40;
          reasons.push('Medical Expertise');
        }
        if (needsLabor && volunteer.skills.some(s => s.toLowerCase().includes('labor') || s.toLowerCase().includes('logistics'))) {
          score += 40;
          reasons.push('Logistical Skill Match');
        }
      }

      if (report.urgency === 'high') {
        score += 20;
        reasons.push('Critical Need Priority');
      }

      return { report, score, reasons };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--text-light)', color: 'white', padding: '0.75rem', borderRadius: '14px' }}>
            <Users size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Volunteer Command</h1>
            <p className="text-muted">Smart dispatch and personnel management system.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Register Volunteer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Volunteer Roster */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} className="text-primary" /> Active Personnel
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {volunteers.map(vol => (
              <div 
                key={vol.id}
                className={`volunteer-card ${selectedVolunteer?.id === vol.id ? 'selected' : ''}`}
                onClick={() => setSelectedVolunteer(vol)}
              >
                <div className="flex-between">
                  <strong style={{ fontSize: '1.05rem' }}>{vol.name}</strong>
                  <button 
                    className={`btn-ghost btn-sm ${vol.active ? 'text-success' : 'text-light'}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(vol.id); }}
                    title={vol.active ? 'Available' : 'Unavailable'}
                  >
                    {vol.active ? <Check size={16} /> : <X size={16} />}
                  </button>
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} className="text-primary" /> {vol.location}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {vol.skills.map(skill => (
                    <span key={skill} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="vol-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(vol)} title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon text-danger" onClick={() => setDeleteModal({ open: true, id: vol.id })} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Smart Matches */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} className="text-primary" /> Tactical Dispatch Matching
          </h3>

          {!selectedVolunteer ? (
            <div className="empty-state" style={{ background: 'var(--surface-secondary)', borderRadius: '12px' }}>
              <div className="empty-state-icon">
                <Users size={32} />
              </div>
              <h3>Select a Volunteer</h3>
              <p className="text-muted">Select personnel from the roster to view optimized field assignments.</p>
            </div>
          ) : (
            <div>
              <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{selectedVolunteer.name}</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  Based on {selectedVolunteer.skills.length} skills and location "{selectedVolunteer.location}", 
                  we've identified the following high-impact tasks.
                </p>
              </div>

              {reports.length === 0 ? (
                 <div className="empty-state">
                   <h3>No active tasks</h3>
                   <p className="text-muted">All field reports are currently resolved or pending assessment.</p>
                 </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {getMatchesForVolunteer(selectedVolunteer).map((match, idx) => (
                    <div key={match.report.id} className="glass-panel" style={{
                      padding: '1.5rem',
                      borderLeft: idx === 0 ? '4px solid var(--primary-color)' : '1px solid var(--border-color)',
                    }}>
                      <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', display: 'block' }}>Field Task @ {match.report.location}</strong>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span className={`badge ${match.report.urgency === 'high' ? 'badge-critical' : 'badge-moderate'}`}>
                              {match.report.urgency.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            {match.score}%
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>MATCH SCORE</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {match.reasons.map(reason => (
                          <span key={reason} className="badge badge-low" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Check size={12} /> {reason}
                          </span>
                        ))}
                      </div>

                      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => toast.success('Dispatch Initialized', `Volunteer ${selectedVolunteer.name} has been notified.`)}>
                        Dispatch to Location
                      </button>
                    </div>
                  ))}
                  
                  {getMatchesForVolunteer(selectedVolunteer).length === 0 && (
                    <div className="empty-state">
                      <p className="text-muted">No high-relevance matches found for current location/skills.</p>
                      <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>View All Proximate Tasks</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-panel animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingVol ? 'Edit Volunteer' : 'Register New Volunteer'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Location / Zone</label>
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <input 
                  required
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Medical, Logistics, Rescue"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Volunteer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Remove Volunteer?"
        message="This will permanently delete this volunteer record from the roster. Historical dispatch data will be preserved."
      />
    </div>
  );
};

export default Volunteers;
