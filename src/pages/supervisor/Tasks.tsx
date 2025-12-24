import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  User,
  Building,
  Users,
  AlertCircle,
  Calendar,
  MessageSquare,
  Paperclip,
  Eye,
  Download,
  Upload
} from "lucide-react";
import { toast } from "sonner";

// Define types for the data
interface Attachment {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  size: number;
  type: string;
}

interface HourlyUpdate {
  id: string;
  timestamp: string;
  content: string;
  submittedBy: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  deadline: string;
  dueDateTime: string;
  siteId: string;
  attachments: Attachment[];
  hourlyUpdates: HourlyUpdate[];
}

// Mock sites data
const initialSites = [
  { id: "1", name: "Tech Park Building", clientName: "Tech Solutions Inc.", status: "active", staffDeployment: [{ role: "Security Guard", count: 2 }, { role: "Housekeeping", count: 1 }] },
  { id: "2", name: "Green Valley Mall", clientName: "Green Valley Group", status: "active", staffDeployment: [{ role: "Security Guard", count: 3 }, { role: "Supervisor", count: 1 }, { role: "Housekeeping", count: 2 }] },
  { id: "3", name: "Corporate Tower", clientName: "Global Corp", status: "inactive", staffDeployment: [{ role: "Security Guard", count: 4 }, { role: "Supervisor", count: 1 }] },
];

// Mock tasks data
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Security Patrol - Night Shift",
    description: "Complete nightly security patrols around the perimeter",
    assignedTo: "EMP001",
    assignedBy: "supervisor-a",
    priority: "high",
    status: "pending",
    deadline: "2024-01-20",
    dueDateTime: "2024-01-20T23:00:00",
    siteId: "1",
    attachments: [],
    hourlyUpdates: []
  },
  {
    id: "2",
    title: "Lobby Cleaning",
    description: "Thorough cleaning of main lobby area",
    assignedTo: "EMP002",
    assignedBy: "supervisor-a",
    priority: "medium",
    status: "in-progress",
    deadline: "2024-01-18",
    dueDateTime: "2024-01-18T14:00:00",
    siteId: "1",
    attachments: [],
    hourlyUpdates: []
  },
  {
    id: "3",
    title: "Security Check - Morning",
    description: "Morning security check of all entry points",
    assignedTo: "supervisor-a",
    assignedBy: "admin-1",
    priority: "high",
    status: "completed",
    deadline: "2024-01-15",
    dueDateTime: "2024-01-15T09:00:00",
    siteId: "2",
    attachments: [],
    hourlyUpdates: []
  },
  {
    id: "4",
    title: "Parking Lot Inspection",
    description: "Inspect parking lot security cameras",
    assignedTo: "EMP004",
    assignedBy: "supervisor-a",
    priority: "low",
    status: "pending",
    deadline: "2024-01-22",
    dueDateTime: "2024-01-22T16:00:00",
    siteId: "2",
    attachments: [],
    hourlyUpdates: []
  },
  {
    id: "5",
    title: "Emergency Drill Preparation",
    description: "Prepare for monthly emergency drill",
    assignedTo: "supervisor-a",
    assignedBy: "admin-1",
    priority: "high",
    status: "in-progress",
    deadline: "2024-01-25",
    dueDateTime: "2024-01-25T10:00:00",
    siteId: "2",
    attachments: [],
    hourlyUpdates: []
  }
];

// Mock current logged-in supervisor
const currentSupervisor = {
  id: "supervisor-a",
  name: "Mike Johnson",
  role: "supervisor",
  assignedSiteIds: ["1", "2"], // Sites assigned to this supervisor
  managedStaff: ["EMP001", "EMP002", "EMP004", "EMP005"] // Staff IDs managed by this supervisor
};

// Mock staff members for the supervisor
const supervisorStaff = [
  { id: "EMP001", name: "Rajesh Kumar", role: "Security Guard", siteId: "1" },
  { id: "EMP002", name: "Priya Sharma", role: "Housekeeping", siteId: "1" },
  { id: "EMP003", name: "Amit Patel", role: "Supervisor", siteId: "2" },
  { id: "EMP004", name: "Sunita Reddy", role: "Security Guard", siteId: "2" },
  { id: "EMP005", name: "Mohan Das", role: "Housekeeping", siteId: "2" }
];

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showUpdatesDialog, setShowUpdatesDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [hourlyUpdateText, setHourlyUpdateText] = useState("");
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    deadline: "",
    dueDateTime: "",
    siteId: ""
  });

  // Get sites assigned to this supervisor
  const assignedSites = initialSites.filter(site => 
    currentSupervisor.assignedSiteIds.includes(site.id)
  );

  // Get staff managed by this supervisor (only for assigned sites)
  const managedStaff = supervisorStaff.filter(staff => 
    currentSupervisor.managedStaff.includes(staff.id) && 
    currentSupervisor.assignedSiteIds.includes(staff.siteId)
  );

  // Filter tasks to show only those assigned to supervisor or assigned by supervisor to their staff
  const filteredTasks = tasks.filter(task => {
    if (!task) return false;
    
    // Show tasks assigned to supervisor OR tasks assigned by supervisor to their staff
    const isAssignedToSupervisor = task.assignedTo === currentSupervisor.id;
    const isAssignedBySupervisor = task.assignedBy === currentSupervisor.id;
    const isAssignedToManagedStaff = managedStaff.some(staff => staff.id === task.assignedTo);
    
    if (!(isAssignedToSupervisor || isAssignedBySupervisor || isAssignedToManagedStaff)) {
      return false;
    }
    
    // Check if task site is in supervisor's assigned sites
    if (!currentSupervisor.assignedSiteIds.includes(task.siteId)) {
      return false;
    }
    
    // Apply status filter
    if (filter !== "all" && task.status !== filter) return false;
    
    // Apply site filter
    if (selectedSite !== "all" && task.siteId !== selectedSite) return false;
    
    // Apply search filter
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Get staff for a specific site
  const getStaffForSite = (siteId: string) => {
    return managedStaff.filter(staff => staff.siteId === siteId);
  };

  // Get site name
  const getSiteName = (siteId: string) => {
    const site = assignedSites.find(s => s.id === siteId);
    return site ? site.name : "Unknown Site";
  };

  // Get client name
  const getClientName = (siteId: string) => {
    const site = assignedSites.find(s => s.id === siteId);
    return site ? site.clientName : "Unknown Client";
  };

  // Get staff name
  const getStaffName = (staffId: string) => {
    const staff = managedStaff.find(s => s.id === staffId);
    return staff ? staff.name : staffId;
  };

  // Get staff role
  const getStaffRole = (staffId: string) => {
    const staff = managedStaff.find(s => s.id === staffId);
    return staff ? staff.role : "Staff";
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = { high: "destructive", medium: "default", low: "secondary" };
    return colors[priority as keyof typeof colors] || "outline";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = { 
      completed: "default", 
      "in-progress": "default", 
      pending: "secondary" 
    };
    return colors[status as keyof typeof colors] || "outline";
  };

  // Format date time
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "No date set";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  // Add new task
  const addTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.deadline || !newTask.siteId) {
      toast.error("Please fill all required fields");
      return;
    }

    // Check if selected site is assigned to supervisor
    if (!currentSupervisor.assignedSiteIds.includes(newTask.siteId)) {
      toast.error("You can only assign tasks to your assigned sites");
      return;
    }

    // Check if assigned staff is managed by supervisor
    if (newTask.assignedTo !== currentSupervisor.id && !managedStaff.some(staff => staff.id === newTask.assignedTo)) {
      toast.error("You can only assign tasks to yourself or your managed staff");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: currentSupervisor.id,
      priority: newTask.priority as "high" | "medium" | "low",
      status: "pending",
      deadline: newTask.deadline,
      dueDateTime: newTask.dueDateTime,
      siteId: newTask.siteId,
      attachments: [],
      hourlyUpdates: []
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      deadline: "",
      dueDateTime: "",
      siteId: ""
    });
    setShowAddForm(false);
    toast.success("Task assigned successfully!");
  };

  // Update task status
  const updateStatus = (id: string, newStatus: Task["status"]) => {
    const task = tasks.find(t => t.id === id);
    
    // Check permissions
    if (!task) return;
    
    if (task.assignedTo !== currentSupervisor.id && task.assignedBy !== currentSupervisor.id) {
      toast.error("You can only update tasks assigned to you or created by you");
      return;
    }
    
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
    toast.success(`Task marked as ${newStatus}`);
  };

  // Start task
  const startTask = (id: string) => {
    updateStatus(id, "in-progress");
  };

  // Complete task
  const completeTask = (id: string) => {
    updateStatus(id, "completed");
  };

  // Delete task
  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    
    if (!task) return;
    
    // Check permissions
    if (task.assignedTo !== currentSupervisor.id && task.assignedBy !== currentSupervisor.id) {
      toast.error("You can only delete tasks assigned to you or created by you");
      return;
    }
    
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(task => task.id !== id));
      toast.success("Task deleted successfully!");
    }
  };

  // Add hourly update
  const handleAddHourlyUpdate = (taskId: string) => {
    if (!hourlyUpdateText.trim()) {
      toast.error("Please enter an update");
      return;
    }

    const newUpdate: HourlyUpdate = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      content: hourlyUpdateText,
      submittedBy: currentSupervisor.id
    };

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const currentUpdates = task.hourlyUpdates || [];
        return { 
          ...task, 
          hourlyUpdates: [...currentUpdates, newUpdate] 
        };
      }
      return task;
    }));

    setHourlyUpdateText("");
    toast.success("Hourly update added!");
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      filename: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type
    }));

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const currentAttachments = task.attachments || [];
        return { 
          ...task, 
          attachments: [...currentAttachments, ...newAttachments] 
        };
      }
      return task;
    }));

    toast.success(`${files.length} file(s) uploaded successfully!`);
  };

  // Delete attachment
  const handleDeleteAttachment = (taskId: string, attachmentId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const currentAttachments = task.attachments || [];
        return { 
          ...task, 
          attachments: currentAttachments.filter(a => a.id !== attachmentId) 
        };
      }
      return task;
    }));
    toast.success("Attachment deleted!");
  };

  // Get hourly updates count
  const getHourlyUpdatesCount = (task: Task) => {
    return (task.hourlyUpdates || []).length;
  };

  // Get attachments count
  const getAttachmentsCount = (task: Task) => {
    return (task.attachments || []).length;
  };

  // Check if user can modify a task
  const canModifyTask = (task: Task) => {
    return task.assignedTo === currentSupervisor.id || task.assignedBy === currentSupervisor.id;
  };

  // Stats
  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === "pending").length,
    inProgress: filteredTasks.filter(t => t.status === "in-progress").length,
    completed: filteredTasks.filter(t => t.status === "completed").length,
    myTasks: filteredTasks.filter(t => t.assignedTo === currentSupervisor.id).length,
    assignedToStaff: filteredTasks.filter(t => t.assignedBy === currentSupervisor.id && t.assignedTo !== currentSupervisor.id).length
  };

  // Get site staff deployment summary
  const getSiteStaffSummary = (siteId: string) => {
    const site = assignedSites.find(s => s.id === siteId);
    if (!site || !site.staffDeployment) return "No staff data";
    
    const totalStaff = site.staffDeployment.reduce((sum, item) => sum + item.count, 0);
    const managedStaffCount = managedStaff.filter(staff => staff.siteId === siteId).length;
    
    return `${managedStaffCount}/${totalStaff} staff managed`;
  };

  // Hourly Updates Dialog Component
  const HourlyUpdatesDialog = ({ task, open, onOpenChange }: { 
    task: Task; 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
  }) => {
    const hourlyUpdates = task.hourlyUpdates || [];
    const canAddUpdates = task.assignedTo === currentSupervisor.id || task.assignedBy === currentSupervisor.id;
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Hourly Updates for: {task.title || "Untitled Task"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Assigned to: {getStaffName(task.assignedTo)}</div>
                  {task.assignedBy && (
                    <div className="text-xs text-muted-foreground">
                      Assigned by: {getStaffName(task.assignedBy)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{getSiteName(task.siteId)}</div>
                  <div className="text-xs text-muted-foreground">{getClientName(task.siteId)}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {hourlyUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hourly updates yet
                </div>
              ) : (
                hourlyUpdates.map((update, index) => (
                  <div key={update.id || `update-${index}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{getStaffName(update.submittedBy)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(update.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Update #{hourlyUpdates.length - index}
                      </Badge>
                    </div>
                    <p className="text-sm">{update.content}</p>
                  </div>
                ))
              )}
            </div>

            {canAddUpdates && (
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Add a new hourly update..."
                  value={hourlyUpdateText}
                  onChange={(e) => setHourlyUpdateText(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <Button 
                  onClick={() => handleAddHourlyUpdate(task.id)}
                  className="w-full"
                >
                  Add Hourly Update
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Attachments Dialog Component
  const AttachmentsDialog = ({ task, open, onOpenChange }: { 
    task: Task; 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
  }) => {
    const attachments = task.attachments || [];
    const canUploadFiles = task.assignedTo === currentSupervisor.id || task.assignedBy === currentSupervisor.id;
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments for: {task.title || "Untitled Task"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{getStaffName(task.assignedTo)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <div>
                  <span className="text-sm">{getSiteName(task.siteId)}</span>
                  <div className="text-xs text-muted-foreground">{getClientName(task.siteId)}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {attachments.length} file(s) attached
              </span>
              {canUploadFiles && (
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Files
                      <Input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, task.id)}
                      />
                    </div>
                  </Button>
                </label>
              )}
            </div>
            
            <div className="space-y-3">
              {attachments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attachments yet
                </div>
              ) : (
                attachments.map((attachment) => (
                  <div key={attachment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{attachment.filename || "Unnamed file"}</div>
                          <div className="text-xs text-muted-foreground">
                            {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : "Unknown size"} • {formatDateTime(attachment.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = attachment.url;
                            link.download = attachment.filename || 'download';
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {canUploadFiles && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttachment(task.id, attachment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Supervisor Header */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-green-600">{currentSupervisor.name}</span>
              </p>
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                Supervisor
              </Badge>
            </div>
          </div>
          
          {/* Add Task Dialog */}
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Assign task to yourself or your staff members
                </p>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Task Details */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Title *</label>
                  <Input
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Description</label>
                  <Textarea
                    placeholder="Describe the task details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Site Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site *</label>
                  <Select 
                    value={newTask.siteId} 
                    onValueChange={(value) => {
                      setNewTask({...newTask, siteId: value, assignedTo: ""});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedSites.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <div>
                              <div>{site.name}</div>
                              <div className="text-xs text-muted-foreground">{site.clientName}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Staff Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To *</label>
                  <Select 
                    value={newTask.assignedTo} 
                    onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                    disabled={!newTask.siteId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={newTask.siteId ? "Select staff" : "Select site first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Assign to self */}
                      <SelectItem value={currentSupervisor.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          <div>
                            <div>{currentSupervisor.name} (Yourself)</div>
                            <div className="text-xs text-muted-foreground">Supervisor</div>
                          </div>
                        </div>
                      </SelectItem>
                      
                      {/* Staff at selected site */}
                      {newTask.siteId && getStaffForSite(newTask.siteId).length > 0 && (
                        <>
                          <div className="border-t my-2"></div>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                            Staff at {getSiteName(newTask.siteId)}
                          </div>
                          {getStaffForSite(newTask.siteId).map(staff => (
                            <SelectItem key={staff.id} value={staff.id}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div>{staff.name}</div>
                                  <div className="text-xs text-muted-foreground">{staff.role}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      
                      {newTask.siteId && getStaffForSite(newTask.siteId).length === 0 && (
                        <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                          No staff assigned to this site
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority and Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline *</label>
                    <Input
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    />
                  </div>
                </div>

                {/* Due Date Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newTask.dueDateTime}
                    onChange={(e) => setNewTask({...newTask, dueDateTime: e.target.value})}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={addTask} className="flex-1">
                    Assign Task
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Supervisor Dashboard Summary */}
        <div className="grid gap-4 md:grid-cols-6 mb-6">
          <StatCard 
            title="My Tasks" 
            value={stats.myTasks} 
            icon={<User className="h-4 w-4 text-blue-600" />}
            color="bg-blue-50 border-blue-200"
          />
          <StatCard 
            title="Assigned to Staff" 
            value={stats.assignedToStaff} 
            icon={<Users className="h-4 w-4 text-green-600" />}
            color="bg-green-50 border-green-200"
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            icon={<AlertCircle className="h-4 w-4 text-orange-600" />}
            color="bg-orange-50 border-orange-200"
          />
          <StatCard 
            title="In Progress" 
            value={stats.inProgress} 
            icon={<Clock className="h-4 w-4 text-purple-600" />}
            color="bg-purple-50 border-purple-200"
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            color="bg-green-50 border-green-200"
          />
          <StatCard 
            title="Assigned Sites" 
            value={assignedSites.length} 
            icon={<Building className="h-4 w-4 text-amber-600" />}
            color="bg-amber-50 border-amber-200"
          />
        </div>

        {/* Assigned Sites with Staff Deployment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              My Assigned Sites & Staff Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignedSites.map(site => (
                <div key={site.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">{site.name}</h3>
                      <div className="text-xs text-muted-foreground">{site.clientName}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {site.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">Staff Deployment</div>
                      <div className="text-sm text-muted-foreground">
                        {getSiteStaffSummary(site.id)}
                      </div>
                      {site.staffDeployment && site.staffDeployment.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {site.staffDeployment.map((deploy, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{deploy.role}:</span>
                              <span>{deploy.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">My Managed Staff</div>
                      <div className="space-y-1">
                        {getStaffForSite(site.id).map(staff => (
                          <div key={staff.id} className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-green-600" />
                            <span>{staff.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {staff.role}
                            </Badge>
                          </div>
                        ))}
                        {getStaffForSite(site.id).length === 0 && (
                          <div className="text-sm text-muted-foreground">No staff managed</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Tasks:</span>
                        <span>{filteredTasks.filter(t => t.siteId === site.id).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by title, description, or assignee..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-[180px]">
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {assignedSites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Tasks Found</h3>
                <p className="mb-4">
                  {searchQuery 
                    ? "No tasks match your search criteria"
                    : "You don't have any tasks assigned yet"}
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Your First Task
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Details</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date & Time</TableHead>
                    <TableHead>Updates</TableHead>
                    <TableHead>Attachments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map(task => {
                    const isMyTask = task.assignedTo === currentSupervisor.id;
                    const canModify = canModifyTask(task);
                    
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{task.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {task.description || "No description"}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span className="font-medium">{getSiteName(task.siteId)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getClientName(task.siteId)}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isMyTask ? (
                                <User className="h-4 w-4 text-green-600" />
                              ) : (
                                <Users className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="font-medium">{getStaffName(task.assignedTo)}</span>
                              {isMyTask && (
                                <Badge variant="outline" className="text-xs bg-green-50">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getStaffRole(task.assignedTo)}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority === "high" && <AlertCircle className="mr-1 h-3 w-3" />}
                            {task.priority}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.deadline || "No deadline"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.dueDateTime ? formatDateTime(task.dueDateTime) : "No due time"}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowUpdatesDialog(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            {getHourlyUpdatesCount(task)}
                            <span className="sr-only">View updates</span>
                          </Button>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowAttachmentsDialog(true);
                            }}
                          >
                            <Paperclip className="h-4 w-4" />
                            {getAttachmentsCount(task)}
                            <span className="sr-only">View attachments</span>
                          </Button>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Status Action Buttons */}
                            {canModify && task.status === "pending" && (
                              <Button size="sm" onClick={() => startTask(task.id)}>
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            
                            {canModify && task.status === "in-progress" && (
                              <Button size="sm" onClick={() => completeTask(task.id)}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            {task.status === "completed" && (
                              <Badge className="bg-green-100 text-green-800">
                                Done ✓
                              </Badge>
                            )}

                            {/* Delete Button */}
                            {canModify && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteTask(task.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {selectedTask && (
        <>
          <HourlyUpdatesDialog
            task={selectedTask}
            open={showUpdatesDialog}
            onOpenChange={setShowUpdatesDialog}
          />
          <AttachmentsDialog
            task={selectedTask}
            open={showAttachmentsDialog}
            onOpenChange={setShowAttachmentsDialog}
          />
        </>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color = "bg-background" }: { title: string; value: number; icon: React.ReactNode; color?: string }) => (
  <Card className={color}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default Tasks;