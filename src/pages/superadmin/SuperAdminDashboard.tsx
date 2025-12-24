import { useOutletContext } from "react-router-dom";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Home,
  Shield,
  Car,
  Trash2,
  Droplets,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  List,
  PieChart,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileText,
  Receipt,
  AlertTriangle
} from 'lucide-react';

// Recharts for charts
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Chart color constants
const CHART_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  late: '#f59e0b',
  payroll: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444']
};

// Generate attendance data from today going backwards
const generateAttendanceData = () => {
  const data = [];
  const today = new Date();
  
  // Generate data for last 30 days including today
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const dayName = i === 0 ? 'Today' : 
                   i === 1 ? 'Yesterday' : 
                   date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const present = Math.floor(Math.random() * 30) + 85; // 85-115 present
    const absent = Math.floor(Math.random() * 15) + 5; // 5-20 absent
    const total = present + absent;
    const rate = ((present / total) * 100).toFixed(1) + '%';
    
    data.push({
      date: date.toISOString().split('T')[0],
      day: dayName,
      present,
      absent,
      total,
      rate,
      index: i // Store original index for reference
    });
  }
  
  return data;
};

const attendanceData = generateAttendanceData();

// Department View Data
const departmentViewData = [
  { 
    department: 'Housekeeping', 
    present: 56, 
    total: 65, 
    rate: '86.2%',
    icon: Home
  },
  { 
    department: 'Security', 
    present: 26, 
    total: 28, 
    rate: '92.9%',
    icon: Shield
  },
  { 
    department: 'Parking', 
    present: 5, 
    total: 5, 
    rate: '100%',
    icon: Car
  },
  { 
    department: 'Waste Management', 
    present: 8, 
    total: 10, 
    rate: '80.0%',
    icon: Trash2
  },
 
  { 
    department: 'Consumables', 
    present: 3, 
    total: 3, 
    rate: '100%',
    icon: ShoppingCart
  },
   { 
    department: 'Other', 
    present: 5, 
    total: 7, 
    rate: '71.4%',
    icon: Droplets
  },
];

// Outstanding Amount Data
const outstandingData = {
  totalInvoices: 45,
  receivedTotalAmount: 3250000,
  totalOutstandingDue: 1850000
};

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

// Generate payroll data for all sites
const generatePayrollData = () => {
  const payrollData = [];
  
  siteNames.forEach((siteName, index) => {
    const billingAmount = Math.floor(Math.random() * 500000) + 200000; // 200,000 - 700,000
    const totalPaid = Math.floor(Math.random() * billingAmount * 0.8) + (billingAmount * 0.2); // 20% - 100% of billing
    const holdSalary = billingAmount - totalPaid;
    
    const remarks = [
      'Payment processed',
      'Pending approval',
      'Under review',
      'Payment scheduled',
      'Awaiting documents',
      'Completed',
      'On hold'
    ];
    
    payrollData.push({
      id: index + 1,
      siteName,
      billingAmount,
      totalPaid,
      holdSalary: holdSalary > 0 ? holdSalary : 0,
      remark: remarks[Math.floor(Math.random() * remarks.length)],
      status: holdSalary > 0 ? 'Pending' : 'Paid'
    });
  });
  
  return payrollData;
};

// Years and Months data
const years = ['2024', '2023', '2022', '2021'];
const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page numbers */}
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
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Excel export utility function
const exportToExcel = (data: any[], filename: string) => {
  // Create CSV content
  const headers = ['Site Name', 'Billing Amount (₹)', 'Total Paid (₹)', 'Hold Salary (₹)', 'Difference (₹)', 'Status', 'Remark'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => {
      const difference = item.billingAmount - item.totalPaid + item.holdSalary;
      return [
        `"${item.siteName}"`,
        item.billingAmount,
        item.totalPaid,
        item.holdSalary,
        difference,
        item.status,
        `"${item.remark}"`
      ].join(',');
    })
  ].join('\n');

  // Create blob and download
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
};

const SuperAdminDashboard = () => {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const navigate = useNavigate();
  
  // State for pie chart navigation
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // Today is index 0
  const [sixDaysStartIndex, setSixDaysStartIndex] = useState(1); // Start from yesterday (index 1)
  
  // State for payroll filters
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [payrollData, setPayrollData] = useState(generatePayrollData());
  const [payrollTab, setPayrollTab] = useState('list-view');
  const [selectedSite, setSelectedSite] = useState(siteNames[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 records per page

  // Get current day data (Today)
  const currentDayData = attendanceData[currentDayIndex];
  
  // Get 6 days data for small pie charts (starting from sixDaysStartIndex)
  const sixDaysData = attendanceData.slice(sixDaysStartIndex, sixDaysStartIndex + 6);

  // Prepare pie chart data for current day
  const currentDayPieData = [
    { name: 'Present', value: currentDayData.present, color: CHART_COLORS.present },
    { name: 'Absent', value: currentDayData.absent, color: CHART_COLORS.absent }
  ];

  // Calculate payroll summary
  const payrollSummary = useMemo(() => {
    const totalBilling = payrollData.reduce((sum, item) => sum + item.billingAmount, 0);
    const totalPaid = payrollData.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalHold = payrollData.reduce((sum, item) => sum + item.holdSalary, 0);
    const totalDifference = payrollData.reduce((sum, item) => sum + (item.billingAmount - item.totalPaid + item.holdSalary), 0);
    
    return {
      totalBilling,
      totalPaid,
      totalHold,
      totalDifference,
      completionRate: ((totalPaid / totalBilling) * 100).toFixed(1)
    };
  }, [payrollData]);

  // Filter payroll data based on search
  const filteredPayrollData = useMemo(() => {
    return payrollData.filter(item =>
      item.siteName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payrollData, searchTerm]);

  // Paginate payroll data
  const paginatedPayrollData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayrollData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayrollData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPayrollData.length / itemsPerPage);

  // Get selected site data for pie chart
  const selectedSiteData = payrollData.find(item => item.siteName === selectedSite);

  // Prepare pie chart data for selected site
  const sitePieChartData = selectedSiteData ? [
    { name: 'Total Paid', value: selectedSiteData.totalPaid, color: CHART_COLORS.payroll[1] },
    { name: 'Hold Salary', value: selectedSiteData.holdSalary, color: CHART_COLORS.payroll[5] }
  ] : [];

  // Navigation handlers for main pie chart (Today's chart)
  const handlePreviousDay = () => {
    setCurrentDayIndex(prev => (prev > 0 ? prev - 1 : attendanceData.length - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex(prev => (prev < attendanceData.length - 1 ? prev + 1 : 0));
  };

  // Navigation handlers for 6 days pie charts
  const handleSixDaysPrevious = () => {
    setSixDaysStartIndex(prev => {
      const newIndex = prev + 6;
      // Don't go beyond the available data (stop at the last 6 days before today)
      const maxIndex = attendanceData.length - 6;
      return newIndex <= maxIndex ? newIndex : prev;
    });
  };

  const handleSixDaysNext = () => {
    setSixDaysStartIndex(prev => {
      const newIndex = prev - 6;
      // Don't go below 1 (yesterday)
      return newIndex >= 1 ? newIndex : prev;
    });
  };

  // Check if navigation buttons should be enabled
  const canGoSixDaysPrevious = sixDaysStartIndex < attendanceData.length - 6;
  const canGoSixDaysNext = sixDaysStartIndex > 1;

  // Calculate date range for the current 6-day block
  const getDateRangeText = () => {
    if (sixDaysData.length === 0) return '';
    
    const firstDate = new Date(sixDaysData[0].date);
    const lastDate = new Date(sixDaysData[sixDaysData.length - 1].date);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
  };

  // Handle payroll filter change
  const handlePayrollFilterChange = () => {
    // In a real application, this would fetch data from API based on year and month
    // For now, we'll just regenerate the data to simulate the filter
    setPayrollData(generatePayrollData());
    setCurrentPage(1); // Reset to first page
    toast.success(`Payroll data updated for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    const monthName = months.find(m => m.value === selectedMonth)?.label;
    const filename = `Payroll_Data_${monthName}_${selectedYear}.csv`;
    
    // Export all filtered data, not just the current page
    exportToExcel(filteredPayrollData, filename);
    toast.success(`Payroll data exported to ${filename}`);
  };

  // Handle pie chart click to redirect to site-wise attendance with selected date
  const handlePieChartClick = (date?: string) => {
    const selectedDate = date || currentDayData.date;
    navigate(`/superadmin/attendaceview?view=site&date=${selectedDate}`);
  };

  // Handle small pie chart click with specific date
  const handleSmallPieChartClick = (dayData: any) => {
    navigate(`/superadmin/attendaceview?view=site&date=${dayData.date}`);
  };

  // Handle department card click to redirect to department wise attendance
  const handleDepartmentCardClick = (department: string) => {
    navigate(`/superadmin/attendaceview?view=department&department=${department}&date=Today`);
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.fill }}>
            {data.value} employees ({((data.value / currentDayData.total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for payroll pie chart
  const CustomPayrollTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm" style={{ color: data.payload.fill }}>
            {formatCurrency(data.value)} ({((data.value / (selectedSiteData?.billingAmount || 1)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate difference for a payroll item
  const calculateDifference = (item: any) => {
    return item.billingAmount - item.totalPaid + item.holdSalary;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Super Admin Dashboard" 
        subtitle="Attendance, Department, and Payroll Overview"
        onMenuClick={onMenuClick}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* 7 Days Attendance Rate Pie Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                7 Days Attendance Rate
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Present vs Absent ratio for the last 7 days. Click on charts to view site-wise attendance details for that specific day.
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* 6 Days Small Pie Charts with Navigation */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Previous Days Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      {getDateRangeText()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSixDaysPrevious}
                      disabled={!canGoSixDaysPrevious}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSixDaysNext}
                      disabled={!canGoSixDaysNext}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {sixDaysData.map((dayData, index) => {
                    const pieData = [
                      { name: 'Present', value: dayData.present, color: CHART_COLORS.present },
                      { name: 'Absent', value: dayData.absent, color: CHART_COLORS.absent }
                    ];

                    return (
                      <Card 
                        key={`${dayData.date}-${index}`}
                        className="cursor-pointer transform transition-all duration-200 hover:scale-105"
                        onClick={() => handleSmallPieChartClick(dayData)}
                      >
                        <CardContent className="p-3">
                          <div className="text-center mb-2">
                            <p className="text-xs font-medium text-gray-700">{dayData.day}</p>
                            <p className="text-xs text-muted-foreground">{dayData.date}</p>
                            <Badge variant={
                              parseFloat(dayData.rate) > 90 ? 'default' :
                              parseFloat(dayData.rate) > 80 ? 'secondary' : 'destructive'
                            } className="mt-1 text-xs">
                              {dayData.rate}
                            </Badge>
                          </div>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={40}
                                  fill="#8884d8"
                                  dataKey="value"
                                  labelLine={false}
                                >
                                  {pieData.map((entry, cellIndex) => (
                                    <Cell key={`cell-${cellIndex}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-center mt-2">
                            <div className="flex justify-center space-x-4 text-xs">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                <span>{dayData.present}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                <span>{dayData.absent}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Navigation Info */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {sixDaysData.length} days of historical data
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Page {Math.floor((sixDaysStartIndex - 1) / 6) + 1}</span>
                    <span>•</span>
                    <span>Use arrows to navigate</span>
                  </div>
                </div>
              </div>

              {/* Main Today's Pie Chart with Navigation */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentDayData.day} - {currentDayData.date}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total Employees: {currentDayData.total} | Attendance Rate: {currentDayData.rate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousDay}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground mx-2">
                      {currentDayIndex + 1} of {attendanceData.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextDay}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div 
                  className="cursor-pointer transform transition-all duration-200 hover:scale-105"
                  onClick={() => handlePieChartClick(currentDayData.date)}
                >
                  <div className="w-full h-80 sm:h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={currentDayPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {currentDayPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Click on the chart to view site-wise attendance details for {currentDayData.date}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg">Department View</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on each department card to view department-wise attendance across all sites
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {departmentViewData.map((dept) => {
                  const IconComponent = dept.icon;
                  return (
                    <Card 
                      key={dept.department} 
                      className="text-center cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 hover:border-blue-300"
                      onClick={() => handleDepartmentCardClick(dept.department)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-xs sm:text-sm font-medium">{dept.department}</p>
                        <p className="text-xl sm:text-2xl font-bold">{dept.present}</p>
                        <p className="text-xs text-muted-foreground">/{dept.total}</p>
                        <Badge variant={
                          parseFloat(dept.rate) > 90 ? 'default' :
                          parseFloat(dept.rate) > 80 ? 'secondary' : 'destructive'
                        } className="mt-1 text-xs">
                          {dept.rate}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Outstanding Amount Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <PieChartIcon className="h-5 w-5" />
                Outstanding Amount
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total outstanding amount from all debtors and parties
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-center py-6">
                <div className="text-4xl sm:text-5xl font-bold text-red-600 mb-4">
                  ₹{(outstandingData.totalOutstandingDue / 100000).toFixed(1)} Lakhs
                </div>
                <div className="text-lg text-muted-foreground">
                  Total Outstanding Due
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Invoices Card */}
                  <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Total Invoices</p>
                          <p className="text-2xl font-bold text-blue-600">{outstandingData.totalInvoices}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total invoices generated</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Received Total Amount Card */}
                  <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Received Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(outstandingData.receivedTotalAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Amount received so far</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <Receipt className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Outstanding Due Card */}
                  <Card className="bg-white border-red-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Total Outstanding Due</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(outstandingData.totalOutstandingDue)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Pending amount to be received</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payroll Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg">Payroll Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Site-wise payroll details with year and month filters
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* Payroll Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Month</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium invisible">Apply</label>
                    <Button 
                      onClick={handlePayrollFilterChange}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payroll Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Billing</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(payrollSummary.totalBilling)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(payrollSummary.totalPaid)}
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-800">Hold Salary</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(payrollSummary.totalHold)}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Total Difference</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(payrollSummary.totalDifference)}
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payroll Tabs */}
              <div className="mb-6">
                <div className="border-b">
                  <div className="flex space-x-8">
                    <button
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        payrollTab === 'list-view'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setPayrollTab('list-view')}
                    >
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        List View
                      </div>
                    </button>
                    <button
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        payrollTab === 'pie-chart'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setPayrollTab('pie-chart')}
                    >
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Pie Chart View
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* List View */}
              {payrollTab === 'list-view' && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by site name..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full sm:w-64"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportToExcel}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>

                  {/* Payroll Table */}
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Site Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Billing Amount</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total Paid</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hold Salary</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Difference</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPayrollData.map((item) => {
                            const difference = calculateDifference(item);
                            return (
                              <tr key={item.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">
                                  <div>
                                    <div className="font-medium text-sm">{item.siteName.split(',')[0]}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.siteName.split(',').slice(1).join(',')}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 align-middle font-bold">
                                  {formatCurrency(item.billingAmount)}
                                </td>
                                <td className="p-4 align-middle text-green-600 font-semibold">
                                  {formatCurrency(item.totalPaid)}
                                </td>
                                <td className="p-4 align-middle text-orange-600 font-semibold">
                                  {formatCurrency(item.holdSalary)}
                                </td>
                                <td className="p-4 align-middle font-bold" style={{ 
                                  color: difference > 0 ? '#ef4444' : difference < 0 ? '#10b981' : '#6b7280'
                                }}>
                                  {formatCurrency(difference)}
                                </td>
                                <td className="p-4 align-middle">
                                  <Badge variant={item.status === 'Paid' ? 'default' : 'secondary'} className="text-xs">
                                    {item.status}
                                  </Badge>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="text-xs text-muted-foreground">{item.remark}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={filteredPayrollData.length}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                </div>
              )}

              {/* Pie Chart View */}
              {payrollTab === 'pie-chart' && (
                <div className="space-y-6">
                  {/* Site Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Site</label>
                      <Select value={selectedSite} onValueChange={setSelectedSite}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Site" />
                        </SelectTrigger>
                        <SelectContent>
                          {siteNames.map(site => (
                            <SelectItem key={site} value={site}>
                              {site.split(',')[0]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium invisible">Info</label>
                      <div className="text-sm text-muted-foreground">
                        Showing payroll distribution for selected site
                      </div>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  {selectedSiteData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Payroll Distribution - {selectedSite.split(',')[0]}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={sitePieChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {sitePieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomPayrollTooltip />} />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Site Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Site Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium">Billing Amount:</span>
                              <span className="font-bold text-blue-600">
                                {formatCurrency(selectedSiteData.billingAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="font-medium">Total Paid:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(selectedSiteData.totalPaid)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                              <span className="font-medium">Hold Salary:</span>
                              <span className="font-bold text-orange-600">
                                {formatCurrency(selectedSiteData.holdSalary)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <span className="font-medium">Difference:</span>
                              <span className="font-bold text-purple-600">
                                {formatCurrency(calculateDifference(selectedSiteData))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">Status:</span>
                              <Badge variant={selectedSiteData.status === 'Paid' ? 'default' : 'secondary'}>
                                {selectedSiteData.status}
                              </Badge>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">Remark: </span>
                              <span className="text-muted-foreground">{selectedSiteData.remark}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;