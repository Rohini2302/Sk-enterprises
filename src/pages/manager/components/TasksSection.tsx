import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Paperclip, 
  Download,
  Eye,
  Upload,
  MessageSquare,
  Calendar,
  User,
  Shield,
  Building,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { initialTasks, initialSites, Task, HourlyUpdate, Attachment, assignees } from "../data";
import { FormField, SearchBar } from "./shared";

// Mock current logged-in manager
const currentManager = {
  id: "manager-a",
  name: "Manager A",
  role: "manager",
  assignedSiteIds: ["1", "2"] // Sites assigned to this manager
};

// Mock supervisors assigned to sites
const siteSupervisors = [
  { siteId: "1", supervisorId: "supervisor-a", supervisorName: "Mike Johnson" },
  { siteId: "1", supervisorId: "supervisor-b", supervisorName: "Sarah Wilson" },
  { siteId: "2", supervisorId: "supervisor-a", supervisorName: "Mike Johnson" },
  { siteId: "2", supervisorId: "supervisor-c", supervisorName: "Emily Davis" },
  { siteId: "2", supervisorId: "site-manager-1", supervisorName: "Site Manager 1" }
];

const TasksSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showUpdatesDialog, setShowUpdatesDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [hourlyUpdateText, setHourlyUpdateText] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "my-tasks" | "assigned-to-supervisors">("all");

  // Get only sites assigned to current manager
  const assignedSites = initialSites.filter(site => 
    currentManager.assignedSiteIds.includes(site.id)
  );

  // Get supervisors for the selected site
  const getSupervisorsForSite = (siteId: string) => {
    return siteSupervisors
      .filter(s => s.siteId === siteId)
      .map(s => ({
        id: s.supervisorId,
        name: s.supervisorName
      }));
  };

  const handleAssignTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const assignedTo = formData.get("assign-to") as string;
    const selectedSiteId = formData.get("site") as string;
    const isAssigningToSelf = assignedTo === currentManager.id;
    
    // Verify the selected site is assigned to the manager
    if (!currentManager.assignedSiteIds.includes(selectedSiteId)) {
      toast.error("You can only assign tasks to sites assigned to you");
      return;
    }
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.get("task-title") as string,
      description: formData.get("description") as string,
      assignedTo: assignedTo,
      assignedBy: currentManager.id,
      priority: formData.get("priority") as "high" | "medium" | "low",
      status: "pending",
      deadline: formData.get("deadline") as string,
      dueDateTime: formData.get("due-datetime") as string,
      siteId: selectedSiteId,
      attachments: [],
      hourlyUpdates: []
    };

    setTasks(prev => [newTask, ...prev]);
    
    if (isAssigningToSelf) {
      toast.success("Task assigned to yourself successfully!");
    } else {
      const assigneeName = getAssigneeName(assignedTo);
      toast.success(`Task assigned to ${assigneeName} successfully!`);
    }
    
    setDialogOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Check if task exists and is in manager's assigned sites
    if (!task) {
      toast.error("Task not found");
      return;
    }
    
    // Check if task is in manager's assigned sites
    if (!currentManager.assignedSiteIds.includes(task.siteId)) {
      toast.error("You can only delete tasks from your assigned sites");
      return;
    }
    
    const isMyTask = task.assignedTo === currentManager.id;
    
    if (!isMyTask && task.assignedBy !== currentManager.id) {
      toast.error("You can only delete tasks you created or are assigned to you");
      return;
    }
    
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success("Task deleted successfully!");
  };

  const handleUpdateStatus = (taskId: string, status: Task["status"]) => {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      toast.error("Task not found");
      return;
    }
    
    // Check if task is in manager's assigned sites
    if (!currentManager.assignedSiteIds.includes(task.siteId)) {
      toast.error("You can only update tasks from your assigned sites");
      return;
    }
    
    // Check if user can update this task
    if (task.assignedTo !== currentManager.id && task.assignedBy !== currentManager.id) {
      toast.error("You can only update tasks assigned to you or created by you");
      return;
    }
    
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    toast.success("Task status updated!");
  };

  const handleAddHourlyUpdate = (taskId: string) => {
    if (!hourlyUpdateText.trim()) {
      toast.error("Please enter an update");
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      toast.error("Task not found");
      return;
    }
    
    // Check if task is in manager's assigned sites
    if (!currentManager.assignedSiteIds.includes(task.siteId)) {
      toast.error("You can only add updates to tasks from your assigned sites");
      return;
    }

    const newUpdate: HourlyUpdate = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      content: hourlyUpdateText,
      submittedBy: currentManager.id
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      toast.error("Task not found");
      return;
    }
    
    // Check if task is in manager's assigned sites
    if (!currentManager.assignedSiteIds.includes(task.siteId)) {
      toast.error("You can only upload files to tasks from your assigned sites");
      return;
    }
    
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

  const handleDeleteAttachment = (taskId: string, attachmentId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      toast.error("Task not found");
      return;
    }
    
    // Check if task is in manager's assigned sites
    if (!currentManager.assignedSiteIds.includes(task.siteId)) {
      toast.error("You can only delete attachments from tasks in your assigned sites");
      return;
    }
    
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

  // Filter tasks: only show tasks from manager's assigned sites
  const filteredTasks = tasks.filter(task => {
    if (!task) return false;
    
    // FIRST FILTER: Only show tasks from manager's assigned sites
    const isInAssignedSite = currentManager.assignedSiteIds.includes(task.siteId);
    if (!isInAssignedSite) return false;
    
    // Apply view mode filters
    if (viewMode === "my-tasks" && task.assignedTo !== currentManager.id) return false;
    if (viewMode === "assigned-to-supervisors" && task.assignedTo === currentManager.id) return false;
    
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSite = selectedSite === "all" || task.siteId === selectedSite;
    
    return matchesSearch && matchesSite;
  });

  const getPriorityColor = (priority: string) => {
    const colors = { high: "destructive", medium: "default", low: "secondary" };
    return colors[priority as keyof typeof colors] || "outline";
  };

  const getStatusColor = (status: string) => {
    const colors = { 
      completed: "default", 
      "in-progress": "default", 
      pending: "secondary" 
    };
    return colors[status as keyof typeof colors] || "outline";
  };

  const getAssigneeName = (assigneeId: string) => {
    const assignee = assignees.find(a => a.id === assigneeId);
    return assignee ? assignee.name : assigneeId;
  };

  const getSiteName = (siteId: string) => {
    const site = assignedSites.find(s => s.id === siteId);
    return site ? site.name : "Unknown Site";
  };

  const getClientName = (siteId: string) => {
    const site = assignedSites.find(s => s.id === siteId);
    return site ? site.clientName : "Unknown Client";
  };

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

  // Safe array access helper functions
  const getHourlyUpdatesCount = (task: Task) => {
    return (task.hourlyUpdates || []).length;
  };

  const getAttachmentsCount = (task: Task) => {
    return (task.attachments || []).length;
  };

  // Check if current user can modify a task
  const canModifyTask = (task: Task) => {
    return task.assignedTo === currentManager.id || task.assignedBy === currentManager.id;
  };

  // Get tasks assigned by current user to supervisors
  const tasksAssignedToSupervisors = tasks.filter(task => 
    task.assignedBy === currentManager.id && 
    task.assignedTo !== currentManager.id &&
    currentManager.assignedSiteIds.includes(task.siteId)
  );

  // Get tasks assigned to current user
  const myTasks = tasks.filter(task => 
    task.assignedTo === currentManager.id &&
    currentManager.assignedSiteIds.includes(task.siteId)
  );

  const AssignTaskDialog = ({ open, onOpenChange, onSubmit }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  }) => {
    const [selectedSiteId, setSelectedSiteId] = useState<string>("");
    
    // Get supervisors for selected site
    const availableSupervisors = selectedSiteId 
      ? getSupervisorsForSite(selectedSiteId)
      : [];

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Assign New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Assign task to yourself or to supervisors in your assigned sites
            </p>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Site" id="site" required>
                <Select 
                  name="site" 
                  required
                  value={selectedSiteId}
                  onValueChange={setSelectedSiteId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedSites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          <div>
                            <div>{site.name}</div>
                            <div className="text-xs text-muted-foreground">{site.clientName}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Only sites assigned to you
                </p>
              </FormField>

              <FormField label="Assign To" id="assign-to" required>
                <Select name="assign-to" required disabled={!selectedSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Assign to myself option */}
                    <SelectItem value={currentManager.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <div>
                          <div>{currentManager.name} (Yourself)</div>
                          <div className="text-xs text-muted-foreground">Manager</div>
                        </div>
                      </div>
                    </SelectItem>
                    
                    {/* Supervisors for selected site */}
                    {selectedSiteId && availableSupervisors.length > 0 && (
                      <>
                        <div className="border-t my-2"></div>
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                          Supervisors at {getSiteName(selectedSiteId)}
                        </div>
                        {availableSupervisors.map(supervisor => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              <div>
                                <div>{supervisor.name}</div>
                                <div className="text-xs text-muted-foreground">Supervisor</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {selectedSiteId && availableSupervisors.length === 0 && (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        No supervisors assigned to this site
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {!selectedSiteId ? "Select a site first" : "Assign to yourself or supervisors"}
                </p>
              </FormField>
            </div>

            <FormField label="Task Title" id="task-title" required>
              <Input id="task-title" name="task-title" placeholder="Enter task title" required />
            </FormField>

            <FormField label="Description" id="description" required>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Enter task description" 
                rows={3}
                required 
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Priority" id="priority" required>
                <Select name="priority" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Deadline Date" id="deadline" required>
                <Input 
                  id="deadline" 
                  name="deadline" 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Due Date & Time" id="due-datetime" required>
                <Input 
                  id="due-datetime" 
                  name="due-datetime" 
                  type="datetime-local" 
                  min={new Date().toISOString().slice(0, 16)}
                  required 
                />
              </FormField>

              <div className="flex items-end">
                <FormField label="Attachments" id="attachments">
                  <div className="flex items-center gap-2">
                    <Input 
                      id="attachments" 
                      type="file" 
                      multiple 
                      className="cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          toast.info(`${e.target.files.length} file(s) selected`);
                        }
                      }}
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Assignment Summary */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Assignment Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Assigned by</div>
                  <div className="font-medium flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    {currentManager.name}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Site</div>
                  <div className="font-medium flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    {selectedSiteId ? getSiteName(selectedSiteId) : "Not selected"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Available Supervisors</div>
                  <div className="font-medium">
                    {selectedSiteId ? availableSupervisors.length : "Select site"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Task Type</div>
                  <div className="font-medium">Site Assignment</div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!selectedSiteId}
            >
              Assign Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const HourlyUpdatesDialog = ({ task, open, onOpenChange }: { 
    task: Task; 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
  }) => {
    const hourlyUpdates = task.hourlyUpdates || [];
    const canAddUpdates = task.assignedTo === currentManager.id || task.assignedBy === currentManager.id;
    
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
                  <div className="text-sm font-medium">Assigned to: {getAssigneeName(task.assignedTo)}</div>
                  {task.assignedBy && (
                    <div className="text-xs text-muted-foreground">
                      Assigned by: {getAssigneeName(task.assignedBy)}
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
                          <div className="font-medium">{getAssigneeName(update.submittedBy)}</div>
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

  const AttachmentsDialog = ({ task, open, onOpenChange }: { 
    task: Task; 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
  }) => {
    const attachments = task.attachments || [];
    const canUploadFiles = task.assignedTo === currentManager.id || task.assignedBy === currentManager.id;
    
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
                <span className="text-sm">{getAssigneeName(task.assignedTo)}</span>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Task Management</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium text-blue-600">{currentManager.name}</span>
                </p>
                <Badge variant="outline" className="ml-2">
                  Manager
                </Badge>
              </div>
            </div>
            <AssignTaskDialog 
              open={dialogOpen} 
              onOpenChange={setDialogOpen} 
              onSubmit={handleAssignTask} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Manager Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">My Tasks</p>
                      <p className="text-2xl font-bold text-blue-900">{myTasks.length}</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Tasks assigned to you
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Assigned to Supervisors</p>
                      <p className="text-2xl font-bold text-green-900">{tasksAssignedToSupervisors.length}</p>
                    </div>
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Tasks you delegated
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Assigned Sites</p>
                      <p className="text-2xl font-bold text-purple-900">{assignedSites.length}</p>
                    </div>
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    Sites under your management
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="Search tasks in your assigned sites..." 
                />
              </div>
              <div className="flex gap-2">
                <Select value={viewMode} onValueChange={(value: "all" | "my-tasks" | "assigned-to-supervisors") => setViewMode(value)}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="View mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks in My Sites</SelectItem>
                    <SelectItem value="my-tasks">My Tasks Only</SelectItem>
                    <SelectItem value="assigned-to-supervisors">Tasks to Supervisors</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All My Sites</SelectItem>
                    {assignedSites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          {site.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tasks Table */}
            {filteredTasks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Tasks Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {viewMode === "my-tasks" 
                      ? "You don't have any tasks assigned to you."
                      : viewMode === "assigned-to-supervisors"
                      ? "You haven't assigned any tasks to supervisors yet."
                      : "No tasks found in your assigned sites."}
                  </p>
                  <AssignTaskDialog 
                    open={dialogOpen} 
                    onOpenChange={setDialogOpen} 
                    onSubmit={handleAssignTask} 
                  />
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Details</TableHead>
                    <TableHead>Site & Client</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date & Time</TableHead>
                    <TableHead>Updates</TableHead>
                    <TableHead>Attachments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const isMyTask = task.assignedTo === currentManager.id;
                    const isAssignedByMe = task.assignedBy === currentManager.id;
                    const canModify = canModifyTask(task);
                    
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{task.title || "Untitled Task"}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
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
                                <Shield className="h-4 w-4 text-blue-600" />
                              ) : (
                                <User className="h-4 w-4 text-green-600" />
                              )}
                              <span className="font-medium">{getAssigneeName(task.assignedTo)}</span>
                              {isMyTask && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  You
                                </Badge>
                              )}
                            </div>
                            {task.assignedBy && (
                              <div className="text-xs text-muted-foreground">
                                By: {getAssigneeName(task.assignedBy)}
                                {isAssignedByMe && " (You)"}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(task.priority) as "default" | "destructive" | "outline" | "secondary"}>
                            {task.priority === "high" && <AlertCircle className="mr-1 h-3 w-3" />}
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(task.status) as "default" | "destructive" | "outline" | "secondary"}>
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
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {canModify && task.status !== "completed" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleUpdateStatus(task.id, "in-progress")}
                                  disabled={task.status === "in-progress"}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleUpdateStatus(task.id, "completed")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {canModify && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>

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

export default TasksSection;