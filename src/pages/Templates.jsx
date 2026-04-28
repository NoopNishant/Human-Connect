import React, { useState, useEffect } from 'react';
import { Layers, Plus, Save, CheckCircle, Trash2, Settings, AlertCircle } from 'lucide-react';
import { store, mockOrganizations, mockCategories, commonQuestionPool } from '../store';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Templates = () => {
  const toast = useToast();
  const [selectedOrg, setSelectedOrg] = useState(mockOrganizations[0].id);
  const [selectedCat, setSelectedCat] = useState(mockCategories[0].id);
  const [templateName, setTemplateName] = useState('');
  const [activeQuestions, setActiveQuestions] = useState(
    commonQuestionPool.reduce((acc, q) => ({ ...acc, [q.id]: false }), {})
  );
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  // Check if a template already exists for this org+cat
  useEffect(() => {
    const currentState = store.getState();
    const existing = currentState.templates.find(
      t => t.orgId === selectedOrg && t.categoryId === selectedCat
    );
    
    if (existing) {
      setTemplateName(existing.name);
      setActiveQuestions(existing.questions);
      setActiveTemplateId(existing.id);
    } else {
      setTemplateName('');
      setActiveQuestions(commonQuestionPool.reduce((acc, q) => ({ ...acc, [q.id]: false }), {}));
      setActiveTemplateId(null);
    }
  }, [selectedOrg, selectedCat]);

  const handleToggle = (qId) => {
    setActiveQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Title Required', 'Please provide a name for this template.');
      return;
    }
    
    const templateData = {
      id: activeTemplateId || undefined,
      orgId: selectedOrg,
      categoryId: selectedCat,
      name: templateName,
      questions: activeQuestions,
      updatedAt: new Date().toISOString()
    };

    try {
      store.saveTemplate(templateData);
      toast.success('Template Saved', `"${templateName}" has been synchronized.`);
    } catch (error) {
      toast.error('Builder Error', error.message);
    }
  };

  const handleDelete = () => {
    store.deleteTemplate(activeTemplateId);
    toast.error('Template Deleted', 'The organization template has been removed.');
    setDeleteModal({ open: false, id: null });
    setTemplateName('');
    setActiveQuestions(commonQuestionPool.reduce((acc, q) => ({ ...acc, [q.id]: false }), {}));
    setActiveTemplateId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.75rem', borderRadius: '14px' }}>
            <Layers size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Template Builder</h1>
            <p className="text-muted">Standardize data collection protocols across your NGO network.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTemplateId && (
            <button className="btn btn-secondary text-danger" onClick={() => setDeleteModal({ open: true, id: activeTemplateId })}>
              <Trash2 size={18} /> Delete
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} /> Save Protocol
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Organization & Category Selection */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings size={20} className="text-primary" /> Configuration
          </h3>
          
          <div className="form-group">
            <label className="form-label">Managing Organization</label>
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

          <div className="form-group">
            <label className="form-label">Emergency Category</label>
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
          
          <div className="form-group" style={{ marginTop: '2.5rem' }}>
            <label className="form-label">Template Display Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Rapid Damage Assessment"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
            />
          </div>

          {activeTemplateId && (
            <div style={{ marginTop: '2rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', gap: '0.75rem' }}>
              <CheckCircle size={20} className="text-success" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ display: 'block' }}>Active Protocol</strong>
                <span className="text-muted">This template is currently live for field agents.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Toggle Common Questions */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Tactical Questionnaire Pool</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Select high-impact questions to include in this rapid-response form.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {commonQuestionPool.map(q => {
              const isActive = activeQuestions[q.id];
              return (
                <div 
                  key={q.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: `1px solid ${isActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    backgroundColor: isActive ? 'rgba(79, 70, 229, 0.05)' : 'var(--surface-primary)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleToggle(q.id)}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '6px', 
                      border: `2px solid ${isActive ? 'var(--primary-color)' : 'var(--border-hover)'}`,
                      backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isActive && <CheckCircle size={14} color="white" />}
                    </div>
                    <div>
                      <strong style={{ color: isActive ? 'var(--primary-color)' : 'var(--text-dark)' }}>{q.text}</strong>
                      <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Data Structure: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{q.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`filter-chip ${isActive ? 'active' : ''}`} style={{ margin: 0 }}>
                    {isActive ? 'Included' : 'Exclude'}
                  </div>
                </div>
              );
            })}
            
            <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
               <button className="btn btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => toast.info('Feature Coming Soon', 'Custom question builder is in development.')}>
                 <Plus size={18} /> Define Custom Attribute
               </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Template?"
        message="Agents will no longer be able to submit reports using this protocol. Existing reports will remain intact."
      />
    </div>
  );
};

export default Templates;
