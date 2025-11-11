// src/components/hrms/tabs/PayrollTab.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  IndianRupee, 
  Calendar,
  CheckCircle,
  FileText,
  Printer,
  Send
} from "lucide-react";
import { Employee, Payroll, SalaryStructure, SalarySlip, Attendance, Leave } from "./types";

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

interface PayrollTabProps {
  employees: Employee[];
  payroll: Payroll[];
  setPayroll: React.Dispatch<React.SetStateAction<Payroll[]>>;
  salaryStructures: SalaryStructure[];
  setSalaryStructures: React.Dispatch<React.SetStateAction<SalaryStructure[]>>;
  salarySlips: SalarySlip[];
  setSalarySlips: React.Dispatch<React.SetStateAction<SalarySlip[]>>;
  attendance: Attendance[];
  leaves?: Leave[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const PayrollTab = ({
  employees,
  payroll,
  setPayroll,
  salaryStructures,
  setSalaryStructures,
  salarySlips,
  setSalarySlips,
  attendance,
  leaves = [],
  selectedMonth,
  setSelectedMonth
}: PayrollTabProps) => {
  const [activePayrollTab, setActivePayrollTab] = useState("salary-slips");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddingStructure, setIsAddingStructure] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);

  // Dialog states
  const [processDialog, setProcessDialog] = useState<{ open: boolean; employee: Employee | null }>({ open: false, employee: null });
  const [payDialog, setPayDialog] = useState<{ open: boolean; payroll: Payroll | null }>({ open: false, payroll: null });
  const [slipDialog, setSlipDialog] = useState<{ open: boolean; salarySlip: SalarySlip | null }>({ open: false, salarySlip: null });
  const [processAllDialog, setProcessAllDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; structure: SalaryStructure | null }>({ open: false, structure: null });

  // Salary structure form state
  const [structureForm, setStructureForm] = useState({
    employeeId: "",
    basicSalary: "",
    hra: "",
    da: "",
    specialAllowance: "",
    conveyance: "",
    medicalAllowance: "",
    otherAllowances: "",
    providentFund: "",
    professionalTax: "",
    incomeTax: "",
    otherDeductions: ""
  });

  // Calculate payroll summary with safe defaults
  const payrollSummary = useMemo(() => {
    const total = (payroll || []).reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const processed = (payroll || []).filter(p => p.status === "processed").length;
    const pending = (payroll || []).filter(p => p.status === "pending").length;
    const paid = (payroll || []).filter(p => p.status === "paid").length;

    return { total, processed, pending, paid };
  }, [payroll]);

  // Get employees with salary structure
  const employeesWithStructure = useMemo(() => {
    return (employees || []).filter(emp => 
      emp && (salaryStructures || []).some(s => s.employeeId === emp.id)
    );
  }, [employees, salaryStructures]);

  // Get employees without salary structure
  const employeesWithoutStructure = useMemo(() => {
    return (employees || []).filter(emp => 
      !(salaryStructures || []).some(s => s.employeeId === emp.id)
    );
  }, [employees, salaryStructures]);

  // Filter employees based on search and status with safe defaults
  const filteredEmployees = useMemo(() => {
    return (employees || []).filter(employee => {
      if (!employee) return false;
      
      const matchesSearch = 
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      
      const employeeStructure = (salaryStructures || []).find(s => s.employeeId === employee.id);
      if (statusFilter === "with-structure") return matchesSearch && employeeStructure;
      if (statusFilter === "without-structure") return matchesSearch && !employeeStructure;
      
      return matchesSearch;
    });
  }, [employees, searchTerm, statusFilter, salaryStructures]);

  // Calculate employee attendance and leaves for the selected month with safe defaults
  const getEmployeeAttendance = (employeeId: number) => {
    const monthAttendance = (attendance || []).filter(a => 
      a && a.employeeId === employeeId && a.date?.startsWith(selectedMonth)
    );
    const presentDays = monthAttendance.filter(a => a.status === "present").length;
    const absentDays = monthAttendance.filter(a => a.status === "absent").length;
    const halfDays = monthAttendance.filter(a => a.status === "half-day").length;
    
    // Assume 22 working days in a month if no attendance data
    const totalWorkingDays = monthAttendance.length > 0 ? monthAttendance.length : 22;
    
    return { presentDays, absentDays, halfDays, totalWorkingDays };
  };

  // Calculate employee leaves for the selected month with safe defaults
  const getEmployeeLeaves = (employeeId: number) => {
    const monthLeaves = (leaves || []).filter(l => 
      l && 
      l.employeeId === employeeId && 
      l.startDate?.startsWith(selectedMonth) &&
      l.status === "approved"
    );
    return monthLeaves.length;
  };

  // Calculate salary based on attendance and leaves with safe defaults - CORRECTED CALCULATION
  const calculateSalary = (employeeId: number, structure: SalaryStructure) => {
    if (!structure || !structure.basicSalary) return 0;
    
    const attendance = getEmployeeAttendance(employeeId);
    const totalLeaves = getEmployeeLeaves(employeeId);
    
    const totalWorkingDays = attendance.totalWorkingDays;
    if (totalWorkingDays === 0) return 0;

    // Calculate daily rate based on basic salary
    const dailyRate = structure.basicSalary / totalWorkingDays;
    const halfDayRate = dailyRate / 2;
    
    // Calculate earned basic salary based on attendance (basic salary is pro-rated)
    const earnedBasicSalary = 
      (attendance.presentDays * dailyRate) +
      (attendance.halfDays * halfDayRate);
    
    // Calculate loss for absent days and leaves
    const salaryLoss = 
      (attendance.absentDays * dailyRate) +
      (totalLeaves * dailyRate);

    // Net basic salary after deductions for absences and leaves
    const netBasicSalary = Math.max(0, earnedBasicSalary - salaryLoss);

    // Allowances are usually fixed (not pro-rated based on attendance)
    const totalAllowances = (structure.hra || 0) + (structure.da || 0) + (structure.specialAllowance || 0) + 
                           (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0);
    
    // Deductions are usually fixed
    const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                           (structure.incomeTax || 0) + (structure.otherDeductions || 0);

    // CORRECTED: Total net salary = (Basic salary after attendance adjustment) + Allowances - Deductions
    // This includes the basic salary in the net salary calculation
    const netSalary = netBasicSalary + totalAllowances - totalDeductions;

    return Math.max(0, netSalary); // Ensure salary doesn't go negative
  };

  // Process payroll for an employee
  const handleProcessPayroll = (employeeId: number) => {
    const structure = (salaryStructures || []).find(s => s.employeeId === employeeId);
    if (!structure) {
      alert("Salary structure not found for this employee");
      return;
    }

    const calculatedSalary = calculateSalary(employeeId, structure);
    const attendance = getEmployeeAttendance(employeeId);
    const totalLeaves = getEmployeeLeaves(employeeId);

    const totalAllowances = (structure.hra || 0) + (structure.da || 0) + (structure.specialAllowance || 0) + 
                           (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0);
    const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                           (structure.incomeTax || 0) + (structure.otherDeductions || 0);

    const newPayroll: Payroll = {
      id: Date.now(),
      employeeId,
      month: selectedMonth,
      basicSalary: structure.basicSalary || 0,
      allowances: totalAllowances,
      deductions: totalDeductions,
      netSalary: calculatedSalary,
      status: "processed",
      paymentDate: "",
      presentDays: attendance.presentDays,
      absentDays: attendance.absentDays,
      halfDays: attendance.halfDays,
      leaves: totalLeaves
    };

    setPayroll(prev => [...(prev || []).filter(p => !(p.employeeId === employeeId && p.month === selectedMonth)), newPayroll]);
    setProcessDialog({ open: false, employee: null });
  };

  // Mark salary as paid
  const handleMarkAsPaid = (payrollId: number) => {
    setPayroll(prev => (prev || []).map(p => 
      p.id === payrollId ? { 
        ...p, 
        status: "paid", 
        paymentDate: new Date().toISOString().split('T')[0] 
      } : p
    ));
    setPayDialog({ open: false, payroll: null });
  };

  // Process payroll for all employees with salary structures
  const handleProcessAllPayroll = () => {
    if (employeesWithStructure.length === 0) {
      alert("No employees with salary structures found");
      return;
    }

    employeesWithStructure.forEach(emp => {
      if (emp) {
        const structure = (salaryStructures || []).find(s => s.employeeId === emp.id);
        if (structure) {
          const calculatedSalary = calculateSalary(emp.id, structure);
          const attendance = getEmployeeAttendance(emp.id);
          const totalLeaves = getEmployeeLeaves(emp.id);

          const totalAllowances = (structure.hra || 0) + (structure.da || 0) + (structure.specialAllowance || 0) + 
                                (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0);
          const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                                (structure.incomeTax || 0) + (structure.otherDeductions || 0);

          const newPayroll: Payroll = {
            id: Date.now() + emp.id, // Ensure unique ID
            employeeId: emp.id,
            month: selectedMonth,
            basicSalary: structure.basicSalary || 0,
            allowances: totalAllowances,
            deductions: totalDeductions,
            netSalary: calculatedSalary,
            status: "processed",
            paymentDate: "",
            presentDays: attendance.presentDays,
            absentDays: attendance.absentDays,
            halfDays: attendance.halfDays,
            leaves: totalLeaves
          };

          setPayroll(prev => [...(prev || []).filter(p => !(p.employeeId === emp.id && p.month === selectedMonth)), newPayroll]);
        }
      }
    });

    setProcessAllDialog(false);
    alert(`Payroll processed for ${employeesWithStructure.length} employees`);
  };

  // Add new salary structure
  const handleAddStructure = () => {
    if (!structureForm.employeeId) {
      alert("Please select an employee");
      return;
    }

    const newStructure: SalaryStructure = {
      id: Date.now(),
      employeeId: parseInt(structureForm.employeeId),
      basicSalary: parseFloat(structureForm.basicSalary) || 0,
      hra: parseFloat(structureForm.hra) || 0,
      da: parseFloat(structureForm.da) || 0,
      specialAllowance: parseFloat(structureForm.specialAllowance) || 0,
      conveyance: parseFloat(structureForm.conveyance) || 0,
      medicalAllowance: parseFloat(structureForm.medicalAllowance) || 0,
      otherAllowances: parseFloat(structureForm.otherAllowances) || 0,
      providentFund: parseFloat(structureForm.providentFund) || 0,
      professionalTax: parseFloat(structureForm.professionalTax) || 0,
      incomeTax: parseFloat(structureForm.incomeTax) || 0,
      otherDeductions: parseFloat(structureForm.otherDeductions) || 0,
    };

    setSalaryStructures(prev => [...(prev || []), newStructure]);
    setIsAddingStructure(false);
    setStructureForm({
      employeeId: "",
      basicSalary: "",
      hra: "",
      da: "",
      specialAllowance: "",
      conveyance: "",
      medicalAllowance: "",
      otherAllowances: "",
      providentFund: "",
      professionalTax: "",
      incomeTax: "",
      otherDeductions: ""
    });
  };

  // Update salary structure
  const handleUpdateStructure = () => {
    if (!editingStructure) return;

    const updatedStructure: SalaryStructure = {
      ...editingStructure,
      basicSalary: parseFloat(structureForm.basicSalary) || 0,
      hra: parseFloat(structureForm.hra) || 0,
      da: parseFloat(structureForm.da) || 0,
      specialAllowance: parseFloat(structureForm.specialAllowance) || 0,
      conveyance: parseFloat(structureForm.conveyance) || 0,
      medicalAllowance: parseFloat(structureForm.medicalAllowance) || 0,
      otherAllowances: parseFloat(structureForm.otherAllowances) || 0,
      providentFund: parseFloat(structureForm.providentFund) || 0,
      professionalTax: parseFloat(structureForm.professionalTax) || 0,
      incomeTax: parseFloat(structureForm.incomeTax) || 0,
      otherDeductions: parseFloat(structureForm.otherDeductions) || 0,
    };

    setSalaryStructures(prev => (prev || []).map(s => 
      s.id === updatedStructure.id ? updatedStructure : s
    ));
    setEditingStructure(null);
    setStructureForm({
      employeeId: "",
      basicSalary: "",
      hra: "",
      da: "",
      specialAllowance: "",
      conveyance: "",
      medicalAllowance: "",
      otherAllowances: "",
      providentFund: "",
      professionalTax: "",
      incomeTax: "",
      otherDeductions: ""
    });
  };

  // Delete salary structure
  const handleDeleteStructure = (id: number) => {
    setSalaryStructures(prev => (prev || []).filter(s => s.id !== id));
    setDeleteDialog({ open: false, structure: null });
  };

  // Edit salary structure
  const handleEditStructure = (structure: SalaryStructure) => {
    setEditingStructure(structure);
    setStructureForm({
      employeeId: structure.employeeId.toString(),
      basicSalary: (structure.basicSalary || 0).toString(),
      hra: (structure.hra || 0).toString(),
      da: (structure.da || 0).toString(),
      specialAllowance: (structure.specialAllowance || 0).toString(),
      conveyance: (structure.conveyance || 0).toString(),
      medicalAllowance: (structure.medicalAllowance || 0).toString(),
      otherAllowances: (structure.otherAllowances || 0).toString(),
      providentFund: (structure.providentFund || 0).toString(),
      professionalTax: (structure.professionalTax || 0).toString(),
      incomeTax: (structure.incomeTax || 0).toString(),
      otherDeductions: (structure.otherDeductions || 0).toString()
    });
  };

  // Generate salary slip
  const handleGenerateSalarySlip = (payrollId: number) => {
    const payrollRecord = (payroll || []).find(p => p.id === payrollId);
    if (!payrollRecord) return;

    const employee = (employees || []).find(e => e.id === payrollRecord.employeeId);
    const structure = (salaryStructures || []).find(s => s.employeeId === payrollRecord.employeeId);

    if (!employee || !structure) return;

    const salarySlip: SalarySlip = {
      id: Date.now(),
      payrollId,
      employeeId: payrollRecord.employeeId,
      month: payrollRecord.month,
      basicSalary: structure.basicSalary || 0,
      allowances: payrollRecord.allowances || 0,
      deductions: payrollRecord.deductions || 0,
      netSalary: payrollRecord.netSalary || 0,
      generatedDate: new Date().toISOString().split('T')[0],
      presentDays: payrollRecord.presentDays || 0,
      absentDays: payrollRecord.absentDays || 0,
      halfDays: payrollRecord.halfDays || 0,
      leaves: payrollRecord.leaves || 0
    };

    setSalarySlips(prev => [...(prev || []), salarySlip]);
    setSlipDialog({ open: true, salarySlip });
  };

  // View salary slip
  const handleViewSalarySlip = (salarySlip: SalarySlip) => {
    setSlipDialog({ open: true, salarySlip });
  };

  // Print salary slip
  const handlePrintSalarySlip = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && slipDialog.salarySlip) {
      const employee = getEmployeeDetails(slipDialog.salarySlip.employeeId);
      if (!employee) return;

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Salary Slip - ${employee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .slip-title { font-size: 20px; margin-bottom: 10px; }
            .employee-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
            .breakdown { width: 100%; border-collapse: collapse; }
            .breakdown td { padding: 8px; border-bottom: 1px solid #eee; }
            .breakdown .amount { text-align: right; }
            .total { font-weight: bold; border-top: 2px solid #333; }
            .attendance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; margin-top: 20px; }
            .attendance-item { padding: 10px; border-radius: 5px; }
            .present { background: #d1fae5; color: #065f46; }
            .absent { background: #fee2e2; color: #991b1b; }
            .half-day { background: #fef3c7; color: #92400e; }
            .leaves { background: #dbeafe; color: #1e40af; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">COMPANY NAME</div>
            <div class="slip-title">SALARY SLIP</div>
            <div>${slipDialog.salarySlip.month}</div>
          </div>
          
          <div class="employee-info">
            <div>
              <strong>Employee:</strong> ${employee.name}<br>
              <strong>ID:</strong> ${employee.employeeId}<br>
              <strong>Department:</strong> ${employee.department}
            </div>
            <div>
              <strong>Generated Date:</strong> ${new Date(slipDialog.salarySlip.generatedDate).toLocaleDateString()}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Earnings</div>
            <table class="breakdown">
              <tr>
                <td>Basic Salary</td>
                <td class="amount">₹${slipDialog.salarySlip.basicSalary.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Allowances</td>
                <td class="amount">₹${slipDialog.salarySlip.allowances.toLocaleString()}</td>
              </tr>
              <tr class="total">
                <td>Gross Earnings</td>
                <td class="amount">₹${(slipDialog.salarySlip.basicSalary + slipDialog.salarySlip.allowances).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Deductions</div>
            <table class="breakdown">
              <tr>
                <td>Total Deductions</td>
                <td class="amount">-₹${slipDialog.salarySlip.deductions.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Net Salary</div>
            <table class="breakdown">
              <tr class="total">
                <td><strong>Net Payable</strong></td>
                <td class="amount"><strong>₹${slipDialog.salarySlip.netSalary.toLocaleString()}</strong></td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Attendance Summary</div>
            <div class="attendance-grid">
              <div class="attendance-item present">
                <div style="font-size: 18px; font-weight: bold;">${slipDialog.salarySlip.presentDays}</div>
                <div>Present</div>
              </div>
              <div class="attendance-item absent">
                <div style="font-size: 18px; font-weight: bold;">${slipDialog.salarySlip.absentDays}</div>
                <div>Absent</div>
              </div>
              <div class="attendance-item half-day">
                <div style="font-size: 18px; font-weight: bold;">${slipDialog.salarySlip.halfDays}</div>
                <div>Half Days</div>
              </div>
              <div class="attendance-item leaves">
                <div style="font-size: 18px; font-weight: bold;">${slipDialog.salarySlip.leaves}</div>
                <div>Leaves</div>
              </div>
            </div>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>This is a computer-generated document and does not require a signature.</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Send salary slip via email (mock function)
  const handleSendSalarySlip = () => {
    alert("Salary slip sent to employee's email!");
    setSlipDialog({ open: false, salarySlip: null });
  };

  // Export payroll data
  const handleExportPayroll = () => {
    if (!payroll || payroll.length === 0) {
      alert("No payroll data to export");
      return;
    }

    const payrollData = payroll.map(p => {
      const employee = (employees || []).find(e => e.id === p.employeeId);
      return {
        "Employee ID": employee?.employeeId || "N/A",
        "Employee Name": employee?.name || "N/A",
        "Department": employee?.department || "N/A",
        "Month": p.month || "N/A",
        "Basic Salary": p.basicSalary || 0,
        "Allowances": p.allowances || 0,
        "Deductions": p.deductions || 0,
        "Net Salary": p.netSalary || 0,
        "Status": p.status || "N/A",
        "Payment Date": p.paymentDate || "N/A",
        "Present Days": p.presentDays || 0,
        "Absent Days": p.absentDays || 0,
        "Half Days": p.halfDays || 0,
        "Leaves": p.leaves || 0
      };
    });

    const csvContent = [
      Object.keys(payrollData[0] || {}).join(","),
      ...payrollData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      processed: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant="secondary" className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Get employee details for dialogs
  const getEmployeeDetails = (employeeId: number) => {
    return (employees || []).find(e => e.id === employeeId) || null;
  };

  // Get payroll calculation details for process dialog
  const getPayrollCalculationDetails = (employeeId: number) => {
    const structure = (salaryStructures || []).find(s => s.employeeId === employeeId);
    if (!structure) return null;

    const attendance = getEmployeeAttendance(employeeId);
    const totalLeaves = getEmployeeLeaves(employeeId);
    const calculatedSalary = calculateSalary(employeeId, structure);

    const totalAllowances = (structure.hra || 0) + (structure.da || 0) + (structure.specialAllowance || 0) + 
                           (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0);
    const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                           (structure.incomeTax || 0) + (structure.otherDeductions || 0);

    // Calculate daily rate and salary adjustments
    const dailyRate = structure.basicSalary / attendance.totalWorkingDays;
    const basicSalaryEarned = (attendance.presentDays * dailyRate) + (attendance.halfDays * dailyRate / 2);
    const salaryDeductions = (attendance.absentDays * dailyRate) + (totalLeaves * dailyRate);
    const netBasicSalary = basicSalaryEarned - salaryDeductions;

    return {
      structure,
      attendance,
      totalLeaves,
      calculatedSalary,
      totalAllowances,
      totalDeductions,
      dailyRate,
      basicSalaryEarned,
      salaryDeductions,
      netBasicSalary
    };
  };

  return (
    <div className="space-y-6">
      {/* Process Salary Dialog */}
      <Dialog open={processDialog.open} onOpenChange={(open) => setProcessDialog({ open, employee: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Process Salary
            </DialogTitle>
            <DialogDescription>
              Confirm salary processing for {processDialog.employee?.name}
            </DialogDescription>
          </DialogHeader>
          
          {processDialog.employee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Employee:</span>
                  <div>{processDialog.employee.name}</div>
                  <div className="text-muted-foreground">{processDialog.employee.employeeId}</div>
                </div>
                <div>
                  <span className="font-medium">Department:</span>
                  <div>{processDialog.employee.department}</div>
                </div>
              </div>

              {(() => {
                const calculation = getPayrollCalculationDetails(processDialog.employee.id);
                if (!calculation) return null;

                return (
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Attendance Summary</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-green-600">{calculation.attendance.presentDays}</div>
                          <div className="text-xs text-muted-foreground">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{calculation.attendance.absentDays}</div>
                          <div className="text-xs text-muted-foreground">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">{calculation.attendance.halfDays}</div>
                          <div className="text-xs text-muted-foreground">Half Days</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{calculation.totalLeaves}</div>
                          <div className="text-xs text-muted-foreground">Leaves</div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Salary Calculation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Basic Salary:</span>
                          <span className="font-medium">₹{calculation.structure.basicSalary?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Earned Basic:</span>
                          <span>+₹{calculation.basicSalaryEarned.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Deductions (Absent/Leaves):</span>
                          <span>-₹{calculation.salaryDeductions.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-medium">Net Basic Salary:</span>
                          <span className="font-medium">₹{calculation.netBasicSalary.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Allowances:</span>
                          <span className="text-green-600">+₹{calculation.totalAllowances.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductions:</span>
                          <span className="text-red-600">-₹{calculation.totalDeductions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Final Net Salary:</span>
                          <span className="text-lg">₹{calculation.calculatedSalary.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialog({ open: false, employee: null })}>
              Cancel
            </Button>
            <Button onClick={() => processDialog.employee && handleProcessPayroll(processDialog.employee.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Process Salary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={payDialog.open} onOpenChange={(open) => setPayDialog({ open, payroll: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Mark Salary as Paid
            </DialogTitle>
            <DialogDescription>
              Confirm salary payment for {getEmployeeDetails(payDialog.payroll?.employeeId || 0)?.name}
            </DialogDescription>
          </DialogHeader>
          
          {payDialog.payroll && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    ₹{payDialog.payroll.netSalary?.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">
                    Ready to mark as paid
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Employee:</span>
                  <div>{getEmployeeDetails(payDialog.payroll.employeeId)?.name}</div>
                </div>
                <div>
                  <span className="font-medium">Month:</span>
                  <div>{payDialog.payroll.month}</div>
                </div>
                <div>
                  <span className="font-medium">Payment Date:</span>
                  <div>{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>{getStatusBadge("paid")}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog({ open: false, payroll: null })}>
              Cancel
            </Button>
            <Button onClick={() => payDialog.payroll && handleMarkAsPaid(payDialog.payroll.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Slip Dialog - RESPONSIVE FIX */}
      <Dialog open={slipDialog.open} onOpenChange={(open) => setSlipDialog({ open, salarySlip: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Salary Slip
            </DialogTitle>
          </DialogHeader>
          
          {slipDialog.salarySlip && (() => {
            const employee = getEmployeeDetails(slipDialog.salarySlip!.employeeId);
            if (!employee) return null;

            return (
              <div className="space-y-6 p-1">
                {/* Salary Slip Header */}
                <div className="border-b pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Salary Slip</h2>
                      <p className="text-muted-foreground">{slipDialog.salarySlip.month}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-semibold">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                      <div className="text-sm text-muted-foreground">{employee.department}</div>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div>
                  <h3 className="font-semibold mb-3">Earnings</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span>₹{slipDialog.salarySlip.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowances</span>
                      <span className="text-green-600">₹{slipDialog.salarySlip.allowances.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Gross Earnings</span>
                      <span>₹{(slipDialog.salarySlip.basicSalary + slipDialog.salarySlip.allowances).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold mb-3">Deductions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Deductions</span>
                      <span className="text-red-600">-₹{slipDialog.salarySlip.deductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Net Salary</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">
                      ₹{slipDialog.salarySlip.netSalary.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Attendance Summary - RESPONSIVE GRID */}
                <div>
                  <h3 className="font-semibold mb-3">Attendance Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-green-50 rounded p-3 text-center">
                      <div className="font-semibold text-green-600 text-lg">{slipDialog.salarySlip.presentDays}</div>
                      <div className="text-muted-foreground">Present</div>
                    </div>
                    <div className="bg-red-50 rounded p-3 text-center">
                      <div className="font-semibold text-red-600 text-lg">{slipDialog.salarySlip.absentDays}</div>
                      <div className="text-muted-foreground">Absent</div>
                    </div>
                    <div className="bg-yellow-50 rounded p-3 text-center">
                      <div className="font-semibold text-yellow-600 text-lg">{slipDialog.salarySlip.halfDays}</div>
                      <div className="text-muted-foreground">Half Days</div>
                    </div>
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <div className="font-semibold text-blue-600 text-lg">{slipDialog.salarySlip.leaves}</div>
                      <div className="text-muted-foreground">Leaves</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center border-t pt-4">
                  Generated on {new Date(slipDialog.salarySlip.generatedDate).toLocaleDateString()}
                </div>
              </div>
            );
          })()}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handlePrintSalarySlip} className="sm:flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleSendSalarySlip} className="sm:flex-1">
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button onClick={() => setSlipDialog({ open: false, salarySlip: null })} className="sm:flex-1">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process All Payroll Dialog */}
      <AlertDialog open={processAllDialog} onOpenChange={setProcessAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process All Payroll</AlertDialogTitle>
            <AlertDialogDescription>
              This will process payroll for all {employeesWithStructure.length} employees with salary structures for {selectedMonth}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProcessAllPayroll}>
              Process All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Structure Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, structure: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the salary structure for {
                deleteDialog.structure && getEmployeeDetails(deleteDialog.structure.employeeId)?.name
              }? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteDialog.structure && handleDeleteStructure(deleteDialog.structure.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2024-02">February 2024</SelectItem>
              <SelectItem value="2024-03">March 2024</SelectItem>
              <SelectItem value="2024-04">April 2024</SelectItem>
              <SelectItem value="2024-05">May 2024</SelectItem>
              <SelectItem value="2024-06">June 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPayroll}>
            <Download className="mr-2 h-4 w-4" />
            Export Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {payrollSummary.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{payrollSummary.processed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{payrollSummary.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{payrollSummary.paid}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(employees || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Salary Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(salaryStructures || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Without Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{employeesWithoutStructure.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activePayrollTab} onValueChange={setActivePayrollTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="salary-slips">Salary Processing</TabsTrigger>
              <TabsTrigger value="salary-structures">Salary Structures</TabsTrigger>
              <TabsTrigger value="payroll-records">Payroll Records</TabsTrigger>
            </TabsList>

            {/* Salary Processing Tab */}
            <TabsContent value="salary-slips" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="with-structure">With Salary Structure</SelectItem>
                      <SelectItem value="without-structure">Without Salary Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => setProcessAllDialog(true)} 
                  disabled={employeesWithStructure.length === 0}
                >
                  Process All Payroll
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Salary Structure</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Leaves</TableHead>
                    <TableHead>Calculated Salary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => {
                      if (!employee) return null;
                      
                      const structure = (salaryStructures || []).find(s => s.employeeId === employee.id);
                      const payrollRecord = (payroll || []).find(p => 
                        p.employeeId === employee.id && p.month === selectedMonth
                      );
                      const attendance = getEmployeeAttendance(employee.id);
                      const totalLeaves = getEmployeeLeaves(employee.id);
                      const calculatedSalary = structure ? calculateSalary(employee.id, structure) : 0;

                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>
                            {structure ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Configured
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Not Configured
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              P: {attendance.presentDays} | A: {attendance.absentDays} | H: {attendance.halfDays}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{totalLeaves} days</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {calculatedSalary.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {structure ? (
                                payrollRecord ? (
                                  <>
                                    {getStatusBadge(payrollRecord.status)}
                                    {payrollRecord.status === "processed" && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => setPayDialog({ open: true, payroll: payrollRecord })}
                                      >
                                        Mark Paid
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleGenerateSalarySlip(payrollRecord.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => setProcessDialog({ open: true, employee })}
                                  >
                                    Process Salary
                                  </Button>
                                )
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setStructureForm(prev => ({ ...prev, employeeId: employee.id.toString() }));
                                    setIsAddingStructure(true);
                                    setActivePayrollTab("salary-structures");
                                  }}
                                >
                                  Add Structure
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Salary Structures Tab */}
            <TabsContent value="salary-structures" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Salary Structures</h3>
                <Button onClick={() => setIsAddingStructure(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Structure
                </Button>
              </div>

              {/* Add/Edit Salary Structure Form */}
              {(isAddingStructure || editingStructure) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingStructure ? "Edit Salary Structure" : "Add Salary Structure"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee</Label>
                        <Select 
                          value={structureForm.employeeId} 
                          onValueChange={(value) => setStructureForm(prev => ({ ...prev, employeeId: value }))}
                          disabled={!!editingStructure}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employeesWithoutStructure.map(employee => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name} ({employee.employeeId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basicSalary">Basic Salary *</Label>
                        <Input
                          id="basicSalary"
                          type="number"
                          placeholder="Basic Salary"
                          value={structureForm.basicSalary}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, basicSalary: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hra">HRA</Label>
                        <Input
                          id="hra"
                          type="number"
                          placeholder="House Rent Allowance"
                          value={structureForm.hra}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, hra: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="da">DA</Label>
                        <Input
                          id="da"
                          type="number"
                          placeholder="Dearness Allowance"
                          value={structureForm.da}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, da: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialAllowance">Special Allowance</Label>
                        <Input
                          id="specialAllowance"
                          type="number"
                          placeholder="Special Allowance"
                          value={structureForm.specialAllowance}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, specialAllowance: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="conveyance">Conveyance</Label>
                        <Input
                          id="conveyance"
                          type="number"
                          placeholder="Conveyance"
                          value={structureForm.conveyance}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, conveyance: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                        <Input
                          id="medicalAllowance"
                          type="number"
                          placeholder="Medical Allowance"
                          value={structureForm.medicalAllowance}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, medicalAllowance: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otherAllowances">Other Allowances</Label>
                        <Input
                          id="otherAllowances"
                          type="number"
                          placeholder="Other Allowances"
                          value={structureForm.otherAllowances}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, otherAllowances: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="providentFund">Provident Fund</Label>
                        <Input
                          id="providentFund"
                          type="number"
                          placeholder="Provident Fund"
                          value={structureForm.providentFund}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, providentFund: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="professionalTax">Professional Tax</Label>
                        <Input
                          id="professionalTax"
                          type="number"
                          placeholder="Professional Tax"
                          value={structureForm.professionalTax}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, professionalTax: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="incomeTax">Income Tax</Label>
                        <Input
                          id="incomeTax"
                          type="number"
                          placeholder="Income Tax"
                          value={structureForm.incomeTax}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, incomeTax: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otherDeductions">Other Deductions</Label>
                        <Input
                          id="otherDeductions"
                          type="number"
                          placeholder="Other Deductions"
                          value={structureForm.otherDeductions}
                          onChange={(e) => setStructureForm(prev => ({ ...prev, otherDeductions: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={editingStructure ? handleUpdateStructure : handleAddStructure}
                        disabled={!structureForm.basicSalary}
                      >
                        {editingStructure ? "Update Structure" : "Add Structure"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAddingStructure(false);
                          setEditingStructure(null);
                          setStructureForm({
                            employeeId: "",
                            basicSalary: "",
                            hra: "",
                            da: "",
                            specialAllowance: "",
                            conveyance: "",
                            medicalAllowance: "",
                            otherAllowances: "",
                            providentFund: "",
                            professionalTax: "",
                            incomeTax: "",
                            otherDeductions: ""
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Salary Structures List */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Total CTC</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(salaryStructures || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No salary structures found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (salaryStructures || []).map((structure) => {
                      const employee = (employees || []).find(e => e.id === structure.employeeId);
                      const totalAllowances = (structure.hra || 0) + (structure.da || 0) + (structure.specialAllowance || 0) + 
                                            (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0);
                      const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                                            (structure.incomeTax || 0) + (structure.otherDeductions || 0);
                      const totalCTC = (structure.basicSalary || 0) + totalAllowances;

                      if (!employee) return null;

                      return (
                        <TableRow key={structure.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {(structure.basicSalary || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {totalAllowances.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {totalDeductions.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {totalCTC.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditStructure(structure)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setDeleteDialog({ open: true, structure })}
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
            </TabsContent>

            {/* Payroll Records Tab */}
            <TabsContent value="payroll-records" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payroll Records - {selectedMonth}</h3>
                <div className="text-sm text-muted-foreground">
                  Total Records: {(payroll || []).filter(p => p.month === selectedMonth).length}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payroll || []).filter(p => p.month === selectedMonth).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No payroll records found for {selectedMonth}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (payroll || [])
                      .filter(p => p.month === selectedMonth)
                      .map((record) => {
                        const employee = (employees || []).find(e => e.id === record.employeeId);
                        if (!employee) return null;

                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                              </div>
                            </TableCell>
                            <TableCell>{record.month}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <IndianRupee className="h-4 w-4 mr-1" />
                                {(record.basicSalary || 0).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <IndianRupee className="h-4 w-4 mr-1" />
                                {(record.allowances || 0).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <IndianRupee className="h-4 w-4 mr-1" />
                                {(record.deductions || 0).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium flex items-center">
                                <IndianRupee className="h-4 w-4 mr-1" />
                                {(record.netSalary || 0).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>{record.paymentDate || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {record.status === "processed" && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => setPayDialog({ open: true, payroll: record })}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    const slip = (salarySlips || []).find(s => s.payrollId === record.id);
                                    if (slip) {
                                      handleViewSalarySlip(slip);
                                    } else {
                                      handleGenerateSalarySlip(record.id);
                                    }
                                  }}
                                >
                                  {salarySlips.find(s => s.payrollId === record.id) ? "View Slip" : "Generate Slip"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollTab;