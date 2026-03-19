export interface Project {
  id: string;
  name: string;
  github: string;
  netlify: string;
  status: 'online' | 'error' | 'building';
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; // Machine ID
}

export interface Machine {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'working';
  lastSeen: string;
  activeTask?: string;
}

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Nascent Event',
    github: 'https://github.com/user/nascent-event',
    netlify: 'https://nascent-event.netlify.app',
    status: 'online',
    tasks: [
      { id: 't1', title: 'Implement Dashboard UI', description: 'Create a premium dashboard with Next.js', status: 'in-progress', priority: 'high', assignedTo: 'macbook-1' },
      { id: 't2', title: 'Connect to GitHub API', description: 'Fetch latest commits and PRs', status: 'todo', priority: 'medium' },
    ]
  },
  {
    id: 'p2',
    name: 'Social Media Automation',
    github: 'https://github.com/user/social-automation',
    netlify: 'https://social-automation.netlify.app',
    status: 'building',
    tasks: [
      { id: 't3', title: 'Fix Google Drive Auth', description: 'Resolve token refresh issues', status: 'review', priority: 'high', assignedTo: 'macbook-2' },
    ]
  }
];

export const mockMachines: Machine[] = [
  { id: 'macbook-1', name: 'Laptop Pro 16"', status: 'working', lastSeen: '2026-03-19T03:00:00Z', activeTask: 't1' },
  { id: 'macbook-2', name: 'MacBook Air M2', status: 'online', lastSeen: '2026-03-19T03:05:00Z', activeTask: 't3' },
  { id: 'macbook-3', name: 'Workstation Home', status: 'offline', lastSeen: '2026-03-18T20:00:00Z' },
  { id: 'macbook-4', name: 'Travel Laptop', status: 'online', lastSeen: '2026-03-19T02:45:00Z' },
];
