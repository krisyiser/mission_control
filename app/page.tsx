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
  ExternalLink,
  Menu
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 glass border-r flex flex-col py-8 z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0 shadow-2xl shadow-primary/20" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">FLEET MISSION</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-muted rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 w-full px-4 flex flex-col gap-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Layers size={20} />} 
            label="Projects" 
            active={activeTab === 'projects'} 
            onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<CheckSquare size={20} />} 
            label="Tasks" 
            active={activeTab === 'tasks'} 
            onClick={() => { setActiveTab('tasks'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Laptop size={20} />} 
            label="Machines" 
            active={activeTab === 'machines'} 
            onClick={() => { setActiveTab('machines'); setIsSidebarOpen(false); }} 
          />
        </nav>

        {/* STATUS FOOTER */}
        <div className="px-6 mt-auto">
          <div className="p-5 rounded-3xl glass-card border border-primary/10 bg-card/10 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Status</span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5 mb-3">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
                style={{ width: `${machines.length > 0 ? (machines.filter(m => m.status === 'online').length / machines.length) * 100 : 0}%` }} 
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              <b>{machines.filter(m => m.status === 'online').length}</b> agents active.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-10 relative custom-scrollbar">
        {/* BG ORBS */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] pointer-events-none" />

        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-card border border-border rounded-xl shadow-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.2em]">Operation Fleet Alpha</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
          </div>
          <div className="flex gap-2 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
             <button 
              onClick={syncAll}
              disabled={isSyncing}
              className="flex-none group flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl bg-muted/30 border border-border hover:bg-muted hover:border-primary/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={cn("text-muted-foreground group-hover:text-primary transition-colors", isSyncing && "animate-spin")} />
              <span className="font-bold text-xs md:text-sm whitespace-nowrap">Sync Fleet</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-none flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background shadow-xl hover:shadow-primary/40 transition-all active:scale-95 font-bold text-xs md:text-sm"
            >
              <Plus size={18} />
              <span className="whitespace-nowrap">Launch Task</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
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

// --- SUB-COMPONENTS ---

function DashboardView({ projects, machines, tasks }: { projects: Project[], machines: Machine[], tasks: Task[] }) {
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Online Fleet" value={machines.filter(m => m.status === 'online').length.toString()} icon={<Laptop className="text-emerald-400" />} />
        <StatCard label="Active Tasks" value={tasks.filter(t => t.status !== 'done').length.toString()} icon={<CheckSquare className="text-primary" />} />
        <StatCard label="Live Repos" value={projects.length.toString()} icon={<Globe className="text-cyan-400" />} />
        <StatCard label="System Health" value="OPTIMAL" icon={<Activity className="text-rose-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            <Activity size={24} className="text-primary" />
            Control Stream
          </h2>
          <div className="space-y-4">
            {tasks.slice(0, 5).map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="p-16 text-center glass-card rounded-[2.5rem] border-dashed border-2 border-border/50">
                <p className="text-muted-foreground opacity-60 italic text-sm">Waiting for incoming commands...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold">Fleet Roster</h2>
          <div className="space-y-4">
            {machines.slice(0, 3).map(m => (
              <MachineCompact key={m.id} machine={m} />
            ))}
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-indigo-500/5 border border-primary/10 shadow-inner">
            <h4 className="font-bold flex items-center gap-2 mb-2 text-primary-foreground/90">
              <AlertCircle size={16} className="text-primary" />
              Agent Logic
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All 4 agents are reporting nominal status. System load is at 12%. No pending builds are failing across synchronized repositories.
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
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -track-y-1/2 text-muted-foreground -translate-y-1/2" size={18} />
        <input 
          type="text" 
          placeholder="Filter repositories..." 
          className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}

function MachinesView({ machines }: { machines: Machine[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {machines.map(m => (
        <div key={m.id} className="glass-card p-6 md:p-8 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 md:p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
              <Laptop size={28} />
            </div>
            <div className="text-right">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                m.status === 'online' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
              )}>
                {m.status}
              </span>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium tracking-tighter uppercase">{new Date(m.last_seen).toLocaleTimeString()}</p>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-6 truncate">{m.name}</h3>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
             <InfoTile icon={<Cpu size={14} />} label="Processor" value={m.cpu} />
             <InfoTile icon={<Box size={14} />} label="Memory" value={m.ram} />
             <InfoTile icon={<Server size={14} />} label="Model" value={m.model} />
             <InfoTile icon={<Activity size={14} />} label="Kernel" value={m.os} />
          </div>

          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted shadow-sm" />)}
             </div>
             <button className="text-[10px] font-black uppercase tracking-[0.1em] text-primary hover:text-indigo-400 transition-colors">Remote Management</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} showProject />
      ))}
      {tasks.length === 0 && (
        <div className="py-24 text-center glass-card rounded-[2.5rem]">
          <CheckSquare size={54} className="mx-auto text-primary/10 mb-6" />
          <h3 className="text-xl font-bold">Safe Mode Active</h3>
          <p className="text-muted-foreground mt-2 opacity-60">No operations pending in the queue.</p>
        </div>
      )}
    </div>
  );
}

// --- ATOMS ---

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full", active ? "bg-primary/20 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-muted/50 font-medium")}>
      <span className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground/50")}>{icon}</span>
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="active-nav" className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="glass-card p-6 rounded-[2rem] border border-border bg-card/10 hover:bg-card/20 transition-colors shadow-sm relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 bg-background/50 rounded-xl border border-border shadow-inner">{icon}</div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{label}</p>
        <p className="text-3xl font-black mt-2 tracking-tighter text-foreground">{value}</p>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-3 md:p-4 rounded-2xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">{label}</span>
      </div>
      <p className="text-[11px] md:text-xs font-black truncate text-foreground">{value}</p>
    </div>
  );
}

function MachineCompact({ machine }: { machine: Machine }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/20 border border-border/50 hover:bg-card/40 transition-all cursor-pointer">
      <div className={cn("p-2 rounded-xl border border-border/20", machine.status === 'online' ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-muted-foreground")}>
        <Laptop size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black truncate leading-tight">{machine.name}</p>
        <p className="text-[9px] text-muted-foreground mt-0.5 truncate uppercase font-bold opacity-60">{machine.model} • {machine.os}</p>
      </div>
      <div className={cn("w-1.5 h-1.5 rounded-full", machine.status === 'online' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-muted")} />
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
    <div className="glass-card p-4 md:p-6 rounded-[2rem] border border-transparent hover:border-border transition-all flex items-center gap-4 md:gap-6 group">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center text-muted-foreground shadow-inner">
        <Hash size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
          <h4 className="font-bold text-sm md:text-base truncate">{task.title}</h4>
          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md border", priorities[task.priority as keyof typeof priorities])}>
            {task.priority}
          </span>
        </div>
        <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-1 opacity-70 mb-3">{task.description}</p>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
           {showProject && (
             <span className="text-[9px] flex items-center gap-1.5 text-primary-foreground/70 bg-primary/20 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
               <Layers size={10} /> {task.projects?.name}
             </span>
           )}
           <span className="text-[9px] flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg font-bold uppercase tracking-tighter">
             <Laptop size={10} /> {task.machines?.name}
           </span>
           <span className="text-[9px] flex items-center gap-1.5 text-muted-foreground/50 font-bold uppercase tracking-widest ml-auto md:ml-0">
             <Clock size={10} /> {new Date(task.created_at).toLocaleDateString()}
           </span>
        </div>
      </div>
      <div className="flex items-center gap-4 border-l border-border pl-4 md:pl-6">
        <div className="text-right hidden sm:block">
           <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Status</p>
           <p className="text-xs font-black text-primary uppercase mt-0.5">{task.status}</p>
        </div>
        <button className="p-2.5 bg-muted/10 border border-border/20 rounded-xl hover:bg-primary hover:text-white transition-all">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-border group hover:border-primary/30 transition-all flex flex-col justify-between h-full bg-card/5 backdrop-blur-2xl shadow-xl">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-card to-muted border border-border flex items-center justify-center text-primary shadow-sm group-hover:shadow-primary/10 transition-shadow">
            <Github size={24} />
          </div>
          <span className={cn(
            "text-[9px] uppercase tracking-[0.2em] font-black px-2.5 py-1 rounded-lg border",
            project.status === 'online' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
          )}>
            {project.status || 'Active'}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-black truncate text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-2 opacity-50 font-medium">github.com/{project.github_url.split('github.com/')[1]}</p>
        </div>
      </div>
      <div className="mt-8 flex gap-3 pt-6 border-t border-border/30">
        <a href={project.github_url} target="_blank" className="flex-1 py-3 bg-muted/30 hover:bg-muted/50 rounded-2xl text-[10px] font-black text-center flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest">
          <Github size={14} /> REPO
        </a>
        {project.netlify_url && (
          <a href={project.netlify_url} target="_blank" className="flex-1 py-3 bg-primary/10 hover:bg-primary/20 rounded-2xl text-[10px] font-black text-primary text-center flex items-center justify-center gap-2 transition-all active:scale-95 tracking-widest">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-lg glass-card rounded-[2.5rem] border border-border p-8 md:p-10 relative z-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Deploy Operative</h2>
                <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">Task assignment protocol</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Mission Objective</label>
                <input 
                  required
                  placeholder="E.g. Full rewrite of authentication flow"
                  className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary text-foreground font-bold transition-all shadow-inner"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Target Repository</label>
                  <select 
                    required
                    className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary text-foreground font-bold transition-all"
                    value={formData.project_id}
                    onChange={e => setFormData({...formData, project_id: e.target.value})}
                  >
                    <option value="">Select Project</option>
                    {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Designated Agent</label>
                  <select 
                    required
                    className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary text-foreground font-bold transition-all"
                    value={formData.assigned_to}
                    onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                  >
                    <option value="">Select Machine</option>
                    {machines.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Detailed Intelligence</label>
                <textarea 
                  placeholder="Specific requirements, edge cases, and architectural constraints..."
                  className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary h-28 text-foreground font-medium transition-all shadow-inner"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-foreground text-background font-black rounded-2xl shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 tracking-[0.1em]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                LAUNCH OPERATION
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
