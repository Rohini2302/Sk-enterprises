import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  ArrowLeft, 
  Download, 
  Filter, 
  Calendar, 
  Building, 
  Users, 
  Edit, 
  Save, 
  X,
  Plus,
  Minus,
  User,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Enhanced shortages data structure with supervisor names and editable deploy
const shortagesData = {
  sites: [
    {
      name: 'Grand High Street Mall',
      deploy: 40,
      supervisor: 'Mahendra Kamble',
      shortages: {
        '2024-09-01': 0, '2024-09-02': 0, '2024-09-03': 2, '2024-09-04': 2, '2024-09-05': 2,
        '2024-09-06': 2, '2024-09-07': 2, '2024-09-08': 1, '2024-09-09': 1, '2024-09-10': 1,
        '2024-09-11': 0, '2024-09-12': 0, '2024-09-13': 0, '2024-09-14': 0, '2024-09-15': 0,
        '2024-09-16': 2, '2024-09-17': 2, '2024-09-18': 1, '2024-09-19': 0, '2024-09-20': 0,
        '2024-09-21': 1, '2024-09-22': 0, '2024-09-23': 1, '2024-09-24': 2, '2024-09-25': 0,
        '2024-09-26': 0, '2024-09-27': 0, '2024-09-28': 0, '2024-09-29': 0, '2024-09-30': 0
      }
    },
    {
      name: 'Grand High Street Parking',
      deploy: 16,
      supervisor: 'Kailas Chavan',
      shortages: {
        '2024-09-01': 1, '2024-09-02': 1, '2024-09-03': 0, '2024-09-04': 0, '2024-09-05': 0,
        '2024-09-06': 2, '2024-09-07': 2, '2024-09-08': 2, '2024-09-09': 2, '2024-09-10': 2,
        '2024-09-11': 2, '2024-09-12': 0, '2024-09-13': 0, '2024-09-14': 0, '2024-09-15': 0,
        '2024-09-16': 3, '2024-09-17': 3, '2024-09-18': 3, '2024-09-19': 3, '2024-09-20': 3,
        '2024-09-21': 1, '2024-09-22': 1, '2024-09-23': 1, '2024-09-24': 1, '2024-09-25': 1,
        '2024-09-26': 1, '2024-09-27': 3, '2024-09-28': 2, '2024-09-29': 0, '2024-09-30': 0
      }
    },
    {
      name: 'Grand High Street IT Building',
      deploy: 5,
      supervisor: 'Naresh',
      shortages: {
        '2024-09-01': 0, '2024-09-02': 0, '2024-09-03': 0, '2024-09-04': 0, '2024-09-05': 0,
        '2024-09-06': 0, '2024-09-07': 0, '2024-09-08': 0, '2024-09-09': 0, '2024-09-10': 0,
        '2024-09-11': 0, '2024-09-12': 0, '2024-09-13': 0, '2024-09-14': 0, '2024-09-15': 0,
        '2024-09-16': 0, '2024-09-17': 0, '2024-09-18': 0, '2024-09-19': 0, '2024-09-20': 0,
        '2024-09-21': 0, '2024-09-22': 0, '2024-09-23': 0, '2024-09-24': 0, '2024-09-25': 0,
        '2024-09-26': 0, '2024-09-27': 0, '2024-09-28': 0, '2024-09-29': 0, '2024-09-30': 0
      }
    },
    {
      name: 'Westend Mall HK',
      deploy: 14,
      supervisor: 'Mahesh & Mininath',
      shortages: {
        '2024-09-01': 0, '2024-09-02': 0, '2024-09-03': 0, '2024-09-04': 0, '2024-09-05': 0,
        '2024-09-06': 0, '2024-09-07': 0, '2024-09-08': 0, '2024-09-09': 0, '2024-09-10': 1,
        '2024-09-11': 1, '2024-09-12': 1, '2024-09-13': 0, '2024-09-14': 0, '2024-09-15': 0,
        '2024-09-16': 0, '2024-09-17': 1, '2024-09-18': 2, '2024-09-19': 0, '2024-09-20': 0,
        '2024-09-21': 0, '2024-09-22': 0, '2024-09-23': 0, '2024-09-24': 0, '2024-09-25': 0,
        '2024-09-26': 0, '2024-09-27': 0, '2024-09-28': 0, '2024-09-29': 0, '2024-09-30': 0
      }
    },
    {
      name: 'Westend It Icon HK',
      deploy: 7,
      supervisor: 'Mahesh Mane',
      shortages: {
        '2024-09-01': 0, '2024-09-02': 1, '2024-09-03': 0, '2024-09-04': 0, '2024-09-05': 0,
        '2024-09-06': 1, '2024-09-07': 1, '2024-09-08': 1, '2024-09-09': 1, '2024-09-10': 1,
        '2024-09-11': 1, '2024-09-12': 1, '2024-09-13': 1, '2024-09-14': 1, '2024-09-15': 0,
        '2024-09-16': 0, '2024-09-17': 0, '2024-09-18': 0, '2024-09-19': 0, '2024-09-20': 0,
        '2024-09-21': 0, '2024-09-22': 0, '2024-09-23': 0, '2024-09-24': 0, '2024-09-25': 1,
        '2024-09-26': 0, '2024-09-27': 0, '2024-09-28': 0, '2024-09-29': 0, '2024-09-30': 0
      }
    }
  ],
  months: ['September 24', 'October 24', 'November 2024', 'December 2024', 'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025', 'October 2025']
};

// Department data matching the dashboard
const departmentViewData = [
  { 
    department: 'Housekeeping', 
    present: 56, 
    total: 65, 
    rate: '86.2%'
  },
  { 
    department: 'Security', 
    present: 26, 
    total: 28, 
    rate: '92.9%'
  },
  { 
    department: 'Parking', 
    present: 5, 
    total: 5, 
    rate: '100%'
  },
  { 
    department: 'Waste Management', 
    present: 8, 
    total: 10, 
    rate: '80.0%'
  },
  { 
    department: 'Consumables', 
    present: 3, 
    total: 3, 
    rate: '100%'
  },
  { 
    department: 'Other', 
    present: 5, 
    total: 7, 
    rate: '71.4%'
  },
];

// Site Names Data
const siteNames = [
  'ALYSSUM DEVELOPERS PVT. LTD.',
  'ARYA ASSOCIATES',
  'ASTITVA ASSET MANAGEMENT LLP',
  'A.T.C COMMERCIAL PREMISES CO. OPERATIVE SOCIETY LTD',
  'BAHIRAT ESTATE LLP',
  'CHITRALI PROPERTIES PVT LTD',
  'Concretely Infra Llp',
  'COORTUS ADVISORS LLP',
  'CUSHMAN & WAKEFIELD PROPERTY MANAGEMENT SERVICES INDIA PVT. LTD.',
  'DAKSHA INFRASTRUCTURE PVT. LTD.',
  'GANRAJ HOMES LLP-GANGA IMPERIA',
  'Global Lifestyle Hinjawadi Co-operative Housing Society Ltd',
  'GLOBAL PROPERTIES',
  'GLOBAL SQUARE PREMISES CO SOC LTD',
  'ISS FACILITY SERVICES INDIA PVT LTD',
  'JCSS CONSULTING INDIA PVT LTD',
  'KAPPA REALTORS LLP PUNE',
  'KRISHAK SEVITA ONLINE SOLUTIONS PRIVATE LIMITED',
  'LA MERE BUSINESS PVT. LTD.',
  'MATTER MOTOR WORKS PRIVATE LIMITED',
  'MEDIA PROTOCOL SERVICES',
  'MINDSPACE SHELTERS LLP (F2)',
  'NEXT GEN BUSINESS CENTRE LLP',
  'N G VENTURES',
  'PRIME VENTURES',
  'RADIANT INFRAPOWER',
  'RUHRPUMPEN INDIA PVT LTD',
  'SATURO TECHNOLOGIES PVT LTD',
  'SHUBH LANDMARKS',
  'SIDDHIVINAYAK POULTRY BREEDING FARM & HATCHERIES PRIVATE LIMITED',
  'SUVARNA FMS PVT LTD',
  'SYNERGY INFOTECH PVT LTD',
  'VILAS JAVDEKAR ECO SHELTERS PVT. LTD',
  'WEETAN SBRFS LLP',
  'WESTERN INDIA FORGINGS PVT LTD'
];

// Employee data structure
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  status: 'present' | 'absent' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  site: string;
  date: string;
}

// Generate employee data for sites
const generateEmployeeData = (siteName: string, date: string, totalEmployees: number, presentCount: number): Employee[] => {
  const employees: Employee[] = [];
  const departments = ['Housekeeping', 'Security', 'Parking', 'Waste Management', 'Consumables', 'Other'];
  const positions = ['Staff', 'Supervisor', 'Manager', 'Executive'];
  
  // Generate present employees
  for (let i = 1; i <= presentCount; i++) {
    employees.push({
      id: `EMP${siteName.substring(0, 3).toUpperCase()}${date.replace(/-/g, '')}${i}`,
      name: `Employee ${i} ${siteName.substring(0, 8)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      status: 'present',
      checkInTime: '08:00',
      checkOutTime: '17:00',
      site: siteName,
      date: date
    });
  }
  
  // Generate absent employees
  for (let i = presentCount + 1; i <= totalEmployees; i++) {
    employees.push({
      id: `EMP${siteName.substring(0, 3).toUpperCase()}${date.replace(/-/g, '')}${i}`,
      name: `Employee ${i} ${siteName.substring(0, 8)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      status: 'absent',
      site: siteName,
      date: date
    });
  }
  
  return employees;
};

// Generate site attendance data with actual department totals
const generateSiteAttendanceData = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange: string[] = [];
  
  // Generate date range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dateRange.push(date.toISOString().split('T')[0]);
  }
  
  // For each site, generate data for each date in range
  const result = [];
  
  for (const date of dateRange) {
    for (let i = 0; i < siteNames.length; i++) {
      const siteName = siteNames[i];
      const dateHash = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const siteFactor = (i + 1) * 123;
      
      const totalEmployees = Math.floor(20 + (Math.sin(siteFactor + dateHash) * 15) + 15);
      const attendanceRate = 0.85 + (Math.sin(dateHash + siteFactor) * 0.1);
      const present = Math.floor(totalEmployees * attendanceRate);
      const absent = totalEmployees - present;
      const shortage = Math.floor(absent * 0.3);

      result.push({
        id: `${siteName}-${date}`,
        name: siteName,
        totalEmployees,
        present,
        absent,
        shortage,
        date: date,
        employees: generateEmployeeData(siteName, date, totalEmployees, present)
      });
    }
  }
  
  return result;
};

// Generate department site data with ACTUAL counts from dashboard
const generateDepartmentSiteData = (startDate: string, endDate: string, department: string) => {
  const deptData = departmentViewData.find(d => d.department === department);
  
  if (!deptData) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange: string[] = [];
  
  // Generate date range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dateRange.push(date.toISOString().split('T')[0]);
  }
  
  const departmentSites = siteNames.slice(0, Math.floor(siteNames.length * 0.6));
  const result = [];
  
  for (const date of dateRange) {
    for (let i = 0; i < departmentSites.length; i++) {
      const siteName = departmentSites[i];
      const dateHash = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const siteFactor = (i + 1) * 456;
      
      const totalDistribution = departmentSites.length;
      const baseCount = Math.floor(deptData.total / totalDistribution);
      const remainder = deptData.total % totalDistribution;
      
      const total = baseCount + (i < remainder ? 1 : 0);
      const departmentRate = parseFloat(deptData.rate) / 100;
      const present = Math.floor(total * (departmentRate + (Math.sin(dateHash + siteFactor) * 0.05)));
      const absent = total - present;
      const shortage = Math.floor(absent * 0.3);
      
      result.push({
        siteId: `${siteName}-${date}`,
        siteName,
        present,
        absent,
        shortage,
        total,
        date: date,
        employees: generateEmployeeData(siteName, date, total, present)
      });
    }
  }
  
  return result;
};

// Helper function to format date
const formatDateDisplay = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get available departments
const departments = departmentViewData.map(dept => dept.department);

// Site Employee Details Page Component
interface SiteEmployeeDetailsProps {
  siteData: any;
  onBack: () => void;
  viewType: 'site' | 'department';
}

const SiteEmployeeDetails: React.FC<SiteEmployeeDetailsProps> = ({ siteData, onBack, viewType }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'present' | 'absent'>('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (!siteData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Site Data Found</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance View
          </Button>
        </div>
      </div>
    );
  }

  const allEmployees = siteData.employees || [];
  const presentEmployees = allEmployees.filter((emp: Employee) => emp.status === 'present');
  const absentEmployees = allEmployees.filter((emp: Employee) => emp.status === 'absent');

  const filteredEmployees = useMemo(() => {
    let employees = [];
    switch (activeTab) {
      case 'present':
        employees = presentEmployees;
        break;
      case 'absent':
        employees = absentEmployees;
        break;
      default:
        employees = allEmployees;
    }

    if (employeeSearch) {
      employees = employees.filter((emp: Employee) =>
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
      );
    }

    return employees;
  }, [activeTab, employeeSearch, allEmployees, presentEmployees, absentEmployees]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleExportEmployees = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Position', 'Status', 'Check In', 'Check Out', 'Site', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map((emp: Employee) => [
        emp.id,
        `"${emp.name}"`,
        emp.department,
        emp.position,
        emp.status,
        emp.checkInTime || '-',
        emp.checkOutTime || '-',
        `"${emp.site}"`,
        emp.date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${siteData.name || siteData.siteName}_${siteData.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Employee data exported successfully`);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Attendance
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {siteData.name || siteData.siteName} - Employee Details
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatDateDisplay(siteData.date)} • {viewType === 'department' ? 'Department View' : 'Site View'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportEmployees}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Employees
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600">{allEmployees.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentEmployees.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {allEmployees.length > 0 ? ((presentEmployees.length / allEmployees.length) * 100).toFixed(1) : '0'}%
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentEmployees.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {allEmployees.length > 0 ? ((absentEmployees.length / allEmployees.length) * 100).toFixed(1) : '0'}%
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Shortage</p>
                <p className="text-2xl font-bold text-orange-600">{siteData.shortage}</p>
                <p className="text-xs text-muted-foreground mt-1">Staff shortage</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Tabs */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('all');
                    setCurrentPage(1);
                  }}
                  className="text-xs"
                >
                  All Employees ({allEmployees.length})
                </Button>
                <Button
                  variant={activeTab === 'present' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('present');
                    setCurrentPage(1);
                  }}
                  className="text-xs"
                >
                  Present ({presentEmployees.length})
                </Button>
                <Button
                  variant={activeTab === 'absent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('absent');
                    setCurrentPage(1);
                  }}
                  className="text-xs"
                >
                  Absent ({absentEmployees.length})
                </Button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-64"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Employee Details - {filteredEmployees.length} employees found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Employee ID
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Department
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Position
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Check In
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Check Out
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((employee: Employee) => (
                      <tr key={employee.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">
                          {employee.id}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.name}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">{employee.department}</Badge>
                        </td>
                        <td className="p-4 align-middle">
                          {employee.position}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge 
                            variant={employee.status === 'present' ? 'default' : 'destructive'}
                          >
                            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          {employee.checkInTime || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.checkOutTime || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredEmployees.length > 0 && (
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Empty State */}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    No employees found for the selected filters.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Shortages and Attendance View Component
const ShortagesAttendanceView = () => {
  const [selectedMonth, setSelectedMonth] = useState(shortagesData.months[0]);
  const [editingCell, setEditingCell] = useState<{siteIndex: number, date: string, type: 'shortage' | 'deploy' | 'supervisor'} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [shortages, setShortages] = useState(shortagesData.sites);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCell]);

  // Generate dates for the selected month (simplified)
  const getDatesForMonth = () => {
    const daysInMonth = 30; // September has 30 days
    const dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(`2024-09-${i.toString().padStart(2, '0')}`);
    }
    return dates;
  };

  const dates = getDatesForMonth();

  const handleEdit = (siteIndex: number, date: string, currentValue: number, type: 'shortage' | 'deploy' | 'supervisor' = 'shortage') => {
    setEditingCell({ siteIndex, date, type });
    
    if (type === 'deploy') {
      setEditValue(shortages[siteIndex].deploy.toString());
    } else if (type === 'supervisor') {
      setEditValue(shortages[siteIndex].supervisor);
    } else {
      setEditValue(currentValue.toString());
    }
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (editingCell) {
      const newShortages = [...shortages];
      
      if (editingCell.type === 'deploy') {
        newShortages[editingCell.siteIndex].deploy = parseInt(editValue) || 0;
      } else if (editingCell.type === 'supervisor') {
        newShortages[editingCell.siteIndex].supervisor = editValue;
      } else {
        newShortages[editingCell.siteIndex].shortages[editingCell.date] = parseInt(editValue) || 0;
      }
      
      setShortages(newShortages);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleIncrement = (siteIndex: number, date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newShortages = [...shortages];
    const currentValue = newShortages[siteIndex].shortages[date] || 0;
    newShortages[siteIndex].shortages[date] = currentValue + 1;
    setShortages(newShortages);
  };

  const handleDecrement = (siteIndex: number, date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newShortages = [...shortages];
    const currentValue = newShortages[siteIndex].shortages[date] || 0;
    newShortages[siteIndex].shortages[date] = Math.max(0, currentValue - 1);
    setShortages(newShortages);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Calculate totals
  const calculateSiteTotal = (site: any) => {
    return Object.values(site.shortages).reduce((sum: number, val: any) => sum + val, 0);
  };

  const calculateDateTotal = (date: string) => {
    return shortages.reduce((sum, site) => sum + (site.shortages[date] || 0), 0);
  };

  const calculateTotalDeploy = () => {
    return shortages.reduce((sum, site) => sum + site.deploy, 0);
  };

  return (
    <div className="space-y-6">
      {/* Month Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Select Month</span>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shortagesData.months.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Zero Shortages
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                1-2 Shortages
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                3+ Shortages
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shortages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Shortages & Attendance - {selectedMonth}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any cell to edit shortages, deploy numbers, or supervisor names
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                        Site Name
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-blue-50 min-w-[120px]">
                        Supervisor
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-purple-50 min-w-[80px]">
                        DEPLOY
                      </th>
                      {dates.map((date, index) => (
                        <th 
                          key={date} 
                          className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[50px]"
                        >
                          {index + 1}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50 text-red-700 min-w-[80px]">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shortages.map((site, siteIndex) => (
                      <tr key={site.name} className="hover:bg-gray-50">
                        {/* Site Name */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r sticky left-0 bg-white z-10 min-w-[200px]">
                          {site.name}
                        </td>
                        
                        {/* Supervisor - Editable */}
                        <td 
                          className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-600 border-r bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors group relative"
                          onClick={() => handleEdit(siteIndex, '', 0, 'supervisor')}
                        >
                          {editingCell?.siteIndex === siteIndex && editingCell?.type === 'supervisor' ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                ref={editInputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-32 h-7 text-center text-xs"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex flex-col gap-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleSave}
                                  className="h-3 w-3 p-0 text-green-600 hover:bg-green-100"
                                >
                                  <Save className="h-2 w-2" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancel}
                                  className="h-3 w-3 p-0 text-red-600 hover:bg-red-100"
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <User className="h-3 w-3 text-blue-600" />
                              <span className="font-medium">{site.supervisor}</span>
                              <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                            </div>
                          )}
                        </td>
                        
                        {/* Deploy - Editable */}
                        <td 
                          className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 border-r bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors group relative"
                          onClick={() => handleEdit(siteIndex, '', 0, 'deploy')}
                        >
                          {editingCell?.siteIndex === siteIndex && editingCell?.type === 'deploy' ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                ref={editInputRef}
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-16 h-7 text-center text-xs"
                                min="0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex flex-col gap-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleSave}
                                  className="h-3 w-3 p-0 text-green-600 hover:bg-green-100"
                                >
                                  <Save className="h-2 w-2" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancel}
                                  className="h-3 w-3 p-0 text-red-600 hover:bg-red-100"
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-bold text-purple-700">{site.deploy}</span>
                              <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600" />
                            </div>
                          )}
                        </td>
                        
                        {/* Daily Shortages */}
                        {dates.map(date => {
                          const shortage = site.shortages[date] || 0;
                          const isEditing = editingCell?.siteIndex === siteIndex && editingCell?.date === date && editingCell?.type === 'shortage';
                          
                          return (
                            <td 
                              key={date}
                              className={`px-2 py-2 whitespace-nowrap text-sm text-center border-r relative group cursor-pointer ${
                                shortage === 0 
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                  : shortage <= 2 
                                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                              onClick={() => handleEdit(siteIndex, date, shortage, 'shortage')}
                            >
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    ref={editInputRef}
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-12 h-6 text-center text-xs"
                                    min="0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex flex-col gap-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleSave}
                                      className="h-3 w-3 p-0 text-green-600 hover:bg-green-100"
                                    >
                                      <Save className="h-2 w-2" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleCancel}
                                      className="h-3 w-3 p-0 text-red-600 hover:bg-red-100"
                                    >
                                      <X className="h-2 w-2" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="font-semibold">{shortage}</span>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => handleIncrement(siteIndex, date, e)}
                                      className="h-3 w-3 p-0 text-green-600 hover:bg-green-100"
                                    >
                                      <Plus className="h-2 w-2" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => handleDecrement(siteIndex, date, e)}
                                      className="h-3 w-3 p-0 text-red-600 hover:bg-red-100"
                                    >
                                      <Minus className="h-2 w-2" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        
                        {/* Site Total */}
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-red-700 bg-red-50">
                          {calculateSiteTotal(site)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Total Row */}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 border-r sticky left-0 bg-gray-100 z-10">
                        DAILY TOTAL
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 border-r bg-blue-100">
                        -
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-purple-700 border-r bg-purple-100">
                        {calculateTotalDeploy()}
                      </td>
                      {dates.map(date => (
                        <td 
                          key={date} 
                          className="px-2 py-2 whitespace-nowrap text-sm text-center font-bold border-r bg-gray-200"
                        >
                          {calculateDateTotal(date)}
                        </td>
                      ))}
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-red-700 bg-red-100">
                        {shortages.reduce((total, site) => total + calculateSiteTotal(site), 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Zero Shortage Days</p>
                <p className="text-3xl font-bold text-green-700">
                  {dates.filter(date => calculateDateTotal(date) === 0).length}
                </p>
                <p className="text-xs text-green-600 mt-1">Perfect attendance days</p>
              </div>
              <div className="p-3 rounded-full bg-green-200">
                <UserCheck className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Deployed</p>
                <p className="text-3xl font-bold text-blue-700">
                  {calculateTotalDeploy()}
                </p>
                <p className="text-xs text-blue-600 mt-1">Across all sites</p>
              </div>
              <div className="p-3 rounded-full bg-blue-200">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Avg Daily Shortage</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {(shortages.reduce((total, site) => total + calculateSiteTotal(site), 0) / dates.length).toFixed(1)}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Per day average</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-200">
                <TrendingUp className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Shortage</p>
                <p className="text-3xl font-bold text-red-700">
                  {shortages.reduce((total, site) => total + calculateSiteTotal(site), 0)}
                </p>
                <p className="text-xs text-red-600 mt-1">Month total</p>
              </div>
              <div className="p-3 rounded-full bg-red-200">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminAttendanceView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const initialViewType = searchParams.get('view') || 'site';
  const initialDepartment = searchParams.get('department') || '';
  const today = new Date().toISOString().split('T')[0];
  const initialStartDate = searchParams.get('startDate') || today;
  const initialEndDate = searchParams.get('endDate') || today;
  const initialSiteDetails = searchParams.get('siteDetails') === 'true';
  const initialSelectedSiteId = searchParams.get('selectedSiteId') || '';

  const [viewType, setViewType] = useState<'site' | 'department' | 'shortages'>(initialViewType as 'site' | 'department' | 'shortages');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSiteDetails, setShowSiteDetails] = useState(initialSiteDetails);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  
  const itemsPerPage = 10;

  // Generate data based on view type and date range
  const displayData = useMemo(() => {
    if (viewType === 'department' && selectedDepartment) {
      return generateDepartmentSiteData(startDate, endDate, selectedDepartment);
    } else if (viewType === 'shortages') {
      return [];
    } else {
      return generateSiteAttendanceData(startDate, endDate);
    }
  }, [viewType, selectedDepartment, startDate, endDate]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return displayData.filter(item =>
      item.siteName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [displayData, searchTerm]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate totals
  const totals = useMemo(() => {
    if (viewType === 'department' && selectedDepartment) {
      const deptData = departmentViewData.find(d => d.department === selectedDepartment);
      if (deptData) {
        return {
          totalEmployees: deptData.total,
          totalPresent: deptData.present,
          totalAbsent: deptData.total - deptData.present,
          totalShortage: Math.floor((deptData.total - deptData.present) * 0.3)
        };
      }
    }
    
    return filteredData.reduce((acc, item) => ({
      totalEmployees: acc.totalEmployees + (item.total || item.totalEmployees),
      totalPresent: acc.totalPresent + item.present,
      totalAbsent: acc.totalAbsent + item.absent,
      totalShortage: acc.totalShortage + item.shortage
    }), { totalEmployees: 0, totalPresent: 0, totalAbsent: 0, totalShortage: 0 });
  }, [filteredData, viewType, selectedDepartment]);

  // Calculate attendance rate
  const attendanceRate = useMemo(() => {
    return totals.totalEmployees > 0 ? ((totals.totalPresent / totals.totalEmployees) * 100).toFixed(1) : '0.0';
  }, [totals]);

  // Handle export to Excel
  const handleExportToExcel = () => {
    let filename, csvContent;

    if (viewType === 'shortages') {
      filename = `Shortages_${shortagesData.months[0]}.csv`;
      const headers = ['Site Name', 'Supervisor', 'Deploy', ...Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`), 'Total'];
      csvContent = [
        headers.join(','),
        ...shortagesData.sites.map(site => {
          const shortagesArray = Array.from({ length: 30 }, (_, i) => site.shortages[`2024-09-${(i + 1).toString().padStart(2, '0')}`] || 0);
          return [
            `"${site.name}"`,
            `"${site.supervisor}"`,
            site.deploy,
            ...shortagesArray,
            Object.values(site.shortages).reduce((sum: number, val: any) => sum + val, 0)
          ].join(',');
        })
      ].join('\n');
    } else if (viewType === 'department') {
      filename = `Attendance_${selectedDepartment}_${startDate}_to_${endDate}.csv`;
      const headers = ['Site Name', 'Department', 'Present', 'Absent', 'Shortage', 'Total', 'Attendance Rate'];
      csvContent = [
        headers.join(','),
        ...filteredData.map(item => {
          const total = item.total || item.totalEmployees;
          const rate = ((item.present / total) * 100).toFixed(1) + '%';
          return [
            `"${item.siteName}"`,
            `"${selectedDepartment}"`,
            item.present,
            item.absent,
            item.shortage,
            total,
            rate
          ].join(',');
        })
      ].join('\n');
    } else {
      filename = `Sitewise_Attendance_${startDate}_to_${endDate}.csv`;
      const headers = ['Site Name', 'Department', 'Total Employees', 'Present', 'Absent', 'Shortage', 'Attendance Rate'];
      csvContent = [
        headers.join(','),
        ...filteredData.map(item => {
          const rate = ((item.present / item.totalEmployees) * 100).toFixed(1) + '%';
          // Get the most common department from employees for this site
          const departments = item.employees?.map((emp: Employee) => emp.department) || [];
          const departmentCounts = departments.reduce((acc: {[key: string]: number}, dept: string) => {
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
          }, {});
          const primaryDepartment = Object.keys(departmentCounts).reduce((a, b) => 
            departmentCounts[a] > departmentCounts[b] ? a : b, 'General'
          );
          
          return [
            `"${item.name}"`,
            `"${primaryDepartment}"`,
            item.totalEmployees,
            item.present,
            item.absent,
            item.shortage,
            rate
          ].join(',');
        })
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    toast.success(`Data exported to ${filename}`);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle view type change
  const handleViewTypeChange = (newViewType: 'site' | 'department' | 'shortages') => {
    setViewType(newViewType);
    setCurrentPage(1);
    if (newViewType === 'site') {
      setSelectedDepartment('');
    } else if (newViewType === 'department' && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  };

  // Handle view details click
  const handleViewDetails = (siteData: any) => {
    setSelectedSite(siteData);
    setShowSiteDetails(true);
    
    // Update URL params
    const params = new URLSearchParams();
    params.set('view', viewType);
    if (viewType === 'department') {
      params.set('department', selectedDepartment);
    }
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    params.set('siteDetails', 'true');
    params.set('selectedSiteId', siteData.id || siteData.siteId);
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Handle back from site details
  const handleBackFromDetails = () => {
    setShowSiteDetails(false);
    setSelectedSite(null);
    
    // Update URL params
    const params = new URLSearchParams();
    params.set('view', viewType);
    if (viewType === 'department') {
      params.set('department', selectedDepartment);
    }
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Load selected site from URL params on component mount
  useEffect(() => {
    if (initialSiteDetails && initialSelectedSiteId) {
      const site = displayData.find(item => item.id === initialSelectedSiteId || item.siteId === initialSelectedSiteId);
      if (site) {
        setSelectedSite(site);
        setShowSiteDetails(true);
      }
    }
  }, [initialSiteDetails, initialSelectedSiteId, displayData]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Pagination Component
  const Pagination = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {filteredData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    );
  };

  // If showing site details, render the SiteEmployeeDetails component
  if (showSiteDetails) {
    return (
      <SiteEmployeeDetails
        siteData={selectedSite}
        onBack={handleBackFromDetails}
        viewType={viewType}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewType === 'department' 
                  ? `${selectedDepartment} Department Attendance`
                  : viewType === 'shortages'
                  ? 'Daily Shortages Management'
                  : 'Site-wise Attendance Overview'
                }
              </h1>
              <p className="text-sm text-muted-foreground">
                {viewType === 'department'
                  ? `Showing attendance data for ${selectedDepartment} department across all sites`
                  : viewType === 'shortages'
                  ? 'Manage daily shortages with Excel-like interface'
                  : 'Showing attendance data for all sites'
                } - {viewType !== 'shortages' && `${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* View Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">View Type</label>
                <Select value={viewType} onValueChange={handleViewTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select View Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Site View
                      </div>
                    </SelectItem>
                    <SelectItem value="department">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Department View
                      </div>
                    </SelectItem>
                    <SelectItem value="shortages">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Shortages Management
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Selector (only shown in department view) */}
              {viewType === 'department' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Range Filters (only shown in non-shortages views) */}
              {viewType !== 'shortages' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Search (only shown in non-shortages views) */}
              {viewType !== 'shortages' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Sites</label>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by site name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Show different content based on view type */}
      {viewType === 'shortages' ? (
        <ShortagesAttendanceView />
      ) : (
        <>
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {viewType === 'department' ? 'Total Employees' : 'Total Sites'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {viewType === 'department' ? totals.totalEmployees : filteredData.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">For selected period</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Total Present</p>
                    <p className="text-2xl font-bold text-green-600">{totals.totalPresent}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totals.totalEmployees > 0 ? ((totals.totalPresent / totals.totalEmployees) * 100).toFixed(1) : '0'}% of total
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Badge variant="default" className="bg-green-500">P</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Total Absent</p>
                    <p className="text-2xl font-bold text-red-600">{totals.totalAbsent}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totals.totalEmployees > 0 ? ((totals.totalAbsent / totals.totalEmployees) * 100).toFixed(1) : '0'}% of total
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full">
                    <Badge variant="destructive">A</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {viewType === 'department' ? 'Total Shortage' : 'Attendance Rate'}
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {viewType === 'department' ? totals.totalShortage : `${attendanceRate}%`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {viewType === 'department' ? 'Staff shortages' : 'Overall rate'}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Filter className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {viewType === 'department' 
                      ? `Showing data for ${selectedDepartment} department from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`
                      : `Showing data for all sites from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`
                    }
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportToExcel}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {viewType === 'department' 
                    ? `${selectedDepartment} Sites Attendance - ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`
                    : `All Sites Attendance Details - ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Site Name
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Department
                          </th>
                          {viewType === 'site' && (
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Total Employees
                            </th>
                          )}
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Present
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Absent
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Shortage
                          </th>
                          {viewType === 'department' && (
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Total
                            </th>
                          )}
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Attendance Rate
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((item, index) => {
                          const total = item.total || item.totalEmployees;
                          const rate = ((item.present / total) * 100).toFixed(1);
                          const status = parseFloat(rate) >= 90 ? 'Excellent' :
                                        parseFloat(rate) >= 80 ? 'Good' :
                                        parseFloat(rate) >= 70 ? 'Average' : 'Poor';

                          // Get the most common department from employees for this site
                          const departments = item.employees?.map((emp: Employee) => emp.department) || [];
                          const departmentCounts = departments.reduce((acc: {[key: string]: number}, dept: string) => {
                            acc[dept] = (acc[dept] || 0) + 1;
                            return acc;
                          }, {});
                          const primaryDepartment = Object.keys(departmentCounts).reduce((a, b) => 
                            departmentCounts[a] > departmentCounts[b] ? a : b, 'General'
                          );

                          return (
                            <tr key={item.siteId || item.id} className="border-b hover:bg-muted/50">
                              <td className="p-4 align-middle font-medium">
                                <div className="font-medium text-sm">{item.siteName || item.name}</div>
                                <div className="text-xs text-muted-foreground">Date: {item.date}</div>
                              </td>
                              <td className="p-4 align-middle">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {viewType === 'department' ? selectedDepartment : primaryDepartment}
                                </Badge>
                              </td>
                              {viewType === 'site' && (
                                <td className="p-4 align-middle font-bold">
                                  {item.totalEmployees}
                                </td>
                              )}
                              <td className="p-4 align-middle text-green-600 font-semibold">
                                {item.present}
                              </td>
                              <td className="p-4 align-middle text-red-600 font-semibold">
                                {item.absent}
                              </td>
                              <td className="p-4 align-middle text-orange-600 font-semibold">
                                {item.shortage}
                              </td>
                              {viewType === 'department' && (
                                <td className="p-4 align-middle font-bold">
                                  {total}
                                </td>
                              )}
                              <td className="p-4 align-middle font-bold">
                                {rate}%
                              </td>
                              <td className="p-4 align-middle">
                                <Badge variant={
                                  status === 'Excellent' ? 'default' :
                                  status === 'Good' ? 'secondary' :
                                  status === 'Average' ? 'outline' : 'destructive'
                                }>
                                  {status}
                                </Badge>
                              </td>
                              <td className="p-4 align-middle">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(item)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {filteredData.length > 0 && <Pagination />}
                  
                  {/* Empty State */}
                  {filteredData.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        No data found for the selected filters.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminAttendanceView;