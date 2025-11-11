// src/components/hrms/tabs/ReportsTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText } from "lucide-react";
import { Employee, Attendance, Payroll } from "./types";

interface ReportsTabProps {
  employees: Employee[];
  attendance: Attendance[];
  payroll: Payroll[];
}

const ReportsTab = ({ employees, attendance, payroll }: ReportsTabProps) => {
  const attendanceSummary = {
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
    late: attendance.filter(a => a.status === "late").length,
    halfDay: attendance.filter(a => a.status === "half-day").length,
    total: attendance.length
  };

  const payrollSummary = {
    total: payroll.reduce((sum, p) => sum + p.netSalary, 0),
    processed: payroll.filter(p => p.status === "processed").length,
    pending: payroll.filter(p => p.status === "pending").length
  };

  const documentExpiryReport = employees.flatMap(emp =>
    emp.documents.map(doc => ({
      employee: emp.name,
      document: doc.type,
      expiryDate: doc.expiryDate,
      status: doc.status
    }))
  );

  const handleExportEmployees = () => {
    // Implementation for export
    console.log("Exporting employees data...");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "valid": return "default";
      case "expired": return "destructive";
      case "expiring": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">HR Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportEmployees}>
            <Download className="mr-2 h-4 w-4" />
            Export Employees
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Present:</span>
                <span className="font-medium">{attendanceSummary.present}</span>
              </div>
              <div className="flex justify-between">
                <span>Absent:</span>
                <span className="font-medium text-destructive">{attendanceSummary.absent}</span>
              </div>
              <div className="flex justify-between">
                <span>Late:</span>
                <span className="font-medium text-secondary">{attendanceSummary.late}</span>
              </div>
              <div className="flex justify-between">
                <span>Half Day:</span>
                <span className="font-medium text-muted-foreground">{attendanceSummary.halfDay}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Records:</span>
                <span className="font-medium">{attendanceSummary.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payroll Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">₹{payrollSummary.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Processed:</span>
                <span className="font-medium text-primary">{payrollSummary.processed}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-medium text-muted-foreground">{payrollSummary.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department-wise Staff */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Staff Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(employees.map(e => e.department))).map(dept => (
                <div key={dept} className="flex justify-between items-center">
                  <span>{dept}</span>
                  <Badge>
                    {employees.filter(e => e.department === dept).length} employees
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Expiry */}
        <Card>
          <CardHeader>
            <CardTitle>Document Expiry Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentExpiryReport.slice(0, 5).map((doc, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium">{doc.employee}</div>
                    <div className="text-muted-foreground">{doc.document}</div>
                  </div>
                  <Badge variant={getStatusColor(doc.status)}>
                    {doc.expiryDate}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsTab;