import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, Edit, Trash2, Filter, Download, User, Hash, Building } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Leave = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  
  const [leaveRequests, setLeaveRequests] = useState([
    { 
      id: 1, 
      type: "Annual Leave", 
      from: "2025-02-10", 
      to: "2025-02-15", 
      days: 5, 
      status: "pending", 
      reason: "Family vacation",
      appliedDate: "2025-01-15",
      leaveType: "annual",
      department: "Staff",
      employeeName: "John Doe",
      employeeId: "EMP-001"
    },
    { 
      id: 2, 
      type: "Sick Leave", 
      from: "2025-01-05", 
      to: "2025-01-07", 
      days: 3, 
      status: "approved", 
      reason: "Medical treatment",
      appliedDate: "2024-12-20",
      leaveType: "sick",
      department: "Supervisor",
      employeeName: "Jane Smith",
      employeeId: "EMP-002"
    },
    { 
      id: 3, 
      type: "Casual Leave", 
      from: "2025-03-01", 
      to: "2025-03-01", 
      days: 1, 
      status: "rejected", 
      reason: "Personal work",
      appliedDate: "2025-02-15",
      leaveType: "casual",
      department: "Staff",
      employeeName: "Robert Johnson",
      employeeId: "EMP-003"
    },
    { 
      id: 4, 
      type: "Annual Leave", 
      from: "2025-03-10", 
      to: "2025-03-15", 
      days: 5, 
      status: "pending", 
      reason: "Team building retreat",
      appliedDate: "2025-02-25",
      leaveType: "annual",
      department: "Supervisor",
      employeeName: "Michael Brown",
      employeeId: "EMP-004"
    },
  ]);

  const [formData, setFormData] = useState({
    type: "",
    from: "",
    to: "",
    reason: ""
  });

  // Filter leave requests based on status
  const filteredLeaves = leaveRequests.filter(leave => {
    if (filter === "all") return true;
    return leave.status === filter;
  });

  const calculateDays = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate days when both dates are selected
    if ((field === "from" || field === "to") && formData.from && formData.to) {
      const days = calculateDays(
        field === "from" ? value : formData.from,
        field === "to" ? value : formData.to
      );
      // You can store this in formData if needed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.from) > new Date(formData.to)) {
      toast.error("End date cannot be before start date");
      return;
    }

    const days = calculateDays(formData.from, formData.to);
    
    const newLeave = {
      id: leaveRequests.length + 1,
      type: formData.type === "annual" ? "Annual Leave" : 
            formData.type === "sick" ? "Sick Leave" : "Casual Leave",
      from: formData.from,
      to: formData.to,
      days: days,
      status: "pending" as const,
      reason: formData.reason,
      appliedDate: new Date().toISOString().split('T')[0],
      leaveType: formData.type,
      department: "Staff", // Default to Staff for new requests
      employeeName: "Current User", // This should be replaced with actual user data
      employeeId: "EMP-000" // This should be replaced with actual user data
    };

    setLeaveRequests(prev => [newLeave, ...prev]);
    toast.success("Leave request submitted successfully!");
    setFormData({ type: "", from: "", to: "", reason: "" });
    setDialogOpen(false);
  };

  const handleEdit = (leave: any) => {
    setEditingLeave(leave);
    setFormData({
      type: leave.leaveType,
      from: leave.from,
      to: leave.to,
      reason: leave.reason
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.from) > new Date(formData.to)) {
      toast.error("End date cannot be before start date");
      return;
    }

    const days = calculateDays(formData.from, formData.to);
    
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === editingLeave.id 
        ? {
            ...leave,
            type: formData.type === "annual" ? "Annual Leave" : 
                  formData.type === "sick" ? "Sick Leave" : "Casual Leave",
            from: formData.from,
            to: formData.to,
            days: days,
            reason: formData.reason,
            leaveType: formData.type,
            status: "pending" // Reset status when editing
          }
        : leave
    ));

    toast.success("Leave request updated successfully!");
    setEditDialogOpen(false);
    setEditingLeave(null);
    setFormData({ type: "", from: "", to: "", reason: "" });
  };

  const handleDelete = (leaveId: number) => {
    setLeaveRequests(prev => prev.filter(leave => leave.id !== leaveId));
    toast.success("Leave request deleted successfully!");
  };

  const handleCancel = (leaveId: number) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === leaveId ? { ...leave, status: "cancelled" } : leave
    ));
    toast.success("Leave request cancelled!");
  };

  const handleExport = () => {
    toast.info("Exporting leave data...");
    // Simulate export process
    setTimeout(() => {
      toast.success("Leave data exported successfully!");
    }, 1500);
  };

  const handleAccept = () => {
    if (editingLeave) {
      setLeaveRequests(prev => prev.map(leave => 
        leave.id === editingLeave.id ? { ...leave, status: "approved" } : leave
      ));
      toast.success("Leave request accepted!");
      setEditDialogOpen(false);
      setEditingLeave(null);
      setFormData({ type: "", from: "", to: "", reason: "" });
    }
  };

  const handleReject = () => {
    if (editingLeave) {
      setLeaveRequests(prev => prev.map(leave => 
        leave.id === editingLeave.id ? { ...leave, status: "rejected" } : leave
      ));
      toast.success("Leave request rejected!");
      setEditDialogOpen(false);
      setEditingLeave(null);
      setFormData({ type: "", from: "", to: "", reason: "" });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "cancelled": return "outline";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "rejected": return "text-red-600 bg-red-100";
      case "cancelled": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getLeaveStats = () => {
    const stats = {
      total: leaveRequests.length,
      pending: leaveRequests.filter(l => l.status === "pending").length,
      approved: leaveRequests.filter(l => l.status === "approved").length,
      rejected: leaveRequests.filter(l => l.status === "rejected").length,
    };
    return stats;
  };

  const stats = getLeaveStats();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Leave Management" 
        subtitle="Apply for leave and track your requests"
        onMenuClick={onMenuClick}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Apply for Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for Leave</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Leave Type</Label>
                        <Select 
                          required 
                          value={formData.type}
                          onValueChange={(value) => handleInputChange("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual Leave</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="casual">Casual Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="from">From Date</Label>
                          <Input 
                            id="from" 
                            type="date" 
                            required 
                            value={formData.from}
                            onChange={(e) => handleInputChange("from", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to">To Date</Label>
                          <Input 
                            id="to" 
                            type="date" 
                            required 
                            value={formData.to}
                            onChange={(e) => handleInputChange("to", e.target.value)}
                          />
                        </div>
                      </div>
                      {formData.from && formData.to && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Total days: {calculateDays(formData.from, formData.to)}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea 
                          id="reason" 
                          placeholder="Enter reason for leave" 
                          required 
                          value={formData.reason}
                          onChange={(e) => handleInputChange("reason", e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full">Submit Request</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  <Filter className="mr-2 h-3 w-3" />
                  All
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("approved")}
                >
                  Approved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Leave Requests (Supervisor & Staff)</span>
              <Badge variant="outline">
                {filteredLeaves.length} requests
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leave requests found for the selected filter.
                </div>
              ) : (
                filteredLeaves.map((leave, index) => (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{leave.type}</h3>
                          <Badge className={getStatusColor(leave.status)}>
                            {leave.status}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {leave.department}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {leave.employeeName}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {leave.employeeId}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {leave.from} to {leave.to}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {leave.days} days
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {leave.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied on: {leave.appliedDate}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {leave.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(leave)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(leave.id)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(leave.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(leave.status === "approved" || leave.status === "rejected") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(leave.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Leave Request</DialogTitle>
            </DialogHeader>
            {editingLeave && (
              <div className="space-y-6">
                {/* Employee Information Section */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium text-lg">Employee Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>Department</span>
                      </div>
                      <div className="font-medium">{editingLeave.department}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Employee Name</span>
                      </div>
                      <div className="font-medium">{editingLeave.employeeName}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>Employee ID</span>
                      </div>
                      <div className="font-medium">{editingLeave.employeeId}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Applied Date</span>
                      </div>
                      <div className="font-medium">{editingLeave.appliedDate}</div>
                    </div>
                  </div>
                </div>

                {/* Leave Details Section */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Leave Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Leave Type</Label>
                    <Select 
                      required 
                      value={formData.type}
                      onValueChange={(value) => handleInputChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-from">From Date</Label>
                      <Input 
                        id="edit-from" 
                        type="date" 
                        required 
                        value={formData.from}
                        onChange={(e) => handleInputChange("from", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-to">To Date</Label>
                      <Input 
                        id="edit-to" 
                        type="date" 
                        required 
                        value={formData.to}
                        onChange={(e) => handleInputChange("to", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {formData.from && formData.to && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Total days: {calculateDays(formData.from, formData.to)}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-reason">Reason</Label>
                    <Textarea 
                      id="edit-reason" 
                      placeholder="Enter reason for leave" 
                      required 
                      value={formData.reason}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setEditingLeave(null);
                      setFormData({ type: "", from: "", to: "", reason: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleReject}
                  >
                    Reject Request
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleAccept}
                  >
                    Accept Request
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Leave;