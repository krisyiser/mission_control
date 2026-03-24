'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  LayoutDashboard, 
  CheckSquare, 
  Github, 
  Activity, 
  Plus, 
  Cpu, 
  Globe, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Send,
  Loader2,
  Terminal,
  Layers,
  Settings,
  RefreshCw,
  Search,
  Hash,
  Box,
  Server,
  X,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// --- INTERFACES ---

interface Project {
  id: string;
  name: string;
  github_url: string;
  netlify_url: string | null;
  status: string;
}

interface Machine {
  id: string;
  name: string;
  model: string;
  cpu: string;
  ram: string;
  os: string;
  status: string;
  last_seen: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: string;
  assigned_to: string;
  created_at: string;
  projects?: { name: string };
  machines?: { name: string };
}

// --- MAIN APP ---

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();

    const channel = supabase
      .channel('mission-control-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    const { data: projData } = await supabase.from('projects').select('*').order('name');
    const { data: machData } = await supabase.from('machines').select('*').order('last_seen', { ascending: false });
    const { data: taskData } = await supabase.from('tasks').select('*, projects(name), machines(name)').order('created_at', { ascending: false });
    
    if (projData) setProjects(projData);
    if (machData) setMachines(machData);
    if (taskData) setTasks(taskData);
  }

  async function syncAll() {
    setIsSyncing(true);
    try {
      await fetch('/api/sync/all', { method: 'POST' });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30">
      {/* SIDEBAR */}
      <aside className="w-72 glass border-r flex flex-col py-8">
        <div className="flex items-center gap-3 px-8 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">CONTROL CENTER</span>
        </div>

        <nav className="flex-1 w-full px-4 flex flex-col gap-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Layers size={20} />} 
            label="Projects" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <SidebarItem 
            icon={<CheckSquare size={20} />} 
            label="Tasks" 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')} 
          />
          <SidebarItem 
            icon={<Laptop size={20} />} 
            label="Machines" 
            active={activeTab === 'machines'} 
            onClick={() => setActiveTab('machines')} 
          />
        </nav>

        {/* STATUS FOOTER */}
        <div className="px-6 mt-auto">
          <div className="p-5 rounded-3xl glass-card border border-primary/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Status</span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5 mb-3">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000" 
                style={{ width: `${machines.length > 0 ? (machines.filter(m => m.status === 'online').length / machines.length) * 100 : 0}%` }} 
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              <b>{machines.filter(m => m.status === 'online').length}</b> agents active out of <b>{machines.length}</b> devices.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto px-10 py-10 relative custom-scrollbar">
        {/* BG ORBS */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] pointer-events-none" />

        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Operation: Fleet Zero</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={syncAll}
              disabled={isSyncing}
              className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/50 border border-border hover:bg-muted hover:border-primary/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={cn("text-muted-foreground group-hover:text-primary transition-colors", isSyncing && "animate-spin")} />
              <span className="font-semibold text-sm">Force Sync</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background shadow-xl hover:shadow-primary/20 transition-all active:scale-95 font-bold text-sm"
            >
              <Plus size={18} />
              <span>Deploy Task</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardView projects={projects} machines={machines} tasks={tasks} />}
            {activeTab === 'projects' && <ProjectsView projects={projects} />}
            {activeTab === 'machines' && <MachinesView machines={machines} />}
            {activeTab === 'tasks' && <TasksView tasks={tasks} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* NEW TASK MODAL */}
      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projects={projects} 
        machines={machines}
        onTaskCreated={fetchData}
      />
    </div>
  );
}

// --- VIEWS ---

function DashboardView({ projects, machines, tasks }: { projects: Project[], machines: Machine[], tasks: Task[] }) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Live Agents" value={machines.filter(m => m.status === 'online').length.toString()} icon={<Laptop className="text-emerald-400" />} />
        <StatCard label="Global Tasks" value={tasks.filter(t => t.status !== 'done').length.toString()} icon={<CheckSquare className="text-primary" />} />
        <StatCard label="Fleet Power" value={`${machines.length * 8} Cores`} icon={<Cpu className="text-indigo-400" />} />
        <StatCard label="Success Rate" value="100%" icon={<Activity className="text-rose-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Activity size={24} className="text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {tasks.slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="p-12 text-center glass-card rounded-3xl border-dashed border-2 border-border">
                <p className="text-muted-foreground">No tasks in orbit. Launch your first command.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Quick Overview</h2>
          <div className="space-y-4">
            {machines.slice(0, 3).map(m => (
              <MachineCompact key={m.id} machine={m} />
            ))}
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-primary" />
              Intelligence Brief
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All 4 agents are reporting nominal status. System load is at 12%. No pending builds are failing across {projects.length} synchronized repositories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState('');
  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -track-y-1/2 text-muted-foreground -translate-y-1/2" size={18} />
        <input 
          type="text" 
          placeholder="Search repositories..." 
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}

function MachinesView({ machines }: { machines: Machine[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {machines.map(m => (
        <div key={m.id} className="glass-card p-8 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Laptop size={32} />
            </div>
            <div className="text-right">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                m.status === 'online' ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground"
              )}>
                {m.status}
              </span>
              <p className="text-[10px] text-muted-foreground mt-2">Active {new Date(m.last_seen).toLocaleTimeString()}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-6">{m.name}</h3>
          
          <div className="grid grid-cols-2 gap-4">
             <InfoTile icon={<Cpu size={16} />} label="Processor" value={m.cpu} />
             <InfoTile icon={<Box size={16} />} label="Memory" value={m.ram} />
             <InfoTile icon={<Server size={16} />} label="Model" value={m.model} />
             <InfoTile icon={<Activity size={16} />} label="OS Version" value={m.os} />
          </div>

          <div className="mt-8 pt-8 border-t border-border flex justify-between items-center">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />)}
                <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">+2</div>
             </div>
             <button className="text-sm font-bold text-primary hover:underline">Deploy Logic</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} showProject />
      ))}
      {tasks.length === 0 && (
        <div className="py-20 text-center glass-card rounded-3xl">
          <CheckSquare size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-xl font-bold">No tasks assigned</h3>
          <p className="text-muted-foreground mt-2">All fleets are ready for operation.</p>
        </div>
      )}
    </div>
  );
}

// --- ATOMS ---

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full", active ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted font-medium")}>
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="active-nav" className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="glass-card p-6 rounded-3xl border border-border/50">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-card rounded-xl border border-border shadow-sm">{icon}</div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold truncate">{value}</p>
    </div>
  );
}

function MachineCompact({ machine }: { machine: Machine }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border">
      <div className={cn("p-2 rounded-xl", machine.status === 'online' ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground")}>
        <Laptop size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold leading-none">{machine.name}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{machine.model}</p>
      </div>
      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
    </div>
  );
}

function TaskItem({ task, showProject }: { task: Task, showProject?: boolean }) {
  const priorities = {
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-transparent hover:border-border transition-all flex items-center gap-6">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <Hash size={18} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h4 className="font-bold">{task.title}</h4>
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", priorities[task.priority as keyof typeof priorities])}>
            {task.priority}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        <div className="flex items-center gap-4 mt-3">
           {showProject && (
             <span className="text-[10px] flex items-center gap-1 text-primary-foreground/50 bg-primary/20 px-2 py-0.5 rounded-md font-bold uppercase">
               <Layers size={10} /> {task.projects?.name}
             </span>
           )}
           <span className="text-[10px] flex items-center gap-1 text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-bold uppercase">
             <Laptop size={10} /> {task.machines?.name}
           </span>
           <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
             <Clock size={10} /> {new Date(task.created_at).toLocaleDateString()}
           </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right mr-4">
           <p className="text-[10px] font-bold uppercase text-muted-foreground">Status</p>
           <p className="text-xs font-bold text-primary uppercase">{task.status}</p>
        </div>
        <button className="p-2 border border-border rounded-xl hover:bg-muted transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="glass-card p-6 rounded-3xl border border-border group hover:border-primary/30 transition-all flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary shadow-sm">
            <Github size={20} />
          </div>
          <span className={cn(
            "text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full border",
            project.status === 'online' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
          )}>
            {project.status || 'Active'}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold truncate text-foreground">{project.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{project.github_url}</p>
        </div>
      </div>
      <div className="mt-8 flex gap-3 pt-6 border-t border-border/50">
        <a href={project.github_url} target="_blank" className="flex-1 py-2 bg-muted hover:bg-muted/80 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-2 transition-colors">
          <Github size={14} /> REPO
        </a>
        {project.netlify_url && (
          <a href={project.netlify_url} target="_blank" className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl text-[11px] font-bold text-primary text-center flex items-center justify-center gap-2 transition-colors">
            <ExternalLink size={14} /> LIVE
          </a>
        )}
      </div>
    </div>
  );
}

function NewTaskModal({ isOpen, onClose, projects, machines, onTaskCreated }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    priority: 'medium'
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      onTaskCreated();
      onClose();
    }
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg glass-card rounded-[2.5rem] border border-border p-10 relative z-10"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Launch Task</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Title</label>
                <input 
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-foreground"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Assigned Project</label>
                  <select 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.project_id}
                    onChange={e => setFormData({...formData, project_id: e.target.value})}
                  >
                    <option value="">Select Project</option>
                    {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Assigned Machine</label>
                  <select 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-foreground"
                    value={formData.assigned_to}
                    onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                  >
                    <option value="">Select Machine</option>
                    {machines.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Mission Logistics</label>
                <textarea 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary h-24 text-foreground"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                Deploy Operative
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
