import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { CheckCircle2, Circle, Clock3, ClipboardList, Plus, Search, LogOut, Trash2, Pencil, X, ListTodo } from "lucide-react";

const emptyForm = { title: "", description: "", status: "Pending", priority: "Medium", dueDate: "" };

function App() {
  const [token, setToken] = useState(localStorage.getItem("taskflow_token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("taskflow_user") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTasks() {
    try {
      const query = new URLSearchParams();
      if (filter !== "All") query.set("status", filter);
      if (search.trim()) query.set("search", search.trim());
      const data = await api(`/tasks?${query.toString()}`);
      setTasks(data.tasks);
    } catch (err) { setError(err.message); }
  }

  useEffect(() => { if (token) loadTasks(); }, [token, filter, search]);

  async function handleAuth(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const data = await api(`/auth/${authMode}`, { method: "POST", body: JSON.stringify(auth) });
      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem("taskflow_user", JSON.stringify(data.user));
      setToken(data.token); setUser(data.user);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function logout() {
    localStorage.removeItem("taskflow_token"); localStorage.removeItem("taskflow_user");
    setToken(null); setUser(null); setTasks([]);
  }

  function openCreate() {
    setEditing(null); setForm(emptyForm); setError(""); setShowForm(true);
  }

  function openEdit(task) {
    setEditing(task._id);
    setForm({
      title: task.title, description: task.description || "", status: task.status,
      priority: task.priority, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
    setError(""); setShowForm(true);
  }

  async function saveTask(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      const data = await api(editing ? `/tasks/${editing}` : "/tasks", {
        method: editing ? "PUT" : "POST", body: JSON.stringify(payload)
      });
      if (editing) setTasks(prev => prev.map(t => t._id === editing ? data.task : t));
      else setTasks(prev => [data.task, ...prev]);
      setShowForm(false); setForm(emptyForm); setEditing(null);
      loadTasks();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function changeStatus(task, status) {
    try {
      const data = await api(`/tasks/${task._id}`, { method: "PUT", body: JSON.stringify({ status }) });
      setTasks(prev => prev.map(t => t._id === task._id ? data.task : t));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) { setError(err.message); }
  }

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    progress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length
  }), [tasks]);

  if (!token) return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark"><ListTodo size={25}/></div>
        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">Plan your day. Focus on what matters.</p>
        <form onSubmit={handleAuth} className="stack">
          {authMode === "register" && <label>Full name<input required value={auth.name} onChange={e => setAuth({...auth, name:e.target.value})} placeholder="Your name"/></label>}
          <label>Email address<input required type="email" value={auth.email} onChange={e => setAuth({...auth, email:e.target.value})} placeholder="you@example.com"/></label>
          <label>Password<input required minLength="6" type="password" value={auth.password} onChange={e => setAuth({...auth, password:e.target.value})} placeholder="At least 6 characters"/></label>
          {error && <p className="error">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <p className="switch-auth">{authMode === "login" ? "New to TaskFlow?" : "Already have an account?"} <button className="link" onClick={() => {setAuthMode(authMode === "login" ? "register" : "login"); setError("");}}> {authMode === "login" ? "Create account" : "Sign in"}</button></p>
      </section>
    </main>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ListTodo size={22}/></span><b>TaskFlow</b></div>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-active"><ClipboardList size={18}/> My Tasks</button>
        <div className="sidebar-bottom">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
          <div className="user-info"><b>{user?.name}</b><small>{user?.email}</small></div>
          <button className="icon-btn" title="Log out" onClick={logout}><LogOut size={18}/></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><p className="eyebrow">OVERVIEW</p><h1>My Tasks</h1><p className="muted">Stay organized and get things done.</p></div>
          <button className="primary" onClick={openCreate}><Plus size={18}/> Add task</button>
        </header>

        {error && <div className="notice">{error}<button onClick={() => setError("")}><X size={15}/></button></div>}

        <section className="stats-grid">
          <Stat icon={<ClipboardList/>} label="Total tasks" value={stats.total}/>
          <Stat icon={<Circle/>} label="Pending" value={stats.pending}/>
          <Stat icon={<Clock3/>} label="In progress" value={stats.progress}/>
          <Stat icon={<CheckCircle2/>} label="Completed" value={stats.completed}/>
        </section>

        <section className="task-section">
          <div className="section-heading"><div><h2>Your tasks</h2><p className="muted">Manage your daily priorities</p></div></div>
          <div className="toolbar">
            <div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."/></div>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              {["All","Pending","In Progress","Completed"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {tasks.length === 0 ? <div className="empty"><div className="empty-icon"><ClipboardList size={28}/></div><h3>No tasks found</h3><p className="muted">Create a task to get your work moving.</p><button className="primary" onClick={openCreate}><Plus size={17}/> Create task</button></div> :
            <div className="task-grid">{tasks.map(task => <article className="task-card" key={task._id}>
              <div className="task-top"><span className={`status status-${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span><div className="task-actions"><button className="icon-btn" title="Edit" onClick={() => openEdit(task)}><Pencil size={16}/></button><button className="icon-btn danger" title="Delete" onClick={() => deleteTask(task._id)}><Trash2 size={16}/></button></div></div>
              <h3>{task.title}</h3><p className="task-description">{task.description || "No description added."}</p>
              <div className="task-meta"><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority} priority</span>{task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}</div>
              <div className="card-footer"><label className="status-label">Update status</label><select value={task.status} onChange={e => changeStatus(task, e.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>
            </article>)}</div>
          }
        </section>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setShowForm(false);}}>
        <section className="modal">
          <div className="modal-head"><div><p className="eyebrow">TASK DETAILS</p><h2>{editing ? "Edit task" : "Create a task"}</h2></div><button className="icon-btn" onClick={() => setShowForm(false)}><X/></button></div>
          <form className="stack" onSubmit={saveTask}>
            <label>Task title<input required maxLength="120" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Complete project report"/></label>
            <label>Description<textarea rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Add some details..."/></label>
            <div className="form-row"><label>Status<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label><label>Priority<select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
            <label>Due date<input type="date" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})}/></label>
            {error && <p className="error">{error}</p>}
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create task"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function Stat({icon,label,value}) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><p>{label}</p><strong>{value}</strong></div></div>;
}

export default App;
