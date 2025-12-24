import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOutletContext, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Search, Eye, Edit, Trash2, Mail, Phone, MapPin, Clock, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import EmployeesTab from "../superadmin/EmployeesTab";
import OnboardingTab from "../superadmin/OnboardingTab";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  site: z.string().min(1, "Please select a site"),
  shift: z.string().min(1, "Please select a shift"),
  department: z.string().min(1, "Please select department"),
  role: z.string().min(1, "Please enter job role"),
});

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  site: string;
  shift: string;
  status: string;
  joinDate: string;
};

type SalaryStructure = {
  id: number;
  employeeId: number;
  employeeName: string;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowances: number;
  totalSalary: number;
};

const SupervisorEmployees = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeHRMSTab, setActiveHRMSTab] = useState<"employees" | "onboarding">("employees");
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [activeTab, setActiveTab] = useState("employees");

  // Load employees from localStorage
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  // Save employees to localStorage
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      site: "",
      shift: "",
      department: "",
      role: "",
    },
  });

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      form.reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        site: employee.site,
        shift: employee.shift,
        department: employee.department,
        role: employee.role,
      });
    } else {
      setEditingEmployee(null);
      form.reset({
        name: "",
        email: "",
        phone: "",
        site: "",
        shift: "",
        department: "",
        role: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof employeeSchema>) => {
    if (editingEmployee) {
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id 
          ? { 
              ...e, 
              name: values.name, 
              email: values.email,
              phone: values.phone, 
              site: values.site, 
              shift: values.shift,
              department: values.department,
              role: values.role,
            } 
          : e
      ));
      toast.success("Employee updated successfully!");
    } else {
      const newEmployee: Employee = {
        id: Date.now(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        site: values.site,
        shift: values.shift,
        department: values.department,
        role: values.role,
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
      };
      setEmployees([...employees, newEmployee]);
      toast.success("Employee added successfully!");
    }
    setDialogOpen(false);
    form.reset();
  };

  const handleDelete = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(e => e.id !== employeeToDelete));
      toast.success("Employee deleted successfully!");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const toggleEmployeeStatus = (id: number) => {
    setEmployees(employees.map(employee =>
      employee.id === id 
        ? { ...employee, status: employee.status === "active" ? "inactive" : "active" }
        : employee
    ));
    toast.success("Employee status updated!");
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    inactive: employees.filter(e => e.status === "inactive").length,
  };

  const handleNavigateToHRMS = (tab: "employees" | "onboarding") => {
    setActiveHRMSTab(tab);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Employee Management"
        subtitle="Manage your team members and their details"
        onMenuClick={onMenuClick}
      />
      
      <div className="p-6 space-y-6">
        {/* HRMS Shortcut Buttons */}
        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              HRMS Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access full HRMS features with detailed employee management and onboarding
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => handleNavigateToHRMS("employees")}
                  variant={activeHRMSTab === "employees" ? "default" : "outline"}
                  className="flex-1 justify-start gap-2 h-auto py-3"
                >
                  <Users className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Employees</div>
                    <div className="text-xs text-muted-foreground">View all employees & details</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleNavigateToHRMS("onboarding")}
                  variant={activeHRMSTab === "onboarding" ? "default" : "outline"}
                  className="flex-1 justify-start gap-2 h-auto py-3"
                >
                  <UserPlus className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Onboarding</div>
                    <div className="text-xs text-muted-foreground">Add new employees & documents</div>
                  </div>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Clicking these buttons will redirect you to the full HRMS system with enhanced features
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* HRMS Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employees" className="flex-1 min-w-[120px]">
                  Employees
                </TabsTrigger>
                <TabsTrigger value="onboarding" className="flex-1 min-w-[120px]">
                  Onboarding
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="employees">
                <EmployeesTab
                  employees={employees}
                  setEmployees={setEmployees}
                  setActiveTab={setActiveTab}
                />
              </TabsContent>
              
              <TabsContent value="onboarding">
                <OnboardingTab
                  employees={employees}
                  setEmployees={setEmployees}
                  salaryStructures={salaryStructures}
                  setSalaryStructures={setSalaryStructures}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        
      </div>

      

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone and all their data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// User icon component
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default SupervisorEmployees;