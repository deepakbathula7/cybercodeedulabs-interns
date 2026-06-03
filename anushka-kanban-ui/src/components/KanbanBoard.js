import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'backlog',     label: 'Backlog',     cls: 'col-backlog'    },
  { id: 'inprogress',  label: 'In Progress', cls: 'col-inprogress' },
  { id: 'done',        label: 'Done',        cls: 'col-done'       },
];

const PRIORITIES = [
  { value: 'p1', label: 'P1 · Critical' },
  { value: 'p2', label: 'P2 · Medium'   },
  { value: 'p3', label: 'P3 · Low'      },
];

const TAGS = ['Enhancement','Bug Fix','SOC Operations','Threat Intelligence',
              'Development','Content & Docs','QA & Testing','Detection Engineering'];

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString('default',{month:'short'})}`;
};

const SEED = [
  { id:uuidv4(), title:'[Vathan Sai] Week 1 – Detect attack patterns on Live Monitor for 1 hour',       priority:'p2', tag:'Detection Engineering', column:'backlog',    sla:'02 Jun' },
  { id:uuidv4(), title:'[Vathan Sai] Week 1 – Map 5 attack events to MITRE ATT&CK and Kill Chain',     priority:'p2', tag:'Threat Intelligence',   column:'backlog',    sla:'02 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 2 – Add Brute Force Counter to Log Monitor',                     priority:'p2', tag:'Development',            column:'backlog',    sla:'16 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 1 – Monitor Live Monitor for 1 hour and document all events',    priority:'p2', tag:'SOC Operations',         column:'inprogress', sla:'02 Jun' },
  { id:uuidv4(), title:'[Amulya] Week 1 – Classify 5 security events using MITRE ATT&CK framework',   priority:'p2', tag:'Threat Intelligence',   column:'inprogress', sla:'02 Jun' },
  { id:uuidv4(), title:'[Anushka] Week 1 – Review all course lessons and report quality issues',       priority:'p2', tag:'QA & Testing',           column:'inprogress', sla:'02 Jun' },
  { id:uuidv4(), title:'[Anushka] Week 1 – Document Digital Fort student experience as first-time user',priority:'p2',tag:'Content & Docs',         column:'inprogress', sla:'02 Jun' },
];

function load() {
  try { const d = localStorage.getItem('kb-v2'); return d ? JSON.parse(d) : SEED; }
  catch { return SEED; }
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(load);
  const [modal, setModal] = useState(false);
  const [form,  setForm]  = useState({ title:'', priority:'p2', tag:'Enhancement', column:'backlog', sla: today() });

  useEffect(() => { localStorage.setItem('kb-v2', JSON.stringify(tasks)); }, [tasks]);

  const byCol  = col  => tasks.filter(t => t.column === col);
  const isOver = sla  => {
    if (!sla) return false;
    const [d, m] = sla.split(' ');
    const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const date = new Date(new Date().getFullYear(), months[m], parseInt(d));
    return date < new Date();
  };

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks(p => [...p, { id: uuidv4(), ...form }]);
    setForm({ title:'', priority:'p2', tag:'Enhancement', column:'backlog', sla: today() });
    setModal(false);
  };

  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));

  const moveTask = (id, dir) => {
    const order = ['backlog','inprogress','done'];
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const next = order[order.indexOf(t.column) + dir];
      return next ? { ...t, column: next } : t;
    }));
  };

  const total    = tasks.length;
  const done     = byCol('done').length;
  const pending  = tasks.filter(t => t.column !== 'done').length;
  const critical = tasks.filter(t => t.priority === 'p1').length;
  const inReview = 0;
  const myTasks  = tasks.filter(t => t.title.includes('[Anushka]')).length;
  const overdue  = tasks.filter(t => isOver(t.sla) && t.column !== 'done').length;

  return (
    <div className="kb-root">
      <header className="kb-header">
        <div className="kb-logo"><span className="kb-logo-dot" />C3 DEV · COMMAND</div>
        <span className="kb-meta">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
        <div className="kb-header-right">
          <button className="kb-add-btn" onClick={() => setModal(true)}>+ NEW TASK</button>
        </div>
      </header>

      <div className="kb-statsbar">
        {[['TOTAL',total],['DONE',done],['IN PROGRESS',byCol('inprogress').length],
          ['PENDING',pending],['P1 CRITICAL',critical],['IN REVIEW',inReview],
          ['MY TASKS',myTasks],['SLA BREACH',overdue]
        ].map(([l,v]) => (
          <div className="kb-stat" key={l}>
            <span className="kb-stat-num">{v}</span>
            <span className="kb-stat-label">{l}</span>
          </div>
        ))}
      </div>

      <div className="kb-board">
        {COLUMNS.map(col => (
          <div key={col.id} className={`kb-col ${col.cls}`}>
            <div className="kb-col-header">
              <span className="kb-col-title">{col.label}</span>
              <span className="kb-col-count">{byCol(col.id).length}</span>
            </div>
            <div className="kb-col-cards">
              {byCol(col.id).length === 0 && <div className="kb-empty">— empty —</div>}
              {byCol(col.id).map(task => (
                <div key={task.id} className={`kb-card ${task.priority}`}>
                  <div className="kb-card-top">
                    <span className="kb-card-title">{task.title}</span>
                    <button className="kb-card-delete" onClick={() => deleteTask(task.id)}>✕</button>
                  </div>
                  <div className="kb-card-tags">
                    <span className={`kb-priority ${task.priority}`}>
                      {PRIORITIES.find(p => p.value === task.priority)?.label}
                    </span>
                    <span className="kb-tag">{task.tag}</span>
                  </div>
                  {task.sla && (
                    <div className={`kb-sla ${isOver(task.sla) && task.column !== 'done' ? 'overdue' : ''}`}>
                      SLA: {task.sla}
                    </div>
                  )}
                  <div className="kb-card-move">
                    <button className="kb-move-btn" disabled={col.id==='backlog'}    onClick={() => moveTask(task.id,-1)}>← Back</button>
                    <button className="kb-move-btn" disabled={col.id==='done'}       onClick={() => moveTask(task.id, 1)}>Forward →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
}