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
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockProjects, mockMachines, type Project, type Machine, type Task } from '@/data/mockData';

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 glass border-r flex flex-col items-center py-8 gap-10">
        <div className="flex items-center gap-3 px-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">A_G FLEET</span>
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
            label="Active Tasks" 
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

        <div className="w-full px-6 flex flex-col gap-4 mt-auto">
          <div className="p-4 rounded-2xl glass-card text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Fleet Status</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full w-3/4" />
            </div>
            <p className="mt-2 text-muted-foreground">3 / 4 Laptops synced</p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto px-10 py-10 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] -z-10" />

        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-muted-foreground mt-2">Managing your 4 Antigravity agents across all projects.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all active:scale-95">
              <Activity size={18} className="text-muted-foreground" />
              <span>Logs</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 font-medium">
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* --- DASHBOARD VIEW --- */}
        <div className="space-y-12 pb-20">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Online Agents" value="3" icon={<Laptop className="text-emerald-400" />} />
            <StatCard label="Active Tasks" value="12" icon={<CheckSquare className="text-primary" />} />
            <StatCard label="Live Deploys" value="2" icon={<Globe className="text-cyan-400" />} />
            <StatCard label="Issues" value="0" icon={<Activity className="text-rose-400" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Project List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Projects</h2>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">View all <ChevronRight size={14} /></button>
              </div>
              <div className="grid gap-6">
                {mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Fleet Status */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Fleet Overview</h2>
                <button className="text-sm text-primary hover:underline">Manage</button>
              </div>
              <div className="space-y-4">
                {mockMachines.map((machine) => (
                  <MachineItem key={machine.id} machine={machine} />
                ))}
              </div>

              {/* Quick Prompt */}
              <div className="glass-card p-6 rounded-3xl space-y-4 border-l-4 border-l-primary mt-10">
                <h3 className="font-semibold flex items-center gap-2">
                  <Terminal size={18} className="text-primary" />
                  Quick Command
                </h3>
                <p className="text-xs text-muted-foreground">Broadcast a task to all agents in the fleet.</p>
                <div className="relative">
                  <textarea 
                    placeholder="Ask agents to check for lint errors in all repos..." 
                    className="w-full bg-background border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all h-24 whitespace-normal"
                  />
                  <button className="absolute bottom-3 right-3 p-2 bg-primary rounded-xl text-white">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full",
        active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="active-nav" className="ml-auto w-1 h-5 bg-primary rounded-full" />}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-background rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card p-8 rounded-3xl group border border-transparent hover:border-primary/20"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight">{project.name}</h3>
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
              project.status === 'online' ? "bg-emerald-500/10 text-emerald-400" : 
              project.status === 'error' ? "bg-rose-500/10 text-rose-400" :
              "bg-cyan-500/10 text-cyan-400"
            )}>
              {project.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href={project.github} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <a href={project.netlify} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Globe size={14} />
              <span>Netlify</span>
            </a>
          </div>
        </div>
        <button className="p-2 text-muted-foreground hover:text-foreground">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="glass-card bg-background/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare size={16} className="text-primary" />
            <span className="text-sm font-medium">Pending Tasks</span>
          </div>
          <span className="text-xl font-bold">{project.tasks.filter(t => t.status !== 'done').length}</span>
        </div>
        <div className="glass-card bg-background/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-cyan-400" />
            <span className="text-sm font-medium">Health</span>
          </div>
          <span className="text-xl font-bold text-emerald-400">98%</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Active Pipeline</p>
        <div className="flex items-center gap-2">
          {project.tasks.filter(t => t.status === 'in-progress').map(task => (
            <div key={task.id} className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-medium">
              <Loader2 size={12} className="animate-spin" />
              {task.title}
              <span className="opacity-50 text-[10px] bg-primary/20 px-1 rounded ml-1">{task.assignedTo}</span>
            </div>
          ))}
          {project.tasks.filter(t => t.status === 'in-progress').length === 0 && (
            <span className="text-xs text-muted-foreground italic">No active work. Standing by.</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MachineItem({ machine }: { machine: Machine }) {
  return (
    <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center relative shadow-inner",
          machine.status === 'online' ? "bg-emerald-500/10 text-emerald-400" : 
          machine.status === 'working' ? "bg-primary/10 text-primary" :
          "bg-muted/50 text-muted-foreground"
        )}>
          <Laptop size={24} />
          {machine.status !== 'offline' && (
            <span className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
              machine.status === 'working' ? "bg-primary" : "bg-emerald-400"
            )} />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{machine.name}</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
            {machine.status === 'working' ? (
              <span className="flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                Executing {machine.activeTask}
              </span>
            ) : machine.status}
          </p>
        </div>
      </div>
      <button className="p-2 text-muted-foreground hover:text-foreground">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
