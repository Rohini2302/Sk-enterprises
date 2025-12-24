import { useState, useCallback, useMemo, memo } from "react";
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
  Globe,
  Building,
  Briefcase,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { initialTasks, initialSites, Task, HourlyUpdate, Attachment, assignees } from "../data";
import { FormField, SearchBar } from "./shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Memoized components to prevent unnecessary re-renders
const SiteCheckboxItem = memo(({ 
  site, 
  isSelected, 
  onToggle 
}: { 
  site: { id: string; name: string; clientName: string; location: string; status: string };
  isSelected: boolean;
  onToggle: (siteId: string) => void;
}) => (
  <div key={site.id} className="flex items-center space-x-3">
    <Checkbox 
      id={`site-${site.id}`}
      checked={isSelected}
      onCheckedChange={() => onToggle(site.id)}
    />
    <label
      htmlFor={`site-${site.id}`}
      className="flex-1 cursor-pointer"
    >
      <div className="flex flex-col">
        <span className="font-medium">{site.name}</span>
        <span className="text-sm text-muted-foreground">
          {site.clientName} • {site.location}
        </span>
      </div>
    </label>
    <Badge variant={site.status === "active" ? "default" : "secondary"}>
      {site.status}
    </Badge>
  </div>
));

SiteCheckboxItem.displayName = "SiteCheckboxItem";

const AssigneeCheckboxItem = memo(({ 
  assignee, 
  isSelected, 
  taskCount,
  onToggle 
}: { 
  assignee: { id: string; name: string };
  isSelected: boolean;
  taskCount: number;
  onToggle: (assigneeId: string) => void;
}) => {
  const assigneeType = assignee.id.includes("manager") ? "Manager" : "Supervisor";
  
  return (
    <div className="flex items-center space-x-3">
      <Checkbox 
        id={`assignee-${assignee.id}`}
        checked={isSelected}
        onCheckedChange={() => onToggle(assignee.id)}
      />
      <label
        htmlFor={`assignee-${assignee.id}`}
        className="flex-1 cursor-pointer"
      >
        <div className="flex flex-col">
          <span className="font-medium">{assignee.name}</span>
          <span className="text-xs text-muted-foreground">
            {assigneeType}
          </span>
        </div>
      </label>
      <Badge variant="outline" className="text-xs">
        {taskCount} tasks
      </Badge>
    </div>
  );
});

AssigneeCheckboxItem.displayName = "AssigneeCheckboxItem";

const TasksSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showUpdatesDialog, setShowUpdatesDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [hourlyUpdateText, setHourlyUpdateText] = useState("");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [assigneeType, setAssigneeType] = useState<"all" | "manager" | "supervisor">("all");

  // Memoize filtered assignees
  const filteredAssignees = useMemo(() => {
    return assignees.filter(assignee => {
      if (assigneeType === "all") return true;
      if (assigneeType === "manager") return assignee.id.includes("manager");
      if (assigneeType === "supervisor") return assignee.id.includes("supervisor");
      return true;
    });
  }, [assigneeType]);

  // Memoize managers and supervisors
  const managers = useMemo(() => 
    assignees.filter(a => a.id.includes("manager")), 
  []);
  
  const supervisorsList = useMemo(() => 
    assignees.filter(a => a.id.includes("supervisor")), 
  []);

  // Memoize task counts
  const taskCountsByAssignee = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      counts[task.assignedTo] = (counts[task.assignedTo] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  // Use useCallback for event handlers
  const handleAssignTask = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sites = selectedSites.length > 0 ? selectedSites : [formData.get("site") as string];
    
    if (sites.length === 0) {
      toast.error("Please select at least one site");
      return;
    }

    if (!selectedAssignee) {
      toast.error("Please select an assignee");
      return;
    }

    const newTasks: Task[] = sites.map((siteId, index) => {
      const site = initialSites.find(s => s.id === siteId);
      const siteName = site ? site.name : "Unknown Site";
      const clientName = site ? site.clientName : "Unknown Client";
      
      return {
        id: (Date.now() + index).toString(),
        title: formData.get("task-title") as string,
        description: formData.get("description") as string,
        assignedTo: selectedAssignee,
        priority: formData.get("priority") as "high" | "medium" | "low",
        status: "pending",
        deadline: formData.get("deadline") as string,
        dueDateTime: formData.get("due-datetime") as string,
        siteId: siteId,
        siteName: siteName,
        clientName: clientName,
        attachments: [],
        hourlyUpdates: []
      };
    });

    setTasks(prev => [...newTasks, ...prev]);
    toast.success(`Task assigned to ${newTasks.length} site(s) successfully!`);
    setDialogOpen(false);
    setSelectedSites([]);
    setSelectedAssignee("");
    setAssigneeType("all");
    (e.target as HTMLFormElement).reset();
  }, [selectedSites, selectedAssignee]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success("Task deleted successfully!");
  }, []);

  const handleUpdateStatus = useCallback((taskId: string, status: Task["status"]) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    toast.success("Task status updated!");
  }, []);

  const handleAddHourlyUpdate = useCallback((taskId: string) => {
    if (!hourlyUpdateText.trim()) {
      toast.error("Please enter an update");
      return;
    }

    const newUpdate: HourlyUpdate = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      content: hourlyUpdateText,
      submittedBy: "current-user"
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
  }, [hourlyUpdateText]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
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
  }, []);

  const handleDeleteAttachment = useCallback((taskId: string, attachmentId: string) => {
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
  }, []);

  // Filter tasks with useMemo
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task) return false;
      
      const matchesSearch = 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSite = selectedSite === "all" || task.siteId === selectedSite;
      
      return matchesSearch && matchesSite;
    });
  }, [tasks, searchQuery, selectedSite]);

  const getPriorityColor = useCallback((priority: string) => {
    const colors = { high: "destructive", medium: "default", low: "secondary" };
    return colors[priority as keyof typeof colors] || "outline";
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colors = { 
      completed: "default", 
      "in-progress": "default", 
      pending: "secondary" 
    };
    return colors[status as keyof typeof colors] || "outline";
  }, []);

  const getAssigneeName = useCallback((assigneeId: string) => {
    const assignee = assignees.find(a => a.id === assigneeId);
    return assignee ? assignee.name : assigneeId;
  }, []);

  const getAssigneeType = useCallback((assigneeId: string) => {
    if (assigneeId.includes("manager")) return "Manager";
    if (assigneeId.includes("supervisor")) return "Supervisor";
    return "Staff";
  }, []);

  const getSiteName = useCallback((siteId: string) => {
    const site = initialSites.find(s => s.id === siteId);
    return site ? site.name : "Unknown Site";
  }, []);

  const getClientName = useCallback((siteId: string) => {
    const site = initialSites.find(s => s.id === siteId);
    return site ? site.clientName : "Unknown Client";
  }, []);

  const formatDateTime = useCallback((dateTimeString: string) => {
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
  }, []);

  const getHourlyUpdatesCount = useCallback((task: Task) => {
    return (task.hourlyUpdates || []).length;
  }, []);

  const getAttachmentsCount = useCallback((task: Task) => {
    return (task.attachments || []).length;
  }, []);

  const handleSiteSelection = useCallback((siteId: string) => {
    setSelectedSites(prev => {
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      } else {
        return [...prev, siteId];
      }
    });
  }, []);

  const handleSelectAllSites = useCallback(() => {
    setSelectedSites(prev => {
      if (prev.length === initialSites.length) {
        return [];
      } else {
        return initialSites.map(site => site.id);
      }
    });
  }, []);

  const handleAssigneeSelection = useCallback((assigneeId: string) => {
    setSelectedAssignee(prev => prev === assigneeId ? "" : assigneeId);
  }, []);

  // Memoized AssignTaskDialog to prevent re-renders
  const AssignTaskDialog = useMemo(() => {
    return ({ open, onOpenChange, onSubmit }: { 
      open: boolean; 
      onOpenChange: (open: boolean) => void;
      onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    }) => (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Assign Task
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Assignee Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Select Assignee</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  type="button"
                  variant={assigneeType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssigneeType("all")}
                  className="flex items-center gap-2"
                >
                  <Users className="h-3 w-3" />
                  All
                </Button>
                <Button
                  type="button"
                  variant={assigneeType === "manager" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssigneeType("manager")}
                  className="flex items-center gap-2"
                >
                  <Briefcase className="h-3 w-3" />
                  Managers
                </Button>
                <Button
                  type="button"
                  variant={assigneeType === "supervisor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssigneeType("supervisor")}
                  className="flex items-center gap-2"
                >
                  <User className="h-3 w-3" />
                  Supervisors
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Managers Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <Label className="font-medium">Managers</Label>
                    </div>
                    {managers.map(manager => (
                      <AssigneeCheckboxItem
                        key={manager.id}
                        assignee={manager}
                        isSelected={selectedAssignee === manager.id}
                        taskCount={taskCountsByAssignee[manager.id] || 0}
                        onToggle={handleAssigneeSelection}
                      />
                    ))}
                  </div>

                  {/* Supervisors Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <Label className="font-medium">Supervisors</Label>
                    </div>
                    {supervisorsList.map(supervisor => (
                      <AssigneeCheckboxItem
                        key={supervisor.id}
                        assignee={supervisor}
                        isSelected={selectedAssignee === supervisor.id}
                        taskCount={taskCountsByAssignee[supervisor.id] || 0}
                        onToggle={handleAssigneeSelection}
                      />
                    ))}
                  </div>
                </div>
                
                {!selectedAssignee && (
                  <div className="text-center py-4 text-muted-foreground border-t mt-4">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No assignee selected. Select a manager or supervisor.</p>
                  </div>
                )}

                {selectedAssignee && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">Selected Assignee:</span>
                      <span className="ml-auto font-semibold">
                        {getAssigneeName(selectedAssignee)}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getAssigneeType(selectedAssignee)}
                        </Badge>
                      </span>
                    </div>
                  </div>
                )}
              </div>
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

            {/* Site Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="font-medium">Select Sites</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedSites.length} selected
                  </Badge>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAllSites}
                >
                  {selectedSites.length === initialSites.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-3">
                  {initialSites.map(site => (
                    <SiteCheckboxItem
                      key={site.id}
                      site={site}
                      isSelected={selectedSites.includes(site.id)}
                      onToggle={handleSiteSelection}
                    />
                  ))}
                </div>
                
                {selectedSites.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sites selected. Select sites to assign the task.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <FormField label="Due Date & Time" id="due-datetime" required>
                <Input 
                  id="due-datetime" 
                  name="due-datetime" 
                  type="datetime-local" 
                  min={new Date().toISOString().slice(0, 16)}
                  required 
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Task Type" id="task-type">
                <Select name="task-type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="safety">Safety Check</SelectItem>
                    <SelectItem value="equipment">Equipment Check</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

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

            {/* Assignment Summary */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-medium">Assignment Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Assignee</div>
                  <div className="font-medium flex items-center gap-2">
                    {selectedAssignee ? (
                      <>
                        <User className="h-3 w-3" />
                        {getAssigneeName(selectedAssignee)}
                        <Badge variant="secondary" className="text-xs">
                          {getAssigneeType(selectedAssignee)}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-amber-600">Not selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Sites Selected</div>
                  <div className="font-medium flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    {selectedSites.length} site(s)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Task Type</div>
                  <div className="font-medium">Multiple Sites Assignment</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Estimated Tasks</div>
                  <div className="font-medium">
                    {selectedSites.length} individual task(s) will be created
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={selectedSites.length === 0 || !selectedAssignee}
            >
              <Plus className="mr-2 h-4 w-4" />
              Assign Task to {selectedSites.length} Site(s)
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }, [
    assigneeType, 
    managers, 
    supervisorsList, 
    selectedAssignee, 
    selectedSites, 
    taskCountsByAssignee,
    getAssigneeName,
    getAssigneeType,
    handleAssigneeSelection,
    handleSelectAllSites,
    handleSiteSelection
  ]);

  // Memoized HourlyUpdatesDialog
  const HourlyUpdatesDialog = useMemo(() => {
    return ({ task, open, onOpenChange }: { 
      task: Task; 
      open: boolean; 
      onOpenChange: (open: boolean) => void;
    }) => {
      const hourlyUpdates = task.hourlyUpdates || [];
      
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
                  <span className="text-sm font-medium">Assignee: {getAssigneeName(task.assignedTo)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Site: {getSiteName(task.siteId)}</span>
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
            </div>
          </DialogContent>
        </Dialog>
      );
    };
  }, [hourlyUpdateText, handleAddHourlyUpdate, getAssigneeName, getSiteName, formatDateTime]);

  // Memoized AttachmentsDialog
  const AttachmentsDialog = useMemo(() => {
    return ({ task, open, onOpenChange }: { 
      task: Task; 
      open: boolean; 
      onOpenChange: (open: boolean) => void;
    }) => {
      const attachments = task.attachments || [];
      
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
                  <span className="text-sm">{getSiteName(task.siteId)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {attachments.length} file(s) attached
                </span>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttachment(task.id, attachment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
  }, [handleFileUpload, handleDeleteAttachment, getAssigneeName, getSiteName, formatDateTime]);

  // Group tasks by assignee for summary with useMemo
  const tasksByAssignee = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const assigneeName = getAssigneeName(task.assignedTo);
      if (!acc[assigneeName]) {
        acc[assigneeName] = [];
      }
      acc[assigneeName].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, getAssigneeName]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All Tasks</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {tasks.length} total tasks • {new Set(tasks.map(t => t.assignedTo)).size} assignees
            </p>
          </div>
          {AssignTaskDialog({
            open: dialogOpen,
            onOpenChange: setDialogOpen,
            onSubmit: handleAssignTask
          })}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  placeholder="Search tasks, descriptions, or assignees..." 
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {initialSites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Assignee Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(tasksByAssignee).slice(0, 4).map(([assigneeName, assigneeTasks]) => (
                <div key={assigneeName} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-medium truncate">{assigneeName}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {assigneeTasks.length}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Sites:</span>
                      <span>{new Set(assigneeTasks.map(t => t.siteId)).size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{assigneeTasks.filter(t => t.status === "completed").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{getAssigneeType(assigneeTasks[0]?.assignedTo)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Site & Client</TableHead>
                  <TableHead>Assignee & Role</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date & Time</TableHead>
                  <TableHead>Updates</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
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
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getAssigneeName(task.assignedTo)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getAssigneeType(task.assignedTo)}
                          </Badge>
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
                          {task.status !== "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(task.id, "in-progress")}
                              disabled={task.status === "in-progress"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {task.status !== "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(task.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedTask && (
        <>
          {HourlyUpdatesDialog({
            task: selectedTask,
            open: showUpdatesDialog,
            onOpenChange: setShowUpdatesDialog
          })}
          {AttachmentsDialog({
            task: selectedTask,
            open: showAttachmentsDialog,
            onOpenChange: setShowAttachmentsDialog
          })}
        </>
      )}
    </div>
  );
};

export default TasksSection;