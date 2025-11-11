// src/components/hrms/tabs/EmployeesTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Trash2, Plus, Download, Sheet, User } from "lucide-react";
import { toast } from "sonner";
import { Employee } from "./types";
import StatCard from "./StatCard";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";
import ExcelImportDialog from "./ExcelImportDialog";

interface EmployeesTabProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setActiveTab: (tab: string) => void;
}

const EmployeesTab = ({ employees, setEmployees, setActiveTab }: EmployeesTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [employeesItemsPerPage, setEmployeesItemsPerPage] = useState(5);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedEmployees = filteredEmployees.slice(
    (employeesPage - 1) * employeesItemsPerPage,
    employeesPage * employeesItemsPerPage
  );

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast.success("Employee deleted successfully!");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "default";
      case "inactive": return "destructive";
      default: return "outline";
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Implementation for Excel export
    toast.success(`${filename} exported successfully!`);
  };

  const handleExportEmployees = () => {
    const exportData = employees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      aadharNumber: emp.aadharNumber,
      department: emp.department,
      position: emp.position,
      joinDate: emp.joinDate,
      status: emp.status,
      salary: emp.salary,
      uan: emp.uan,
      esicNumber: emp.esicNumber
    }));
    exportToExcel(exportData, 'employees_data');
  };

  const handleImportEmployees = (file: File) => {
    // Implementation for Excel import
    toast.success("Employees imported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search employees..."
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setImportDialogOpen(true)}
          >
            <Sheet className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button variant="outline" onClick={handleExportEmployees}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => setActiveTab("onboarding")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <ExcelImportDialog 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportEmployees}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Employees" value={employees.length} />
        <StatCard 
          title="Active" 
          value={employees.filter(e => e.status === "active").length} 
          className="text-primary" 
        />
        <StatCard 
          title="Departments" 
          value={new Set(employees.map(e => e.department)).size} 
          className="text-primary" 
        />
        <StatCard 
          title="Monthly Salary" 
          value={employees.reduce((sum, emp) => sum + emp.salary, 0)} 
          className="text-primary" 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Database</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {employee.name}
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.joinDate}</TableCell>
                  <TableCell>₹{employee.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Employee Details - {employee.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div><strong>Employee ID:</strong> {employee.employeeId}</div>
                              <div><strong>Email:</strong> {employee.email}</div>
                              <div><strong>Phone:</strong> {employee.phone}</div>
                              <div><strong>Aadhar:</strong> {employee.aadharNumber}</div>
                              <div><strong>Department:</strong> {employee.department}</div>
                              <div><strong>Position:</strong> {employee.position}</div>
                              <div><strong>UAN:</strong> {employee.uan}</div>
                              <div><strong>ESIC:</strong> {employee.esicNumber}</div>
                            </div>
                            <div>
                              <strong>Documents:</strong>
                              <div className="mt-2 space-y-2">
                                {employee.documents.map(doc => (
                                  <div key={doc.id} className="flex justify-between items-center p-2 border rounded">
                                    <span>{doc.type}</span>
                                    <Badge variant={getStatusColor(doc.status)}>
                                      {doc.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEmployees.length > 0 && (
            <Pagination
              currentPage={employeesPage}
              totalPages={Math.ceil(filteredEmployees.length / employeesItemsPerPage)}
              totalItems={filteredEmployees.length}
              itemsPerPage={employeesItemsPerPage}
              onPageChange={setEmployeesPage}
              onItemsPerPageChange={setEmployeesItemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesTab;