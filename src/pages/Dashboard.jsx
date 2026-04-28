import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, AlertCircle, MapPin, Clock, Search, Filter, Download, CheckCircle, Trash2, ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';
import { store, mockOrganizations, mockCategories, commonQuestionPool } from '../store';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard = () => {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [expandedReport, setExpandedReport] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  
  // Sync with store
  useEffect(() => {
    const updateState = () => {
      setReports([...store.getState().reports].reverse());
    };
    
    updateState(); // Initial load
    const unsubscribe = store.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const org = mockOrganizations.find(o => o.id === report.orgId)?.name || '';
      const cat = mockCategories.find(c => c.id === report.categoryId)?.name || '';
      const matchesSearch = 
        org.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUrgency = filterUrgency === 'all' || report.urgency === filterUrgency;
      
      return matchesSearch && matchesUrgency;
    });
  }, [reports, searchTerm, filterUrgency]);

  const handleResolve = (id) => {
    store.resolveReport(id);
    toast.success('Report Resolved', 'The report has been marked as resolved.');
  };

  const handleDelete = () => {
    store.deleteReport(deleteModal.id);
    toast.error('Report Deleted', 'The report has been permanently removed.');
    setDeleteModal({ open: false, id: null });
  };

  const handleExport = () => {
    store.exportReportsCSV();
    toast.info('Export Started', 'Your report data is being exported to CSV.');
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high': return <span className="badge badge-critical">CRITICAL</span>;
      case 'medium': return <span className="badge badge-moderate">MODERATE</span>;
      case 'low': return <span className="badge badge-low">LOW</span>;
      default: return null;
    }
  };

  // Stats
  const criticalCount = reports.filter(r => r.urgency === 'high' && r.status === 'open').length;
  const openCount = reports.filter(r => r.status === 'open').length;
  
  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.75rem', borderRadius: '14px' }}>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Action Center</h1>
            <p className="text-muted">Real-time humanitarian intelligence and field operations.</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <Download size={18} /> Export Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel stat-card">
           <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)' }}>
             <FileText size={28} />
           </div>
           <div>
             <h2 className="stat-value count-animate">{openCount}</h2>
             <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Active Reports</p>
           </div>
        </div>
        
        <div className="glass-panel stat-card">
           <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
             <AlertCircle size={28} />
           </div>
           <div>
             <h2 className="stat-value count-animate">{criticalCount}</h2>
             <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Critical Needs</p>
           </div>
        </div>
        
        <div className="glass-panel stat-card">
           <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)' }}>
             <MapPin size={28} />
           </div>
           <div>
             <h2 className="stat-value count-animate">{new Set(reports.map(r => r.location)).size}</h2>
             <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Operational Zones</p>
           </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by location, category or organization..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <span 
            className={`filter-chip ${filterUrgency === 'all' ? 'active' : ''}`}
            onClick={() => setFilterUrgency('all')}
          >
            All
          </span>
          <span 
            className={`filter-chip ${filterUrgency === 'high' ? 'active' : ''}`}
            onClick={() => setFilterUrgency('high')}
          >
            High
          </span>
          <span 
            className={`filter-chip ${filterUrgency === 'medium' ? 'active' : ''}`}
            onClick={() => setFilterUrgency('medium')}
          >
            Medium
          </span>
          <span 
            className={`filter-chip ${filterUrgency === 'low' ? 'active' : ''}`}
            onClick={() => setFilterUrgency('low')}
          >
            Low
          </span>
        </div>
      </div>

      <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Latest Intelligence <span className="badge badge-info">{filteredReports.length} results</span>
      </h3>
      
      {filteredReports.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">
            <Search size={32} />
          </div>
          <h3>No reports found</h3>
          <p className="text-muted">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReports.map((report, idx) => {
            const org = mockOrganizations.find(o => o.id === report.orgId);
            const cat = mockCategories.find(c => c.id === report.categoryId);
            const isExpanded = expandedReport === report.id;
            const isResolved = report.status === 'resolved';
            
            return (
              <div 
                key={report.id} 
                className={`glass-panel report-card ${isExpanded ? 'report-card-expanded' : ''}`} 
                style={{ padding: '1.5rem', opacity: isResolved ? 0.7 : 1, transition: 'all 0.3s ease' }}
                onClick={() => setExpandedReport(isExpanded ? null : report.id)}
              >
                <div className="flex-between" style={{ marginBottom: isExpanded ? '1.5rem' : '0' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    {getUrgencyBadge(report.urgency)}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{org?.name}</strong>
                        {isResolved && <span className="badge badge-low" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>RESOLVED</span>}
                      </div>
                      {!isExpanded && (
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                          {report.location} • {cat?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <Clock size={14} />
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <div className="report-actions" onClick={e => e.stopPropagation()}>
                      {!isResolved && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleResolve(report.id)} title="Mark as Resolved">
                          <CheckCircle size={18} className="text-success" />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteModal({ open: true, id: report.id })} title="Delete Report">
                        <Trash2 size={18} className="text-danger" />
                      </button>
                    </div>

                    {isExpanded ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <div>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Location</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <MapPin size={16} className="text-primary" /> {report.location}
                        </div>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Category</label>
                        <span className="badge badge-info">{cat?.name}</span>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--surface-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Info size={16} className="text-primary" />
                        <strong style={{ fontSize: '0.9rem' }}>Field Data Assessment</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {Object.entries(report.responses).map(([qId, val]) => {
                          const question = commonQuestionPool.find(q => q.id === qId);
                          if (!question) return null;
                          return (
                            <div key={qId} style={{ fontSize: '0.85rem' }}>
                              <span className="text-muted">{question.text}: </span>
                              <strong style={{ color: 'var(--text-dark)' }}>{String(val)}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Report?"
        message="This action cannot be undone. All data associated with this field report will be permanently removed from the system."
      />
    </div>
  );
};

export default Dashboard;
