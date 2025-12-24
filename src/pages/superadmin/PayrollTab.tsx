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
  Send,
  Sheet,
  MoreHorizontal
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [paymentStatusDialog, setPaymentStatusDialog] = useState<{ open: boolean; payroll: Payroll | null }>({ open: false, payroll: null });
  const [paymentStatusForm, setPaymentStatusForm] = useState({
    status: "paid",
    paidAmount: "",
    notes: ""
  });

  // Dialog states
  const [processDialog, setProcessDialog] = useState<{ open: boolean; employee: Employee | null }>({ open: false, employee: null });
  const [payDialog, setPayDialog] = useState<{ open: boolean; payroll: Payroll | null }>({ open: false, payroll: null });
  const [slipDialog, setSlipDialog] = useState<{ open: boolean; salarySlip: SalarySlip | null }>({ open: false, salarySlip: null });
  const [processAllDialog, setProcessAllDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; structure: SalaryStructure | null }>({ open: false, structure: null });

  // Salary structure form state - UPDATED TO MATCH IMAGE FORMAT
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
    otherDeductions: "",
    leaveEncashment: "",
    arrears: "",
    esic: "",
    advance: "",
    mlwf: ""
  });

  // Calculate payroll summary with safe defaults
  const payrollSummary = useMemo(() => {
    const total = (payroll || []).reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const processed = (payroll || []).filter(p => p.status === "processed").length;
    const pending = (payroll || []).filter(p => p.status === "pending").length;
    const paid = (payroll || []).filter(p => p.status === "paid").length;
    const hold = (payroll || []).filter(p => p.status === "hold").length;
    const partPaid = (payroll || []).filter(p => p.status === "part-paid").length;

    return { total, processed, pending, paid, hold, partPaid };
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
                           (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0) +
                           (structure.leaveEncashment || 0) + (structure.arrears || 0);
    
    // Deductions are usually fixed
    const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                           (structure.incomeTax || 0) + (structure.otherDeductions || 0) +
                           (structure.esic || 0) + (structure.advance || 0) + (structure.mlwf || 0);

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
                           (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0) +
                           (structure.leaveEncashment || 0) + (structure.arrears || 0);
    const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                           (structure.incomeTax || 0) + (structure.otherDeductions || 0) +
                           (structure.esic || 0) + (structure.advance || 0) + (structure.mlwf || 0);

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
      leaves: totalLeaves,
      paidAmount: calculatedSalary,
      paymentStatus: "paid"
    };

    setPayroll(prev => [...(prev || []).filter(p => !(p.employeeId === employeeId && p.month === selectedMonth)), newPayroll]);
    setProcessDialog({ open: false, employee: null });
  };

  // Update payment status
  const handleUpdatePaymentStatus = () => {
    if (!paymentStatusDialog.payroll) return;

    const updatedPayroll = {
      ...paymentStatusDialog.payroll,
      status: paymentStatusForm.status,
      paidAmount: paymentStatusForm.status === "part-paid" ? parseFloat(paymentStatusForm.paidAmount) || 0 : paymentStatusDialog.payroll.netSalary,
      paymentDate: paymentStatusForm.status === "paid" ? new Date().toISOString().split('T')[0] : "",
      paymentStatus: paymentStatusForm.status,
      notes: paymentStatusForm.notes
    };

    setPayroll(prev => (prev || []).map(p => 
      p.id === updatedPayroll.id ? updatedPayroll : p
    ));

    setPaymentStatusDialog({ open: false, payroll: null });
    setPaymentStatusForm({
      status: "paid",
      paidAmount: "",
      notes: ""
    });
  };

  // Open payment status dialog
  const handleOpenPaymentStatus = (payroll: Payroll) => {
    setPaymentStatusDialog({ open: true, payroll });
    setPaymentStatusForm({
      status: payroll.status,
      paidAmount: payroll.paidAmount?.toString() || payroll.netSalary?.toString() || "",
      notes: payroll.notes || ""
    });
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
                                (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0) +
                                (structure.leaveEncashment || 0) + (structure.arrears || 0);
          const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                                (structure.incomeTax || 0) + (structure.otherDeductions || 0) +
                                (structure.esic || 0) + (structure.advance || 0) + (structure.mlwf || 0);

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
            leaves: totalLeaves,
            paidAmount: calculatedSalary,
            paymentStatus: "paid"
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
      leaveEncashment: parseFloat(structureForm.leaveEncashment) || 0,
      arrears: parseFloat(structureForm.arrears) || 0,
      esic: parseFloat(structureForm.esic) || 0,
      advance: parseFloat(structureForm.advance) || 0,
      mlwf: parseFloat(structureForm.mlwf) || 0
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
      otherDeductions: "",
      leaveEncashment: "",
      arrears: "",
      esic: "",
      advance: "",
      mlwf: ""
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
      leaveEncashment: parseFloat(structureForm.leaveEncashment) || 0,
      arrears: parseFloat(structureForm.arrears) || 0,
      esic: parseFloat(structureForm.esic) || 0,
      advance: parseFloat(structureForm.advance) || 0,
      mlwf: parseFloat(structureForm.mlwf) || 0
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
      otherDeductions: "",
      leaveEncashment: "",
      arrears: "",
      esic: "",
      advance: "",
      mlwf: ""
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
      otherDeductions: (structure.otherDeductions || 0).toString(),
      leaveEncashment: (structure.leaveEncashment || 0).toString(),
      arrears: (structure.arrears || 0).toString(),
      esic: (structure.esic || 0).toString(),
      advance: (structure.advance || 0).toString(),
      mlwf: (structure.mlwf || 0).toString()
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
            <div class="company-name">S K ENTERPRISES</div>
            <div class="slip-title">SALARY SLIP</div>
            <div>Period: ${slipDialog.salarySlip.month}</div>
            <div>Wages Slip Rule 27(2) Maharashtra Minimum Wages Rules, 1963</div>
          </div>
          
          <div class="employee-info">
            <div>
              <strong>Name:</strong> ${employee.name}<br>
              <strong>Employee ID:</strong> ${employee.employeeId}<br>
              <strong>Department:</strong> ${employee.department}
            </div>
            <div>
              <strong>Generated Date:</strong> ${new Date(slipDialog.salarySlip.generatedDate).toLocaleDateString()}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Earnings Section -->
            <div class="section">
              <div class="section-title">EARNINGS</div>
              <table class="breakdown">
                <tr>
                  <td>BASIC</td>
                  <td class="amount">₹${slipDialog.salarySlip.basicSalary.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>DA</td>
                  <td class="amount">₹${((structure?.da || 0) + (structure?.specialAllowance || 0)).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>HRA</td>
                  <td class="amount">₹${(structure?.hra || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>CCA</td>
                  <td class="amount">₹${(structure?.conveyance || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>BONUS</td>
                  <td class="amount">₹${(structure?.specialAllowance || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>LEAVE</td>
                  <td class="amount">₹${(structure?.leaveEncashment || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>MEDICAL</td>
                  <td class="amount">₹${(structure?.medicalAllowance || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ARREARS</td>
                  <td class="amount">₹${(structure?.arrears || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>OTHER ALL</td>
                  <td class="amount">₹${(structure?.otherAllowances || 0).toLocaleString()}</td>
                </tr>
                <tr class="total">
                  <td><strong>TOTAL EARNINGS</strong></td>
                  <td class="amount"><strong>₹${(slipDialog.salarySlip.basicSalary + slipDialog.salarySlip.allowances).toLocaleString()}</strong></td>
                </tr>
              </table>
            </div>

            <!-- Deductions Section -->
            <div class="section">
              <div class="section-title">DEDUCTIONS</div>
              <table class="breakdown">
                <tr>
                  <td>PF</td>
                  <td class="amount">-₹${(structure?.providentFund || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ESIC</td>
                  <td class="amount">-₹${(structure?.esic || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>ADVANCE</td>
                  <td class="amount">-₹${(structure?.advance || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>MLWF</td>
                  <td class="amount">-₹${(structure?.mlwf || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Profession Tax</td>
                  <td class="amount">-₹${(structure?.professionalTax || 0).toLocaleString()}</td>
                </tr>
                <tr class="total">
                  <td><strong>TOTAL DEDUCTIONS</strong></td>
                  <td class="amount"><strong>-₹${slipDialog.salarySlip.deductions.toLocaleString()}</strong></td>
                </tr>
              </table>
            </div>
          </div>

          <div class="section">
            <div class="section-title">NET SALARY</div>
            <table class="breakdown">
              <tr class="total">
                <td><strong>NET PAYABLE</strong></td>
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

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>Office No 505, Global Square, Deccan College Road, Yerwada, Pune 411006</p>
            <p>THIS IS COMPUTER GENERATED SLIP NOT REQUIRED SIGNATURE & STAMP</p>
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

  // Export payroll data to Excel format
  const handleExportPayrollExcel = () => {
    if (!payroll || payroll.length === 0) {
      alert("No payroll data to export");
      return;
    }

    const payrollData = payroll.map(p => {
      const employee = (employees || []).find(e => e.id === p.employeeId);
      return {
        "SR": payroll.indexOf(p) + 1,
        "BANK AC": employee?.accountNumber || "N/A",
        "BRANCH": employee?.bankBranch || "N/A",
        "IFSC CODE": employee?.ifscCode || "N/A",
        "NAMES": employee?.name || "N/A",
        "G": employee?.gender?.charAt(0) || "N/A",
        "MONTH": p.month || "N/A",
        "DEP": employee?.department || "N/A",
        "STATUS": p.status?.toUpperCase() || "N/A",
        "IN HAND": p.paidAmount || 0,
        "DESG": employee?.position || "N/A",
        "DAYS": p.presentDays || 0,
        "OT": p.overtimeHours || 0,
        "BASIC": p.basicSalary || 0,
        "DA": p.da || 0,
        "HRA": p.hra || 0,
        "OTHER": p.otherAllowances || 0,
        "LEAVE": p.leaves || 0,
        "BONUS": p.bonus || 0,
        "OT AMOUNT": p.overtimeAmount || 0,
        "GROSS": (p.basicSalary || 0) + (p.allowances || 0),
        "PF": p.providentFund || 0,
        "ESIC": p.esic || 0,
        "PT": p.professionalTax || 0,
        "MLWF": p.mlwf || 0,
        "ADVANCE": p.advance || 0,
        "UNI & ID": p.uniformAndId || 0,
        "FINE": p.fine || 0,
        "DED": p.deductions || 0,
        "OTHER DED": p.otherDeductions || 0,
        "NET": p.netSalary || 0
      };
    });

    // Add totals row
    const totals = {
      "SR": "TOTAL",
      "BANK AC": "",
      "BRANCH": "",
      "IFSC CODE": "",
      "NAMES": "",
      "G": "",
      "MONTH": "",
      "DEP": "",
      "STATUS": "",
      "IN HAND": payrollData.reduce((sum, row) => sum + (row["IN HAND"] || 0), 0),
      "DESG": "",
      "DAYS": payrollData.reduce((sum, row) => sum + (row["DAYS"] || 0), 0),
      "OT": payrollData.reduce((sum, row) => sum + (row["OT"] || 0), 0),
      "BASIC": payrollData.reduce((sum, row) => sum + (row["BASIC"] || 0), 0),
      "DA": payrollData.reduce((sum, row) => sum + (row["DA"] || 0), 0),
      "HRA": payrollData.reduce((sum, row) => sum + (row["HRA"] || 0), 0),
      "OTHER": payrollData.reduce((sum, row) => sum + (row["OTHER"] || 0), 0),
      "LEAVE": payrollData.reduce((sum, row) => sum + (row["LEAVE"] || 0), 0),
      "BONUS": payrollData.reduce((sum, row) => sum + (row["BONUS"] || 0), 0),
      "OT AMOUNT": payrollData.reduce((sum, row) => sum + (row["OT AMOUNT"] || 0), 0),
      "GROSS": payrollData.reduce((sum, row) => sum + (row["GROSS"] || 0), 0),
      "PF": payrollData.reduce((sum, row) => sum + (row["PF"] || 0), 0),
      "ESIC": payrollData.reduce((sum, row) => sum + (row["ESIC"] || 0), 0),
      "PT": payrollData.reduce((sum, row) => sum + (row["PT"] || 0), 0),
      "MLWF": payrollData.reduce((sum, row) => sum + (row["MLWF"] || 0), 0),
      "ADVANCE": payrollData.reduce((sum, row) => sum + (row["ADVANCE"] || 0), 0),
      "UNI & ID": payrollData.reduce((sum, row) => sum + (row["UNI & ID"] || 0), 0),
      "FINE": payrollData.reduce((sum, row) => sum + (row["FINE"] || 0), 0),
      "DED": payrollData.reduce((sum, row) => sum + (row["DED"] || 0), 0),
      "OTHER DED": payrollData.reduce((sum, row) => sum + (row["OTHER DED"] || 0), 0),
      "NET": payrollData.reduce((sum, row) => sum + (row["NET"] || 0), 0)
    };

    const exportData = [...payrollData, totals];

    const csvContent = [
      Object.keys(exportData[0] || {}).join(","),
      ...exportData.map(row => Object.values(row).join(","))
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
      paid: "bg-green-100 text-green-800",
      hold: "bg-red-100 text-red-800",
      "part-paid": "bg-orange-100 text-orange-800"
    };

    const statusLabels = {
      pending: "Pending",
      processed: "Processed",
      paid: "Paid",
      hold: "Hold",
      "part-paid": "Part Paid"
    };

    return (
      <Badge variant="secondary" className={variants[status as keyof typeof variants]}>
        {statusLabels[status as keyof typeof statusLabels]}
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
                           (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0) +
                           (structure.leaveEncashment || 0) + (structure.arrears || 0);
    const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                           (structure.incomeTax || 0) + (structure.otherDeductions || 0) +
                           (structure.esic || 0) + (structure.advance || 0) + (structure.mlwf || 0);

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

      {/* Payment Status Dialog */}
      <Dialog open={paymentStatusDialog.open} onOpenChange={(open) => setPaymentStatusDialog({ open, payroll: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update payment status for {getEmployeeDetails(paymentStatusDialog.payroll?.employeeId || 0)?.name}
            </DialogDescription>
          </DialogHeader>
          
          {paymentStatusDialog.payroll && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    ₹{paymentStatusDialog.payroll.netSalary?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700">
                    Total Net Salary
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select 
                    value={paymentStatusForm.status} 
                    onValueChange={(value) => setPaymentStatusForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="part-paid">Part Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentStatusForm.status === "part-paid" && (
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      placeholder="Enter paid amount"
                      value={paymentStatusForm.paidAmount}
                      onChange={(e) => setPaymentStatusForm(prev => ({ ...prev, paidAmount: e.target.value }))}
                      max={paymentStatusDialog.payroll.netSalary}
                    />
                    <div className="text-xs text-muted-foreground">
                      Remaining: ₹{(
                        (paymentStatusDialog.payroll.netSalary || 0) - 
                        (parseFloat(paymentStatusForm.paidAmount) || 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any notes..."
                    value={paymentStatusForm.notes}
                    onChange={(e) => setPaymentStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentStatusDialog({ open: false, payroll: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePaymentStatus}>
              Update Status
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
          <Button variant="outline" onClick={handleExportPayrollExcel}>
            <Sheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-6">
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
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{payrollSummary.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{payrollSummary.hold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Part Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{payrollSummary.partPaid}</div>
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
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleOpenPaymentStatus(payrollRecord)}
                                    >
                                      Status
                                    </Button>
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

            {/* Salary Structures Tab - UPDATED TO MATCH IMAGE FORMAT */}
            <TabsContent value="salary-structures" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Salary Structures</h3>
                <Button onClick={() => setIsAddingStructure(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Structure
                </Button>
              </div>

              {/* Add/Edit Salary Structure Form - UPDATED TO MATCH IMAGE */}
              {(isAddingStructure || editingStructure) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingStructure ? "Edit Salary Structure" : "Add Salary Structure"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee *</Label>
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

                    {/* Earnings Section - Matching the image format */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4 text-lg">EARNINGS</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="basic" className="font-medium">BASIC *</Label>
                            <Input
                              id="basic"
                              type="number"
                              placeholder="Basic Salary"
                              value={structureForm.basicSalary}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, basicSalary: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="da" className="font-medium">DA</Label>
                            <Input
                              id="da"
                              type="number"
                              placeholder="Dearness Allowance"
                              value={structureForm.da}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, da: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hra" className="font-medium">HRA</Label>
                            <Input
                              id="hra"
                              type="number"
                              placeholder="House Rent Allowance"
                              value={structureForm.hra}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, hra: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="cca" className="font-medium">CCA</Label>
                            <Input
                              id="cca"
                              type="number"
                              placeholder="City Compensatory Allowance"
                              value={structureForm.conveyance}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, conveyance: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="medical" className="font-medium">MEDICAL</Label>
                            <Input
                              id="medical"
                              type="number"
                              placeholder="Medical Allowance"
                              value={structureForm.medicalAllowance}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, medicalAllowance: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="otherAll" className="font-medium">OTHER ALL</Label>
                            <Input
                              id="otherAll"
                              type="number"
                              placeholder="Other Allowances"
                              value={structureForm.otherAllowances}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, otherAllowances: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Earnings from Image */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="bonus" className="font-medium">BONUS</Label>
                            <Input
                              id="bonus"
                              type="number"
                              placeholder="Bonus"
                              value={structureForm.specialAllowance}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, specialAllowance: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="leave" className="font-medium">LEAVE</Label>
                            <Input
                              id="leave"
                              type="number"
                              placeholder="Leave Encashment"
                              value={structureForm.leaveEncashment}
                              onChange={(e) => setStructureForm(prev => ({ 
                                ...prev, 
                                leaveEncashment: e.target.value 
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="arrears" className="font-medium">ARREARS</Label>
                            <Input
                              id="arrears"
                              type="number"
                              placeholder="Arrears"
                              value={structureForm.arrears}
                              onChange={(e) => setStructureForm(prev => ({ 
                                ...prev, 
                                arrears: e.target.value 
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deductions Section - Matching the image format */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4 text-lg">DEDUCTIONS</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="pf" className="font-medium">PF</Label>
                            <Input
                              id="pf"
                              type="number"
                              placeholder="Provident Fund"
                              value={structureForm.providentFund}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, providentFund: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="esic" className="font-medium">ESIC</Label>
                            <Input
                              id="esic"
                              type="number"
                              placeholder="ESIC Contribution"
                              value={structureForm.esic}
                              onChange={(e) => setStructureForm(prev => ({ 
                                ...prev, 
                                esic: e.target.value 
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="advance" className="font-medium">ADVANCE</Label>
                            <Input
                              id="advance"
                              type="number"
                              placeholder="Advance Deduction"
                              value={structureForm.advance}
                              onChange={(e) => setStructureForm(prev => ({ 
                                ...prev, 
                                advance: e.target.value 
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="mlwf" className="font-medium">MLWF</Label>
                            <Input
                              id="mlwf"
                              type="number"
                              placeholder="MLWF Deduction"
                              value={structureForm.mlwf}
                              onChange={(e) => setStructureForm(prev => ({ 
                                ...prev, 
                                mlwf: e.target.value 
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="professionTax" className="font-medium">Profession Tax</Label>
                            <Input
                              id="professionTax"
                              type="number"
                              placeholder="Professional Tax"
                              value={structureForm.professionalTax}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, professionalTax: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="incomeTax" className="font-medium">INCOME TAX</Label>
                            <Input
                              id="incomeTax"
                              type="number"
                              placeholder="Income Tax"
                              value={structureForm.incomeTax}
                              onChange={(e) => setStructureForm(prev => ({ ...prev, incomeTax: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Earnings:</span>
                            <span className="font-medium text-green-600">
                              ₹{(
                                (parseFloat(structureForm.basicSalary) || 0) +
                                (parseFloat(structureForm.da) || 0) +
                                (parseFloat(structureForm.hra) || 0) +
                                (parseFloat(structureForm.conveyance) || 0) +
                                (parseFloat(structureForm.medicalAllowance) || 0) +
                                (parseFloat(structureForm.otherAllowances) || 0) +
                                (parseFloat(structureForm.specialAllowance) || 0) +
                                (parseFloat(structureForm.leaveEncashment) || 0) +
                                (parseFloat(structureForm.arrears) || 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Deductions:</span>
                            <span className="font-medium text-red-600">
                              ₹{(
                                (parseFloat(structureForm.providentFund) || 0) +
                                (parseFloat(structureForm.esic) || 0) +
                                (parseFloat(structureForm.advance) || 0) +
                                (parseFloat(structureForm.mlwf) || 0) +
                                (parseFloat(structureForm.professionalTax) || 0) +
                                (parseFloat(structureForm.incomeTax) || 0) +
                                (parseFloat(structureForm.otherDeductions) || 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Net Salary:</span>
                            <span className="font-bold text-lg">
                              ₹{(
                                (
                                  (parseFloat(structureForm.basicSalary) || 0) +
                                  (parseFloat(structureForm.da) || 0) +
                                  (parseFloat(structureForm.hra) || 0) +
                                  (parseFloat(structureForm.conveyance) || 0) +
                                  (parseFloat(structureForm.medicalAllowance) || 0) +
                                  (parseFloat(structureForm.otherAllowances) || 0) +
                                  (parseFloat(structureForm.specialAllowance) || 0) +
                                  (parseFloat(structureForm.leaveEncashment) || 0) +
                                  (parseFloat(structureForm.arrears) || 0)
                                ) - (
                                  (parseFloat(structureForm.providentFund) || 0) +
                                  (parseFloat(structureForm.esic) || 0) +
                                  (parseFloat(structureForm.advance) || 0) +
                                  (parseFloat(structureForm.mlwf) || 0) +
                                  (parseFloat(structureForm.professionalTax) || 0) +
                                  (parseFloat(structureForm.incomeTax) || 0) +
                                  (parseFloat(structureForm.otherDeductions) || 0)
                                )
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={editingStructure ? handleUpdateStructure : handleAddStructure}
                        disabled={!structureForm.basicSalary || !structureForm.employeeId}
                        className="flex-1"
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
                            otherDeductions: "",
                            leaveEncashment: "",
                            arrears: "",
                            esic: "",
                            advance: "",
                            mlwf: ""
                          });
                        }}
                        className="flex-1"
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
                                            (structure.conveyance || 0) + (structure.medicalAllowance || 0) + (structure.otherAllowances || 0) +
                                            (structure.leaveEncashment || 0) + (structure.arrears || 0);
                      const totalDeductions = (structure.providentFund || 0) + (structure.professionalTax || 0) + 
                                            (structure.incomeTax || 0) + (structure.otherDeductions || 0) +
                                            (structure.esic || 0) + (structure.advance || 0) + (structure.mlwf || 0);
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

            {/* Payroll Records Tab - UPDATED FORMAT */}
            <TabsContent value="payroll-records" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payroll Records - {selectedMonth}</h3>
                <div className="text-sm text-muted-foreground">
                  Total Records: {(payroll || []).filter(p => p.month === selectedMonth).length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">SR</TableHead>
                      <TableHead>BANK AC</TableHead>
                      <TableHead>BRANCH</TableHead>
                      <TableHead>IFSC CODE</TableHead>
                      <TableHead>NAMES</TableHead>
                      <TableHead className="w-8">G</TableHead>
                      <TableHead>MONTH</TableHead>
                      <TableHead>DEP</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>IN HAND</TableHead>
                      <TableHead>DESG</TableHead>
                      <TableHead>DAYS</TableHead>
                      <TableHead>OT</TableHead>
                      <TableHead>BASIC</TableHead>
                      <TableHead>DA</TableHead>
                      <TableHead>HRA</TableHead>
                      <TableHead>OTHER</TableHead>
                      <TableHead>LEAVE</TableHead>
                      <TableHead>BONUS</TableHead>
                      <TableHead>OT AMOUNT</TableHead>
                      <TableHead>GROSS</TableHead>
                      <TableHead>PF</TableHead>
                      <TableHead>ESIC</TableHead>
                      <TableHead>PT</TableHead>
                      <TableHead>MLWF</TableHead>
                      <TableHead>ADVANCE</TableHead>
                      <TableHead>UNI & ID</TableHead>
                      <TableHead>FINE</TableHead>
                      <TableHead>DED</TableHead>
                      <TableHead>OTHER DED</TableHead>
                      <TableHead>NET</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payroll || []).filter(p => p.month === selectedMonth).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={32} className="text-center py-8 text-muted-foreground">
                          No payroll records found for {selectedMonth}
                        </TableCell>
                      </TableRow>
                    ) : (
                      (payroll || [])
                        .filter(p => p.month === selectedMonth)
                        .map((record, index) => {
                          const employee = (employees || []).find(e => e.id === record.employeeId);
                          if (!employee) return null;

                          const grossSalary = (record.basicSalary || 0) + (record.allowances || 0);

                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{employee.accountNumber || "N/A"}</TableCell>
                              <TableCell>{employee.bankBranch || "N/A"}</TableCell>
                              <TableCell>{employee.ifscCode || "N/A"}</TableCell>
                              <TableCell className="font-medium">{employee.name}</TableCell>
                              <TableCell>{employee.gender?.charAt(0) || "N/A"}</TableCell>
                              <TableCell>{record.month}</TableCell>
                              <TableCell>{employee.department}</TableCell>
                              <TableCell>{getStatusBadge(record.status)}</TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.paidAmount || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>{employee.position}</TableCell>
                              <TableCell>{record.presentDays || 0}</TableCell>
                              <TableCell>{record.overtimeHours || 0}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.basicSalary || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.da || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.hra || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.otherAllowances || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>{record.leaves || 0}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.bonus || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.overtimeAmount || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {grossSalary.toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.providentFund || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.esic || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.professionalTax || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.mlwf || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.advance || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.uniformAndId || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.fine || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.deductions || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {(record.otherDeductions || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <IndianRupee className="h-4 w-4 mr-1" />
                                  {(record.netSalary || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenPaymentStatus(record)}>
                                      Update Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      const slip = (salarySlips || []).find(s => s.payrollId === record.id);
                                      if (slip) {
                                        handleViewSalarySlip(slip);
                                      } else {
                                        handleGenerateSalarySlip(record.id);
                                      }
                                    }}>
                                      {salarySlips.find(s => s.payrollId === record.id) ? "View Slip" : "Generate Slip"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollTab;