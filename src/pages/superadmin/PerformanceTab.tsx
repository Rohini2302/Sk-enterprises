// src/components/hrms/tabs/DeductionListTab.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Edit, Trash2, Eye, Download, IndianRupee } from "lucide-react";
import { Deduction, Employee } from "./types";
import Pagination from "./Pagination";

// Dialog Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeductionListTabProps {
  deductions: Deduction[];
  setDeductions: React.Dispatch<React.SetStateAction<Deduction[]>>;
  employees: Employee[];
}

const DeductionListTab = ({ deductions = [], setDeductions, employees = [] }: DeductionListTabProps) => {
  const [deductionPage, setDeductionPage] = useState(1);
  const [deductionItemsPerPage, setDeductionItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddingDeduction, setIsAddingDeduction] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; deduction: Deduction | null }>({ open: false, deduction: null });

  // Deduction form state
  const [deductionForm, setDeductionForm] = useState({
    employeeId: "",
    type: "advance",
    amount: "",
    description: "",
    deductionDate: "",
    status: "pending",
    repaymentMonths: "",
    installmentAmount: "",
    fineAmount: "",
    appliedMonth: ""
  });

  // Filter deductions based on search and filters with safe defaults
  const filteredDeductions = useMemo(() => {
    return (deductions || []).filter(deduction => {
      if (!deduction) return false;
      
      const employee = (employees || []).find(emp => emp && emp.id === deduction.employeeId);
      const matchesSearch = 
        employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deduction.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || deduction.status === statusFilter;
      const matchesType = typeFilter === "all" || deduction.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [deductions, employees, searchTerm, statusFilter, typeFilter]);

  const paginatedDeductions = filteredDeductions.slice(
    (deductionPage - 1) * deductionItemsPerPage,
    deductionPage * deductionItemsPerPage
  );

  // Add new deduction
  const handleAddDeduction = () => {
    if (!deductionForm.employeeId || !deductionForm.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const newDeduction: Deduction = {
      id: Date.now(),
      employeeId: parseInt(deductionForm.employeeId),
      type: deductionForm.type as "advance" | "fine" | "other",
      amount: parseFloat(deductionForm.amount) || 0,
      description: deductionForm.description,
      deductionDate: deductionForm.deductionDate || new Date().toISOString().split('T')[0],
      status: deductionForm.status as "pending" | "approved" | "rejected" | "completed",
      repaymentMonths: deductionForm.repaymentMonths ? parseInt(deductionForm.repaymentMonths) : 0,
      installmentAmount: deductionForm.installmentAmount ? parseFloat(deductionForm.installmentAmount) : 0,
      fineAmount: deductionForm.fineAmount ? parseFloat(deductionForm.fineAmount) : 0,
      appliedMonth: deductionForm.appliedMonth || new Date().toISOString().slice(0, 7)
    };

    setDeductions(prev => [...(prev || []), newDeduction]);
    setIsAddingDeduction(false);
    resetDeductionForm();
  };

  // Update deduction
  const handleUpdateDeduction = () => {
    if (!editingDeduction) return;

    const updatedDeduction: Deduction = {
      ...editingDeduction,
      employeeId: parseInt(deductionForm.employeeId),
      type: deductionForm.type as "advance" | "fine" | "other",
      amount: parseFloat(deductionForm.amount) || 0,
      description: deductionForm.description,
      deductionDate: deductionForm.deductionDate,
      status: deductionForm.status as "pending" | "approved" | "rejected" | "completed",
      repaymentMonths: deductionForm.repaymentMonths ? parseInt(deductionForm.repaymentMonths) : 0,
      installmentAmount: deductionForm.installmentAmount ? parseFloat(deductionForm.installmentAmount) : 0,
      fineAmount: deductionForm.fineAmount ? parseFloat(deductionForm.fineAmount) : 0,
      appliedMonth: deductionForm.appliedMonth
    };

    setDeductions(prev => (prev || []).map(d => 
      d.id === updatedDeduction.id ? updatedDeduction : d
    ));
    setEditingDeduction(null);
    resetDeductionForm();
  };

  // Delete deduction
  const handleDeleteDeduction = (id: number) => {
    setDeductions(prev => (prev || []).filter(d => d.id !== id));
    setDeleteDialog({ open: false, deduction: null });
  };

  // Edit deduction
  const handleEditDeduction = (deduction: Deduction) => {
    setEditingDeduction(deduction);
    setDeductionForm({
      employeeId: deduction.employeeId.toString(),
      type: deduction.type,
      amount: (deduction.amount || 0).toString(),
      description: deduction.description || "",
      deductionDate: deduction.deductionDate || "",
      status: deduction.status,
      repaymentMonths: (deduction.repaymentMonths || 0).toString(),
      installmentAmount: (deduction.installmentAmount || 0).toString(),
      fineAmount: (deduction.fineAmount || 0).toString(),
      appliedMonth: deduction.appliedMonth || ""
    });
  };

  // Reset deduction form
  const resetDeductionForm = () => {
    setDeductionForm({
      employeeId: "",
      type: "advance",
      amount: "",
      description: "",
      deductionDate: "",
      status: "pending",
      repaymentMonths: "",
      installmentAmount: "",
      fineAmount: "",
      appliedMonth: ""
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant="secondary" className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    const variants = {
      advance: "bg-purple-100 text-purple-800",
      fine: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge variant="secondary" className={variants[type as keyof typeof variants]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Calculate monthly installment for advances
  const calculateInstallment = (amount: number, months: number) => {
    return months > 0 ? amount / months : amount;
  };

  // Calculate summary statistics with safe defaults
  const deductionStats = useMemo(() => {
    const totalDeductions = (deductions || []).reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalAdvances = (deductions || []).filter(d => d.type === "advance").reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalFines = (deductions || []).filter(d => d.type === "fine").reduce((sum, d) => sum + (d.amount || 0), 0);
    const pendingCount = (deductions || []).filter(d => d.status === "pending").length;

    return { totalDeductions, totalAdvances, totalFines, pendingCount };
  }, [deductions]);

  // Export deductions data
  const handleExportDeductions = () => {
    if (!deductions || deductions.length === 0) {
      alert("No deduction data to export");
      return;
    }

    const csvContent = [
      ["Employee ID", "Employee Name", "Type", "Amount", "Description", "Deduction Date", "Status", "Repayment Months", "Installment Amount", "Applied Month"],
      ...(deductions || []).map(deduction => {
        const employee = (employees || []).find(emp => emp && emp.id === deduction.employeeId);
        return [
          employee?.employeeId || "N/A",
          employee?.name || "N/A",
          deduction.type || "N/A",
          (deduction.amount || 0).toString(),
          deduction.description || "N/A",
          deduction.deductionDate || "N/A",
          deduction.status || "N/A",
          (deduction.repaymentMonths || 0).toString(),
          (deduction.installmentAmount || 0).toString(),
          deduction.appliedMonth || "N/A"
        ];
      })
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deductions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Deduction Dialog */}
      <Dialog open={isAddingDeduction || !!editingDeduction} onOpenChange={(open) => {
        if (!open) {
          setIsAddingDeduction(false);
          setEditingDeduction(null);
          resetDeductionForm();
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDeduction ? "Edit Deduction" : "Add New Deduction"}
            </DialogTitle>
            <DialogDescription>
              {editingDeduction ? "Update deduction information" : "Add a new salary deduction or advance"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select 
                value={deductionForm.employeeId} 
                onValueChange={(value) => setDeductionForm(prev => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {(employees || []).map(employee => (
                    employee && (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} ({employee.employeeId})
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Deduction Type *</Label>
              <Select 
                value={deductionForm.type} 
                onValueChange={(value) => setDeductionForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advance">Salary Advance</SelectItem>
                  <SelectItem value="fine">Fine/Penalty</SelectItem>
                  <SelectItem value="other">Other Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={deductionForm.amount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  const months = parseInt(deductionForm.repaymentMonths) || 0;
                  const installment = months > 0 ? amount / months : amount;
                  
                  setDeductionForm(prev => ({
                    ...prev,
                    amount: e.target.value,
                    installmentAmount: installment.toFixed(2)
                  }));
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={deductionForm.status} 
                onValueChange={(value) => setDeductionForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deductionDate">Deduction Date</Label>
              <Input
                id="deductionDate"
                type="date"
                value={deductionForm.deductionDate}
                onChange={(e) => setDeductionForm(prev => ({ ...prev, deductionDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appliedMonth">Applied Month</Label>
              <Input
                id="appliedMonth"
                type="month"
                value={deductionForm.appliedMonth}
                onChange={(e) => setDeductionForm(prev => ({ ...prev, appliedMonth: e.target.value }))}
              />
            </div>
            
            {deductionForm.type === "advance" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="repaymentMonths">Repayment Months</Label>
                  <Input
                    id="repaymentMonths"
                    type="number"
                    placeholder="Number of months for repayment"
                    value={deductionForm.repaymentMonths}
                    onChange={(e) => {
                      const months = parseInt(e.target.value) || 0;
                      const amount = parseFloat(deductionForm.amount) || 0;
                      const installment = months > 0 ? amount / months : amount;
                      
                      setDeductionForm(prev => ({
                        ...prev,
                        repaymentMonths: e.target.value,
                        installmentAmount: installment.toFixed(2)
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="installmentAmount">Monthly Installment</Label>
                  <Input
                    id="installmentAmount"
                    type="number"
                    placeholder="Monthly installment amount"
                    value={deductionForm.installmentAmount}
                    onChange={(e) => setDeductionForm(prev => ({ ...prev, installmentAmount: e.target.value }))}
                    readOnly
                  />
                </div>
              </>
            )}
            
            {deductionForm.type === "fine" && (
              <div className="space-y-2">
                <Label htmlFor="fineAmount">Fine Amount</Label>
                <Input
                  id="fineAmount"
                  type="number"
                  placeholder="Fine amount"
                  value={deductionForm.fineAmount}
                  onChange={(e) => setDeductionForm(prev => ({ ...prev, fineAmount: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description for the deduction"
              value={deductionForm.description}
              onChange={(e) => setDeductionForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddingDeduction(false);
              setEditingDeduction(null);
              resetDeductionForm();
            }}>
              Cancel
            </Button>
            <Button onClick={editingDeduction ? handleUpdateDeduction : handleAddDeduction}>
              {editingDeduction ? "Update Deduction" : "Add Deduction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, deduction: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deduction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deduction record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteDialog.deduction && handleDeleteDeduction(deleteDialog.deduction.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Deduction Management</h2>
          <p className="text-muted-foreground">Manage salary advances, fines, and other deductions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportDeductions}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddingDeduction(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deduction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {deductionStats.totalDeductions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Salary Advances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {deductionStats.totalAdvances.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fines/Penalties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {deductionStats.totalFines.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {deductionStats.pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Deduction Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees or descriptions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="advance">Salary Advance</SelectItem>
                  <SelectItem value="fine">Fine/Penalty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deductions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Month</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeductions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {deductions && deductions.length === 0 ? "No deductions added yet" : "No deductions match your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDeductions.map((deduction) => {
                    if (!deduction) return null;
                    
                    const employee = (employees || []).find(emp => emp && emp.id === deduction.employeeId);
                    
                    return (
                      <TableRow key={deduction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee?.name || "Unknown Employee"}</div>
                            <div className="text-sm text-muted-foreground">{employee?.employeeId || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(deduction.type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {(deduction.amount || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{deduction.description || "No description"}</TableCell>
                        <TableCell>
                          {deduction.type === "advance" && (deduction.installmentAmount || 0) > 0 ? (
                            <div className="flex items-center text-sm">
                              <IndianRupee className="h-3 w-3 mr-1" />
                              {(deduction.installmentAmount || 0).toLocaleString()}/month
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(deduction.status)}</TableCell>
                        <TableCell>{deduction.appliedMonth || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditDeduction(deduction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setDeleteDialog({ open: true, deduction })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredDeductions.length > 0 && (
            <Pagination
              currentPage={deductionPage}
              totalPages={Math.ceil(filteredDeductions.length / deductionItemsPerPage)}
              totalItems={filteredDeductions.length}
              itemsPerPage={deductionItemsPerPage}
              onPageChange={setDeductionPage}
              onItemsPerPageChange={setDeductionItemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeductionListTab;