import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, Circle, ClipboardList, Clock3, ListTodo, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  notes: string;
  dueDate: string;
  priority: 'Baja' | 'Media' | 'Alta';
  completed: boolean;
  createdAt: number;
};

type Filter = 'Todas' | 'Pendientes' | 'Completadas';
const STORAGE_KEY = 'taskflow-tasks-v1';
const starterTasks: Task[] = [
  { id: 'sample-1', title: 'Actualizar mi portafolio', notes: 'Agregar proyectos y revisar el README de GitHub.', dueDate: '', priority: 'Alta', completed: false, createdAt: Date.now() - 3000 },
  { id: 'sample-2', title: 'Practicar TypeScript', notes: 'Repasar tipos, interfaces y funciones.', dueDate: '', priority: 'Media', completed: false, createdAt: Date.now() - 2000 },
  { id: 'sample-3', title: 'Organizar la semana', notes: 'Definir las tareas más importantes.', dueDate: '', priority: 'Baja', completed: true, createdAt: Date.now() - 1000 },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as Task[] : starterTasks;
    } catch { return starterTasks; }
  });
  const [filter, setFilter] = useState<Filter>('Todas');
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Media');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const visibleTasks = useMemo(() => tasks
    .filter((task) => filter === 'Todas' || (filter === 'Pendientes' ? !task.completed : task.completed))
    .filter((task) => `${task.title} ${task.notes}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt), [tasks, filter, search]);

  function resetForm() {
    setTitle(''); setNotes(''); setDueDate(''); setPriority('Media'); setEditingId(null); setError(''); setFormOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) { setError('Escribe un título para la tarea.'); return; }
    if (cleanTitle.length > 90) { setError('El título debe tener 90 caracteres o menos.'); return; }
    if (editingId) {
      setTasks((current) => current.map((task) => task.id === editingId ? { ...task, title: cleanTitle, notes: notes.trim(), dueDate, priority } : task));
    } else {
      setTasks((current) => [{ id: crypto.randomUUID(), title: cleanTitle, notes: notes.trim(), dueDate, priority, completed: false, createdAt: Date.now() }, ...current]);
    }
    resetForm();
  }

  function startEdit(task: Task) {
    setEditingId(task.id); setTitle(task.title); setNotes(task.notes); setDueDate(task.dueDate); setPriority(task.priority); setFormOpen(true); setError('');
  }

  function toggleTask(id: string) { setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)); }
  function deleteTask(id: string) { setTasks((current) => current.filter((task) => task.id !== id)); }
  function formatDate(date: string) { if (!date) return ''; return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`)); }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="TaskFlow inicio"><span className="brand-icon"><ListTodo size={22} /></span><span>taskflow<span className="brand-dot">.</span></span></a>
        <div className="side-label">ESPACIO DE TRABAJO</div>
        <button className="nav-item active"><ClipboardList size={18} /> Mis tareas <span className="nav-count">{tasks.length}</span></button>
        <div className="side-label side-label-lower">VISTA RÁPIDA</div>
        <button className={`nav-item ${filter === 'Todas' ? 'sub-active' : ''}`} onClick={() => setFilter('Todas')}><ListTodo size={18} /> Todas las tareas</button>
        <button className={`nav-item ${filter === 'Pendientes' ? 'sub-active' : ''}`} onClick={() => setFilter('Pendientes')}><Clock3 size={18} /> Pendientes <span className="nav-count">{pendingCount}</span></button>
        <button className={`nav-item ${filter === 'Completadas' ? 'sub-active' : ''}`} onClick={() => setFilter('Completadas')}><Check size={18} /> Completadas</button>
        <div className="sidebar-bottom"><div className="mini-avatar">MC</div><div><strong>Mi espacio</strong><small>Organización personal</small></div><span className="online-dot" /></div>
      </aside>

      <section className="main-panel" id="inicio">
        <header className="topbar"><span>Mi espacio <span className="crumb">/</span> Mis tareas</span><span className="today-label">Tu espacio para enfocarte <Sparkles size={15} /></span></header>
        <div className="content">
          <div className="page-heading"><div><div className="eyebrow">LUNES A TU RITMO</div><h1>Mis tareas<span className="heading-period">.</span></h1><p>Un paso a la vez. Organiza tus ideas y avanza con claridad.</p></div><button className="primary-button" onClick={() => { resetForm(); setFormOpen(true); }}><Plus size={18} /> Nueva tarea</button></div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon purple"><ListTodo size={19} /></div><div className="stat-label">Total de tareas</div><div className="stat-value">{tasks.length}<span className="stat-caption">en tu lista</span></div></div>
            <div className="stat-card"><div className="stat-icon orange"><Clock3 size={19} /></div><div className="stat-label">Por completar</div><div className="stat-value">{pendingCount}<span className="stat-caption">por hacer</span></div></div>
            <div className="stat-card"><div className="stat-icon green"><Check size={19} /></div><div className="stat-label">Completadas</div><div className="stat-value">{completedCount}<span className="stat-caption">buen trabajo</span></div></div>
          </div>

          <div className="tasks-header"><div><h2>Tu lista de tareas</h2><p>Gestiona tus pendientes de forma sencilla.</p></div><label className="search-box"><Search size={17} /><input aria-label="Buscar tareas" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarea..." />{search && <button aria-label="Limpiar búsqueda" onClick={() => setSearch('')}><X size={15} /></button>}</label></div>
          <div className="filter-row">{(['Todas', 'Pendientes', 'Completadas'] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={`filter-chip ${filter === item ? 'selected' : ''}`}>{item}{item === 'Todas' ? <span>{tasks.length}</span> : item === 'Pendientes' ? <span>{pendingCount}</span> : <span>{completedCount}</span>}</button>)}</div>

          <div className="task-list">
            {visibleTasks.map((task) => <article key={task.id} className={`task-card ${task.completed ? 'is-completed' : ''}`}>
              <button className={`check-button ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? 'Marcar como pendiente' : 'Completar tarea'} onClick={() => toggleTask(task.id)}>{task.completed ? <Check size={15} /> : <Circle size={19} />}</button>
              <button className="task-body" onClick={() => startEdit(task)} aria-label={`Editar ${task.title}`}><span className="task-title">{task.title}</span>{task.notes && <span className="task-notes">{task.notes}</span>}<span className="task-meta">{task.dueDate && <span className="due-date"><Clock3 size={13} /> {formatDate(task.dueDate)}</span>}<span className={`priority priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span></span></button>
              <div className="task-actions"><button aria-label="Editar tarea" onClick={() => startEdit(task)} className="edit-action">Editar</button><button aria-label="Eliminar tarea" onClick={() => deleteTask(task.id)} className="delete-action"><Trash2 size={16} /></button></div>
            </article>)}
            {visibleTasks.length === 0 && <div className="empty-state"><div className="empty-icon"><ClipboardList size={25} /></div><h3>{search ? 'No encontramos tareas' : 'Todo despejado por aquí'}</h3><p>{search ? 'Prueba con otra palabra.' : 'Agrega una tarea para empezar a organizarte.'}</p>{!search && <button className="primary-button" onClick={() => { resetForm(); setFormOpen(true); }}><Plus size={17} /> Crear mi primera tarea</button>}</div>}
          </div>
          <footer className="footer-note"><span><span className="footer-dot" /> Tus cambios se guardan automáticamente</span><span>Hecho para avanzar ✦</span></footer>
        </div>
      </section>

      {formOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) resetForm(); }}><section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">ORGANIZA TU DÍA</span><h2 id="modal-title">{editingId ? 'Editar tarea' : 'Nueva tarea'}</h2></div><button className="close-button" onClick={resetForm} aria-label="Cerrar"><X size={20} /></button></div><form onSubmit={handleSubmit}><label className="field-label">Título <span>*</span><input autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setError(''); }} maxLength={90} placeholder="Ej. Preparar mi portafolio" /></label><label className="field-label">Notas <small>Opcional</small><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} maxLength={300} placeholder="Agrega algún detalle que te ayude..." /></label><div className="form-row"><label className="field-label">Fecha límite <small>Opcional</small><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label className="field-label">Prioridad<select value={priority} onChange={(event) => setPriority(event.target.value as Task['priority'])}><option>Baja</option><option>Media</option><option>Alta</option></select></label></div>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={resetForm}>Cancelar</button><button type="submit" className="primary-button"><Check size={17} /> {editingId ? 'Guardar cambios' : 'Crear tarea'}</button></div></form></section></div>}
    </main>
  );
}
