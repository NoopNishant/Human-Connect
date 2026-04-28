// Mock Database Store to simulate Firebase/Real DB

export const mockOrganizations = [
  { id: 'org_1', name: 'Global Relief Network' },
  { id: 'org_2', name: 'Local Food Bank' },
  { id: 'org_3', name: 'Red Cross Regionals' },
  { id: 'org_4', name: 'Doctors Local Response' },
  { id: 'org_5', name: 'Habitat Restorers' }
];

export const mockCategories = [
  { id: 'cat_health', name: 'Medical & Healthcare' },
  { id: 'cat_food', name: 'Food & Logistics' },
  { id: 'cat_edu', name: 'Education & Supplies' },
  { id: 'cat_rescue', name: 'Physical Rescue & Labor' }
];

// Pre-defined common questions that admins can toggle to include in their template
export const commonQuestionPool = [
  { id: 'q1', text: 'Is there an immediate medical emergency?', type: 'boolean', default: false },
  { id: 'q2', text: 'Estimated number of people affected?', type: 'number', default: 0 },
  { id: 'q3', text: 'Are roads accessible to the location?', type: 'boolean', default: true },
  { id: 'q4', text: 'What is the primary need?', type: 'select', options: ['Food', 'Water', 'Medical', 'Shelter'] },
  { id: 'q5', text: 'Require heavy machinery or physical labor?', type: 'boolean', default: false }
];

// SAFETY LIMIT: Preventing excessive usage to simulate a free-tier quota
const MAX_RECORDS = {
  REPORTS: 50,
  VOLUNTEERS: 20,
  TEMPLATES: 10
};

// In-memory state for rapid prototyping
let state = {
  templates: [
    {
      id: 'temp_preset_1',
      orgId: 'org_1',
      categoryId: 'cat_health',
      name: 'Standard Medical Rapid Assessment',
      questions: { q1: true, q2: true, q3: false, q4: true, q5: false }
    },
    {
      id: 'temp_preset_2',
      orgId: 'org_2',
      categoryId: 'cat_food',
      name: 'Logistics Line Check',
      questions: { q1: false, q2: true, q3: true, q4: true, q5: true }
    },
    {
      id: 'temp_preset_3',
      orgId: 'org_3',
      categoryId: 'cat_rescue',
      name: 'Critical Rescue Dispatch Survey',
      questions: { q1: true, q2: true, q3: true, q4: false, q5: true }
    }
  ],
  reports: [],
  volunteers: [
    { id: 'v1', name: 'Sarah Connor', skills: ['Medical', 'Logistics'], location: 'Sector 4', active: true },
    { id: 'v2', name: 'John Smith', skills: ['Physical Labor'], location: 'Zone B', active: true },
    { id: 'v3', name: 'Dr. Alan Grant', skills: ['Medical'], location: 'North District', active: true },
    { id: 'v4', name: 'Ellen Ripley', skills: ['Physical Labor', 'Logistics'], location: 'Sector 4', active: true }
  ]
};

// Listeners for reactivity without full Redux/Context overhead during hackathon phase
const listeners = new Set();

export const store = {
  getState: () => state,
  
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  notify() {
    listeners.forEach(l => l(this.getState()));
  },

  // Template Actions
  saveTemplate(template) {
    if (!template.id && state.templates.length >= MAX_RECORDS.TEMPLATES) {
      throw new Error(`Quota Exceeded: Maximum ${MAX_RECORDS.TEMPLATES} templates allowed on free tier.`);
    }
    const existingIndex = state.templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      state.templates[existingIndex] = template;
    } else {
      state.templates.push({ ...template, id: 'temp_' + Date.now() });
    }
    this.notify();
  },

  deleteTemplate(templateId) {
    state.templates = state.templates.filter(t => t.id !== templateId);
    this.notify();
  },

  // Report Actions
  submitReport(report) {
    if (state.reports.length >= MAX_RECORDS.REPORTS) {
      throw new Error(`Quota Exceeded: Database full. Maximum ${MAX_RECORDS.REPORTS} reports allowed.`);
    }
    state.reports.push({ ...report, id: 'rep_' + Date.now(), status: 'open', timestamp: new Date() });
    this.notify();
  },

  resolveReport(reportId) {
    const report = state.reports.find(r => r.id === reportId);
    if (report) {
      report.status = 'resolved';
      this.notify();
    }
  },

  deleteReport(reportId) {
    state.reports = state.reports.filter(r => r.id !== reportId);
    this.notify();
  },

  // Volunteer Actions
  saveVolunteer(volunteer) {
    if (!volunteer.id && state.volunteers.length >= MAX_RECORDS.VOLUNTEERS) {
      throw new Error(`Quota Exceeded: Maximum ${MAX_RECORDS.VOLUNTEERS} personnel allowed on free tier.`);
    }
    if (volunteer.id) {
      const index = state.volunteers.findIndex(v => v.id === volunteer.id);
      if (index >= 0) state.volunteers[index] = volunteer;
    } else {
      state.volunteers.push({ ...volunteer, id: 'v_' + Date.now(), active: true });
    }
    this.notify();
  },

  deleteVolunteer(volunteerId) {
    state.volunteers = state.volunteers.filter(v => v.id !== volunteerId);
    this.notify();
  },

  toggleVolunteerStatus(volunteerId) {
    const vol = state.volunteers.find(v => v.id === volunteerId);
    if (vol) {
      vol.active = !vol.active;
      this.notify();
    }
  },

  // Export Data
  exportReportsCSV() {
    const headers = ['ID', 'Org', 'Category', 'Location', 'Urgency', 'Status', 'Timestamp'];
    const rows = state.reports.map(r => {
      const org = mockOrganizations.find(o => o.id === r.orgId)?.name;
      const cat = mockCategories.find(c => c.id === r.categoryId)?.name;
      return [r.id, org, cat, r.location, r.urgency, r.status, r.timestamp.toISOString()];
    });
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "human_connect_reports.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
