import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'backlog',    label: 'Backlog',     cls: 'col-backlog'    },
  { id: 'assigned',  label: 'Assigned',    cls: 'col-assigned'   },
  { id: 'inprogress',label: 'In Progress', cls: 'col-inprogress' },
  { id: 'inreview',  label: 'In Review',   cls: 'col-inreview'   },
  { id: 'done',      label: 'Done',        cls: 'col-done'       },
];

const PRIORITIES = [
  { value: 'p1', label: 'P1 · Critical' },
  { value: 'p2', label: 'P2 · Medium'   },
  { value: 'p3', label: 'P3 · Low'      },
];

const TAGS = [
  'Enhancement','Bug Fix','SOC Operations','Threat Intelligence',
  'Development','Content & Docs','QA & Testing','Detection Engineering','Research',
];

const TAG_COLORS = {
  'Enhancement':          { bg: 'rgba(57,217,138,0.12)',  color: '#39d98a', border: 'rgba(57,217,138,0.3)'  },
  'Bug Fix':              { bg: 'rgba(248,81,73,0.12)',   color: '#f85149', border: 'rgba(248,81,73,0.3)'   },
  'SOC Operations':       { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', border: 'rgba(139,92,246,0.3)'  },
  'Threat Intelligence':  { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)'  },
  'Development':          { bg: 'rgba(30,30,60,0.5)',     color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  'Content & Docs':       { bg: 'rgba(6,182,212,0.12)',   color: '#22d3ee', border: 'rgba(6,182,212,0.3)'   },
  'QA & Testing':         { bg: 'rgba(132,204,22,0.12)',  color: '#a3e635', border: 'rgba(132,204,22,0.3)'  },
  'Detection Engineering':{ bg: 'rgba(57,217,138,0.12)',  color: '#39d98a', border: 'rgba(57,217,138,0.3)'  },
  'Research':             { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.3)'  },
};

const PILL_COLORS = ['#39d98a','#fb923c','#22d3ee','#a78bfa','#f85149','#a3e635','#facc15'];
const tagPillColor = (label) => {
  const hash = label.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return PILL_COLORS[hash % PILL_COLORS.length];
};

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString('default',{month:'short'})}`;
};

const SEED = [
  { id:uuidv4(), title:'[Vathan Sai] Week 1 – Detect attack patterns on Live Monitor for 1 hour',        priority:'p2', tag:'Detection Engineering', column:'backlog',    sla:'02 Jun' },
  { id:uuidv4(), title:'[Vathan Sai] Week 1 – Map 5 attack events to MITRE ATT&CK and Kill Chain',      priority:'p2', tag:'Threat Intelligence',   column:'backlog',    sla:'02 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 2 – Add Brute Force Counter to Log Monitor',                      priority:'p2', tag:'Development',            column:'backlog',    sla:'16 Jun' },
  { id:uuidv4(), title:'[Yuvanth] Week 2 – Add syslog and nginx Analytics',                             priority:'p2', tag:'Development',            column:'backlog',    sla:'16 Jun' },
  { id:uuidv4(), title:'[Anushka] Week 2 – Add Task Details, Tags, and Local Storage',                  priority:'p2', tag:'Enhancement',            column:'backlog',    sla:'16 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 1 – Classify 5 security events using MITRE ATT&CK framework',    priority:'p2', tag:'Threat Intelligence',   column:'assigned',   sla:'02 Jun' },
  { id:uuidv4(), title:'[Yuvanth] Week 1 – Research all 12 Digital Fort attack types with data perspective', priority:'p2', tag:'Research',          column:'assigned',   sla:'02 Jun' },
  { id:uuidv4(), title:'[Yuvanth] Week 1 – Watch Live Monitor and design a data collection schema',     priority:'p2', tag:'Research',               column:'assigned',   sla:'02 Jun' },
  { id:uuidv4(), title:'[Deepak] Week 1 – Test all public pages and report bugs in standard format and also learn the digital fort course', priority:'p2', tag:'Bug Fix', column:'assigned', sla:'02 Jun' },
  { id:uuidv4(), title:'[Deepak] Week 1 – Learn Postman and test 5 Cybercode API endpoints',           priority:'p2', tag:'QA & Testing',           column:'assigned',   sla:'02 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 1 – Monitor Live Monitor for 1 hour and document all events',    priority:'p2', tag:'SOC Operations',         column:'inprogress', sla:'02 Jun' },
  { id:uuidv4(), title:'[Anushka] Week 1 – Review all course lessons and report quality issues',       priority:'p2', tag:'QA & Testing',           column:'inprogress', sla:'02 Jun' },
  { id:uuidv4(), title:'[Anushka] Week 1 – Document Digital Fort student experience as a first-time user', priority:'p2', tag:'Content & Docs',     column:'inprogress', sla:'02 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 1 – Python Log Monitor: Tail auth.log and Detect SSH Events',   priority:'p2', tag:'Development',            column:'inprogress', sla:'16 Jun' },
  { id:uuidv4(), title:'[Yuvanth] Week 1 – Python Log Analytics: Parse and Count Events from auth.log',priority:'p2', tag:'Enhancement',            column:'inprogress', sla:'16 Jun' },
];

function load() {
  try {
    const d = localStorage.getItem('kb-v3');
    const data = d ? JSON.parse(d) : SEED;
    return data.map(t => ({
      description: '',
      createdDate: new Date().toISOString(),
      labels: [],
      ...t,
    }));
  } catch { return SEED; }
}

const NAV_ITEMS = [
  { id:'all',      label:'All Tasks',    icon:'≡'  },
  { id:'kanban',   label:'Kanban Board', icon:'⊞'  },
  { id:'mytasks',  label:'My Tasks',     icon:'◉'  },
  { id:'report',   label:'Report',       icon:'▦'  },
  { id:'activity', label:'Activity Log', icon:'◎'  },
];

// Simple radar/donut chart using SVG



export default function KanbanBoard() {
  const [tasks,   setTasks]   = useState(load);
  const [modal,   setModal]   = useState(false);
  const [activeNav, setActiveNav] = useState('kanban');
  const [filterCol, setFilterCol] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [form, setForm] = useState({ title:'', priority:'p2', tag:'Enhancement', column:'backlog', sla: today() });
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { localStorage.setItem('kb-v3', JSON.stringify(tasks)); }, [tasks]);

  const detailTask = tasks.find(t => t.id === detailTaskId);
  const matchesSearch = (t) => {
  if (!search.trim()) return true;
  const q = search.toLowerCase();
  return t.title.toLowerCase().includes(q) || (t.labels||[]).some(l=>l.toLowerCase().includes(q));
};
  const byCol  = col => tasks.filter(t => t.column === col);
  const isOver = sla => {
    if (!sla) return false;
    const [d, m] = sla.split(' ');
    const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const date = new Date(new Date().getFullYear(), months[m], parseInt(d));
    return date < new Date();
  };

  const addTask = () => {
  if (!form.title.trim()) return;
  setTasks(p => [...p, { id: uuidv4(), createdDate: new Date().toISOString(), labels: [], description: '', ...form }]);
  setForm({ title:'', priority:'p2', tag:'Enhancement', column:'backlog', sla: today() });
  setModal(false);
};

  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));

  const moveTask = (id, dir) => {
    const order = ['backlog','assigned','inprogress','inreview','done'];
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const next = order[order.indexOf(t.column) + dir];
      return next ? { ...t, column: next } : t;
    }));
  };

  const exportTxt = () => {
    const text = tasks.map(t => `[${t.column.toUpperCase()}] ${t.title} | ${t.priority} | SLA: ${t.sla}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'tasks.txt'; a.click();
  };

  const exportCsv = () => {
    const rows = [['Title','Column','Priority','Tag','SLA'], ...tasks.map(t => [t.title, t.column, t.priority, t.tag, t.sla])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'tasks.csv'; a.click();
  };

  const total    = tasks.length;
  const done     = byCol('done').length;
  const inProg   = byCol('inprogress').length;
  const pending  = tasks.filter(t => t.column === 'backlog' || t.column === 'assigned').length;
  const critical = tasks.filter(t => t.priority === 'p1').length;
  const inReview = byCol('inreview').length;
  const myTasks  = tasks.filter(t => t.title.includes('[Anushka]')).length;
  const overdue  = tasks.filter(t => isOver(t.sla) && t.column !== 'done').length;

  const STATS = [
    ['TOTAL',total],['DONE',done],['IN PROGRESS',inProg],
    ['PENDING',pending],['P1 CRITICAL',critical],['IN REVIEW',inReview],
    ['MY TASKS',myTasks],['SLA BREACH',overdue],
  ];

  const FILTER_STATUSES = [
    { id:'pending',    label:'Pending',     count: pending },
    { id:'inprogress', label:'In Progress', count: inProg  },
    { id:'inreview',   label:'In Review',   count: inReview},
    { id:'done',       label:'Done',        count: done    },
    { id:'overdue',    label:'Overdue',     count: overdue },
  ];

  const TYPE_COUNTS = {
    'Bug Fix':    tasks.filter(t=>t.tag==='Bug Fix').length,
    'Patch':      0,
    'Enhancement':tasks.filter(t=>t.tag==='Enhancement').length,
    'Infrastructure':0,
    'Frontend':   tasks.filter(t=>t.tag==='Content & Docs').length,
    'Backend':    tasks.filter(t=>t.tag==='Development').length,
  };

  const CAT_COUNTS = {
    'SOC Operations':     tasks.filter(t=>t.tag==='SOC Operations').length,
    'Threat Intelligence':tasks.filter(t=>t.tag==='Threat Intelligence').length,
    'Detection Engineering':tasks.filter(t=>t.tag==='Detection Engineering').length,
  };

  return (
    <div className="kb-root">
      {/* SIDEBAR */}
      <aside className="kb-sidebar">
        <div className="kb-sidebar-logo">
          <span className="kb-logo-dot" />
          <div>
            <div className="kb-brand">C3 DEV</div>
            <div className="kb-brand-sub">COMMAND</div>
          </div>
        </div>

        <div className="kb-user-block">
          <div className="kb-user-avatar">A</div>
          <div>
            <div className="kb-user-name">Anushkaprasad11</div>
            <div className="kb-user-role">intern</div>
          </div>
        </div>

        <div className="kb-sidebar-section">VIEWS</div>
        <nav className="kb-nav">
          {NAV_ITEMS.map(n => (
            <button key={n.id}
              className={`kb-nav-item ${activeNav===n.id?'active':''}`}
              onClick={() => setActiveNav(n.id)}>
              <span className="kb-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.id==='mytasks' && <span className="kb-nav-badge">{myTasks}</span>}
            </button>
          ))}
        </nav>

        <div className="kb-sidebar-section">FILTER</div>
        <div className="kb-filter-list">
          {FILTER_STATUSES.map(f => (
            <button key={f.id}
              className={`kb-filter-item ${filterCol===f.id?'active':''}`}
              onClick={() => setFilterCol(filterCol===f.id?null:f.id)}>
              <span className="kb-filter-dot" />
              <span>{f.label}</span>
              <span className="kb-filter-count">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="kb-sidebar-section">BY TYPE</div>
        <div className="kb-filter-list">
          {Object.entries(TYPE_COUNTS).map(([k,v]) => (
            <button key={k}
              className={`kb-filter-item ${filterType===k?'active':''}`}
              onClick={() => setFilterType(filterType===k?null:k)}>
              <span className="kb-filter-dot" />
              <span>{k}</span>
              <span className="kb-filter-count">{v}</span>
            </button>
          ))}
        </div>

        <div className="kb-sidebar-section">BY CATEGORY</div>
        <div className="kb-filter-list">
          {Object.entries(CAT_COUNTS).map(([k,v]) => (
            <button key={k}
              className={`kb-filter-item ${filterType===k?'active':''}`}
              onClick={() => setFilterType(filterType===k?null:k)}>
              <span className="kb-filter-dot" />
              <span>{k}</span>
              <span className="kb-filter-count">{v}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <div className="kb-main">
        {/* TOPBAR */}
        <header className="kb-topbar">
          <div>
            <div className="kb-page-title">All Tasks</div>
            <div className="kb-page-date">
              {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
          </div>
          <div className="kb-topbar-pulse"><span className="kb-pulse-dot" /></div>
          <input className="kb-search" placeholder="Search title or tag…"
          value={search} onChange={e => setSearch(e.target.value)} />
          <div className="kb-topbar-actions">
            <button className="kb-action-btn" onClick={exportTxt}>↓ TXT</button>
            <button className="kb-action-btn" onClick={exportCsv}>↓ CSV</button>
            <button className="kb-action-btn">VIEW ARCHIVE</button>
            <button className="kb-action-btn">◎ SETTINGS</button>
            <button className="kb-action-btn kb-logout">LOGOUT</button>
            <button className="kb-add-btn" onClick={() => setModal(true)}>+ NEW TASK</button>
          </div>
        </header>

        {/* STATS BAR */}
        <div className="kb-statsbar">
          {STATS.map(([l,v]) => (
            <div className="kb-stat" key={l}>
              <span className="kb-stat-num">{v}</span>
              <span className="kb-stat-label">{l}</span>
            </div>
          ))}
        </div>

        {/* BOARD */}
        <div className="kb-board-wrap">
          <div className="kb-board">
            {COLUMNS.map(col => (
              <div key={col.id} className={`kb-col ${col.cls}`}>
                <div className="kb-col-header">
                  <span className="kb-col-title">{col.label}</span>
                  <span className="kb-col-count">{byCol(col.id).length}</span>
                </div>
                <div className="kb-col-cards">
                  {byCol(col.id).length === 0 && <div className="kb-empty">— empty —</div>}
                  {byCol(col.id).map(task => {
                    const tagStyle = TAG_COLORS[task.tag] || TAG_COLORS['Enhancement'];
                    return (
                      <div key={task.id} className={`kb-card ${task.priority} ${search && matchesSearch(task) ? 'kb-highlight' : ''} ${search && !matchesSearch(task) ? 'kb-dim' : ''}`}
                      onClick={() => { setDetailTaskId(task.id); setEditing(false); setDraft(task); }}>
                        <div className="kb-card-top">
                          <span className="kb-card-title">{task.title}</span>
                          <button className="kb-card-delete" onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>✕</button>
                          </div>
                          
                        <div className="kb-card-tags">
                          <span className={`kb-priority ${task.priority}`}>
                            {PRIORITIES.find(p => p.value === task.priority)?.label}
                          </span>
                          <span className="kb-tag" style={{
                            background: tagStyle.bg,
                            color: tagStyle.color,
                            border: `1px solid ${tagStyle.border}`,
                          }}>{task.tag}</span>
                        </div>

                        {task.labels?.length > 0 && (
                          <div className="kb-card-tags" style={{marginTop:'4px'}}>
                            {task.labels.map(lbl => (
                              <span key={lbl} className="kb-tag-pill" style={{background: tagPillColor(lbl)}}>{lbl}</span>
                              ))}
                              </div>
                            )}

                        {task.sla && (
                          <div className={`kb-sla ${isOver(task.sla) && task.column !== 'done' ? 'overdue' : ''}`}>
                            SLA: {task.sla}
                          </div>
                        )}
                        <div className="kb-card-move">
                          <button className="kb-move-btn" disabled={col.id==='backlog'} onClick={(e) => { e.stopPropagation(); moveTask(task.id,-1); }}>← Back</button>
                          <button className="kb-move-btn" disabled={col.id==='done'}    onClick={(e) => { e.stopPropagation(); moveTask(task.id, 1); }}>Forward →</button>
                          </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="kb-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="kb-modal">
            <h2>NEW TASK</h2>
            <div className="kb-field">
              <label>Title</label>
              <input autoFocus placeholder="[Name] Week N – task description"
                value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                onKeyDown={e => e.key==='Enter' && addTask()} />
            </div>
            <div className="kb-field">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="kb-field">
              <label>Tag</label>
              <select value={form.tag} onChange={e => setForm(f=>({...f,tag:e.target.value}))}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="kb-field">
              <label>Column</label>
              <select value={form.column} onChange={e => setForm(f=>({...f,column:e.target.value}))}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="kb-field">
              <label>SLA Date (e.g. 16 Jun)</label>
              <input value={form.sla} onChange={e => setForm(f=>({...f,sla:e.target.value}))} />
            </div>
            <div className="kb-modal-actions">
              <button className="kb-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="kb-submit" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
      {detailTask && (
        <div className="kb-overlay" onClick={e => e.target===e.currentTarget && setDetailTaskId(null)}>
          <div className="kb-modal">
            <h2>{editing ? 'EDIT TASK' : 'TASK DETAIL'}</h2>

            <div className="kb-field">
              <label>Title</label>
              {editing
                ? <input value={draft.title} onChange={e => setDraft(d=>({...d,title:e.target.value}))} />
                : <div className="kb-detail-value">{detailTask.title}</div>}
            </div>

            <div className="kb-field">
              <label>Description</label>
              {editing
                ? <textarea value={draft.description} onChange={e => setDraft(d=>({...d,description:e.target.value}))} />
                : <div className="kb-detail-value">{detailTask.description || '—'}</div>}
            </div>

            <div className="kb-field">
              <label>Priority</label>
              {editing
                ? <select value={draft.priority} onChange={e => setDraft(d=>({...d,priority:e.target.value}))}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                : <div className="kb-detail-value">{PRIORITIES.find(p=>p.value===detailTask.priority)?.label}</div>}
            </div>

            <div className="kb-field">
              <label>Created</label>
              <div className="kb-detail-value">
                {new Date(detailTask.createdDate).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
              </div>
            </div>

            <div className="kb-field">
              <label>Tags</label>
              <div className="kb-card-tags">
                {(editing ? draft.labels : detailTask.labels).map(lbl => (
                  <span key={lbl} className="kb-tag-pill" style={{background: tagPillColor(lbl)}}>
                    {lbl}
                    {editing && (
                      <button className="kb-tag-remove"
                        onClick={() => setDraft(d=>({...d, labels: d.labels.filter(l=>l!==lbl)}))}>×</button>
                    )}
                  </span>
                ))}
              </div>
              {editing && (
                <div className="kb-tag-add">
                  <input placeholder="add tag, press Enter" value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key==='Enter' && tagInput.trim()) {
                        const t = tagInput.trim();
                        if (!draft.labels.includes(t)) setDraft(d=>({...d, labels:[...d.labels, t]}));
                        setTagInput('');
                      }
                    }} />
                </div>
              )}
            </div>

            <div className="kb-modal-actions">
              {editing ? (
                <>
                  <button className="kb-cancel" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="kb-submit" onClick={() => {
                    setTasks(p => p.map(t => t.id===draft.id ? draft : t));
                    setEditing(false);
                  }}>Save</button>
                </>
              ) : (
                <>
                  <button className="kb-cancel" onClick={() => setDetailTaskId(null)}>Close</button>
                  <button className="kb-submit" onClick={() => { setEditing(true); setDraft(detailTask); }}>Edit</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}