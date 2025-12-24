import { useState, useRef, useEffect } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, XCircle, Clock, Users, User, BarChart3, Download, CalendarDays, Camera, MapPin, LogIn, LogOut, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("my-attendance");
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Week selection for register view
  const [selectedWeek, setSelectedWeek] = useState<number>(2); // Week 2 of January 2024
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = January
  
  // My Attendance Data
  const [myAttendance, setMyAttendance] = useState([
    { id: 1, date: "2024-01-15", checkIn: "09:00 AM", checkOut: "05:00 PM", status: "Present", hours: "8.0" },
    { id: 2, date: "2024-01-14", checkIn: "09:15 AM", checkOut: "05:30 PM", status: "Present", hours: "8.25" },
    { id: 3, date: "2024-01-13", checkIn: "09:05 AM", checkOut: "04:45 PM", status: "Present", hours: "7.67" },
    { id: 4, date: "2024-01-12", checkIn: "-", checkOut: "-", status: "Absent", hours: "0.0" },
    { id: 5, date: "2024-01-11", checkIn: "08:55 AM", checkOut: "05:15 PM", status: "Present", hours: "8.33" },
  ]);

  // Employee Attendance Data
  const [employeeAttendance, setEmployeeAttendance] = useState([
    { 
      id: 1, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-15", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null as string | null,
      location: null as { latitude: number; longitude: number } | null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-15", 
      checkIn: "02:00 PM", 
      checkOut: "10:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-15", 
      checkIn: "09:30 AM", 
      checkOut: "05:15 PM", 
      status: true, 
      hours: "7.75",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 4, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-15", 
      checkIn: "-", 
      checkOut: "-", 
      status: false, 
      hours: "0.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: true,
      canPunchOut: false
    },
    { 
      id: 5, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-15", 
      checkIn: "02:15 PM", 
      checkOut: "10:30 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 6, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-15", 
      checkIn: "08:45 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    
    // Additional dummy data for different dates
    { 
      id: 7, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-14", 
      checkIn: "09:10 AM", 
      checkOut: "05:05 PM", 
      status: true, 
      hours: "7.92",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 8, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-14", 
      checkIn: "02:05 PM", 
      checkOut: "10:10 PM", 
      status: true, 
      hours: "8.08",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 9, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-14", 
      checkIn: "09:25 AM", 
      checkOut: "05:20 PM", 
      status: true, 
      hours: "7.92",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 10, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-14", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 11, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-14", 
      checkIn: "02:20 PM", 
      checkOut: "10:25 PM", 
      status: true, 
      hours: "8.08",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 12, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-14", 
      checkIn: "08:50 AM", 
      checkOut: "05:05 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    
    { 
      id: 13, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-13", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 14, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-13", 
      checkIn: "02:00 PM", 
      checkOut: "10:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 15, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-13", 
      checkIn: "-", 
      checkOut: "-", 
      status: false, 
      hours: "0.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: true,
      canPunchOut: false
    },
    { 
      id: 16, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-13", 
      checkIn: "09:05 AM", 
      checkOut: "05:10 PM", 
      status: true, 
      hours: "8.08",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 17, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-13", 
      checkIn: "02:10 PM", 
      checkOut: "10:15 PM", 
      status: true, 
      hours: "8.08",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 18, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-13", 
      checkIn: "08:55 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.08",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    // Add more data for other days of the week
    { 
      id: 19, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-12", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 20, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-12", 
      checkIn: "-", 
      checkOut: "-", 
      status: false, 
      hours: "0.0",
      weeklyOff: true,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: false
    },
    { 
      id: 21, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-12", 
      checkIn: "09:15 AM", 
      checkOut: "05:20 PM", 
      status: true, 
      hours: "8.08",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 22, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-12", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 23, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-12", 
      checkIn: "02:00 PM", 
      checkOut: "10:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 24, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-12", 
      checkIn: "08:45 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 25, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-11", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 26, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-11", 
      checkIn: "02:00 PM", 
      checkOut: "10:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 27, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-11", 
      checkIn: "09:30 AM", 
      checkOut: "05:15 PM", 
      status: true, 
      hours: "7.75",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 28, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-11", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 29, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-11", 
      checkIn: "02:15 PM", 
      checkOut: "10:30 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 30, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-11", 
      checkIn: "08:45 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 31, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-10", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 32, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-10", 
      checkIn: "02:00 PM", 
      checkOut: "10:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 33, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-10", 
      checkIn: "09:30 AM", 
      checkOut: "05:15 PM", 
      status: true, 
      hours: "7.75",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 34, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-10", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 35, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-10", 
      checkIn: "02:15 PM", 
      checkOut: "10:30 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 36, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-10", 
      checkIn: "08:45 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 37, 
      name: "John Doe", 
      shift: "Morning", 
      date: "2024-01-09", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 38, 
      name: "Jane Smith", 
      shift: "Evening", 
      date: "2024-01-09", 
      checkIn: "02:00 PM", 
      checkOut: "10:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 39, 
      name: "Mike Johnson", 
      shift: "Morning", 
      date: "2024-01-09", 
      checkIn: "09:30 AM", 
      checkOut: "05:15 PM", 
      status: true, 
      hours: "7.75",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 40, 
      name: "Sarah Wilson", 
      shift: "Morning", 
      date: "2024-01-09", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.0",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 41, 
      name: "David Brown", 
      shift: "Evening", 
      date: "2024-01-09", 
      checkIn: "02:15 PM", 
      checkOut: "10:30 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
    { 
      id: 42, 
      name: "Emily Davis", 
      shift: "Morning", 
      date: "2024-01-09", 
      checkIn: "08:45 AM", 
      checkOut: "05:00 PM", 
      status: true, 
      hours: "8.25",
      weeklyOff: false,
      proofImage: null,
      location: null,
      canPunchIn: false,
      canPunchOut: true
    },
  ]);

  // Generate dates for the selected week
  const getWeekDates = (year: number, month: number, weekNumber: number) => {
    const dates = [];
    // Simple week calculation - start from first day of month
    const startDate = new Date(year, month, 1);
    
    // Find the first Monday of the month
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() + 1);
    }
    
    // Adjust for week number
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedYear, selectedMonth, selectedWeek);

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get day name abbreviation
  const getDayAbbreviation = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get unique employee names
  const employeeNames = [...new Set(employeeAttendance.map(emp => emp.name))];

  // Calculate weekly attendance for each employee
  const calculateWeeklyAttendance = () => {
    const weeklyData = employeeNames.map(name => {
      const employeeRecords = employeeAttendance.filter(emp => emp.name === name);
      const weekAttendance = weekDates.map(date => {
        const dateStr = formatDate(date);
        const record = employeeRecords.find(emp => emp.date === dateStr);
        
        if (!record) {
          return {
            date: dateStr,
            status: null,
            checkIn: "-",
            checkOut: "-",
            hours: "0.0",
            weeklyOff: false
          };
        }

        return {
          date: dateStr,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          hours: record.hours,
          weeklyOff: record.weeklyOff
        };
      });

      // Calculate totals
      const presentCount = weekAttendance.filter(day => day.status === true).length;
      const absentCount = weekAttendance.filter(day => day.status === false && !day.weeklyOff).length;
      const weeklyOffCount = weekAttendance.filter(day => day.weeklyOff).length;
      const totalHours = weekAttendance.reduce((sum, day) => sum + parseFloat(day.hours), 0);

      return {
        name,
        attendance: weekAttendance,
        presentCount,
        absentCount,
        weeklyOffCount,
        totalHours: totalHours.toFixed(2),
        overallStatus: presentCount > 0 ? "Present" : absentCount > 0 ? "Absent" : "Weekly Off"
      };
    });

    return weeklyData;
  };

  const weeklyAttendanceData = calculateWeeklyAttendance();

  // Get status display
  const getDayStatusDisplay = (status: boolean | null, weeklyOff: boolean) => {
    if (weeklyOff) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            WO
          </div>
          <span className="text-xs text-blue-600 mt-1">WO</span>
        </div>
      );
    }
    
    if (status === true) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle className="h-4 w-4" />
          </div>
          <span className="text-xs text-green-600 mt-1">P</span>
        </div>
      );
    } else if (status === false) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-4 w-4" />
          </div>
          <span className="text-xs text-red-600 mt-1">A</span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
            -
          </div>
          <span className="text-xs text-gray-400 mt-1">-</span>
        </div>
      );
    }
  };

  // Navigate to previous/next week
  const handlePreviousWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    } else {
      if (selectedMonth > 0) {
        setSelectedMonth(selectedMonth - 1);
        setSelectedWeek(5); // Assuming 5 weeks per month
      } else {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(11); // December
        setSelectedWeek(5);
      }
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek < 5) { // Assuming 5 weeks per month
      setSelectedWeek(selectedWeek + 1);
    } else {
      if (selectedMonth < 11) {
        setSelectedMonth(selectedMonth + 1);
        setSelectedWeek(1);
      } else {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(0); // January
        setSelectedWeek(1);
      }
    }
  };

  // Export weekly report
  const handleExportWeeklyReport = () => {
    toast.success("Weekly attendance report exported successfully!");
  };

  // Filter employee attendance by selected date
  const filteredEmployeeAttendance = employeeAttendance.filter(emp => emp.date === selectedDate);
  
  // Current day stats for employees
  const presentCount = filteredEmployeeAttendance.filter(e => e.status).length;
  const totalEmployees = filteredEmployeeAttendance.length;

  // My attendance stats
  const myPresentCount = myAttendance.filter(e => e.status === "Present").length;
  const myTotalDays = myAttendance.length;

  // Toggle employee attendance
  const toggleEmployeeAttendance = (id: number) => {
    setEmployeeAttendance(employeeAttendance.map(emp => 
      emp.id === id ? { ...emp, status: !emp.status } : emp
    ));
    toast.success("Attendance updated!");
  };

  // Update employee attendance field
  const updateEmployeeAttendanceField = (id: number, field: string, value: string | boolean) => {
    setEmployeeAttendance(employeeAttendance.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
    toast.success(`${field} updated!`);
  };

  // Mark weekly off for employee
  const handleMarkWeeklyOff = (id: number) => {
    const employee = employeeAttendance.find(emp => emp.id === id);
    if (employee) {
      setEmployeeAttendance(employeeAttendance.map(emp => 
        emp.id === id ? { 
          ...emp, 
          weeklyOff: true,
          status: false,
          checkIn: "-",
          checkOut: "-",
          hours: "0.0",
          canPunchIn: false,
          canPunchOut: false
        } : emp
      ));
      toast.success(`${employee.name} marked as Weekly Off`);
    }
  };

  // Mark all employees
  const handleMarkAllEmployees = (present: boolean) => {
    const updatedAttendance = employeeAttendance.map(emp => {
      if (emp.date === selectedDate) {
        return { 
          ...emp, 
          status: present,
          checkIn: present ? emp.checkIn : "-",
          checkOut: present ? emp.checkOut : "-",
          hours: present ? emp.hours : "0.0",
          canPunchIn: !present,
          canPunchOut: present
        };
      }
      return emp;
    });
    setEmployeeAttendance(updatedAttendance);
    toast.success(`All employees marked as ${present ? "present" : "absent"}!`);
  };

  // Export attendance data
  const handleExportData = () => {
    toast.success("Attendance data exported successfully!");
  };

  // Get status badge color
  const getStatusBadge = (status: string | boolean) => {
    if (status === "Present" || status === true) {
      return "bg-green-100 text-green-800 border-green-200";
    } else {
      return "bg-red-100 text-red-800 border-red-200";
    }
  };

  // Get status text
  const getStatusText = (status: string | boolean) => {
    return status === "Present" || status === true ? "Present" : "Absent";
  };

  // Handle Punch In
  const handlePunchIn = (id: number) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    setEmployeeAttendance(employeeAttendance.map(emp => 
      emp.id === id ? { 
        ...emp, 
        checkIn: timeString,
        status: true,
        canPunchIn: false,
        canPunchOut: true,
        hours: "0.0" // Reset hours, will be calculated on punch out
      } : emp
    ));
    
    toast.success("Punched In successfully!");
  };

  // Handle Punch Out
  const handlePunchOut = (id: number) => {
    const employee = employeeAttendance.find(emp => emp.id === id);
    if (!employee || employee.checkIn === "-") {
      toast.error("Cannot punch out without punching in first");
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Parse check-in time
    const checkInTimeStr = employee.checkIn;
    const checkInDate = new Date();
    const [checkInTime, checkInPeriod] = checkInTimeStr.split(" ");
    let [checkInHours, checkInMinutes] = checkInTime.split(":").map(Number);
    
    // Convert to 24-hour format
    if (checkInPeriod === "PM" && checkInHours !== 12) {
      checkInHours += 12;
    }
    if (checkInPeriod === "AM" && checkInHours === 12) {
      checkInHours = 0;
    }
    
    checkInDate.setHours(checkInHours, checkInMinutes, 0, 0);
    
    // Parse check-out time
    const checkOutDate = new Date();
    const [checkOutTime, checkOutPeriod] = timeString.split(" ");
    let [checkOutHours, checkOutMinutes] = checkOutTime.split(":").map(Number);
    
    // Convert to 24-hour format
    if (checkOutPeriod === "PM" && checkOutHours !== 12) {
      checkOutHours += 12;
    }
    if (checkOutPeriod === "AM" && checkOutHours === 12) {
      checkOutHours = 0;
    }
    
    checkOutDate.setHours(checkOutHours, checkOutMinutes, 0, 0);
    
    // Calculate hours difference
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const roundedHours = Math.round(diffHours * 100) / 100;
    
    setEmployeeAttendance(employeeAttendance.map(emp => 
      emp.id === id ? { 
        ...emp, 
        checkOut: timeString,
        canPunchIn: false,
        canPunchOut: false,
        hours: roundedHours.toFixed(2)
      } : emp
    ));
    
    toast.success(`Punched Out successfully! Total hours: ${roundedHours.toFixed(2)}`);
  };

  // Open camera for attendance proof
  const openCamera = (employeeId: number) => {
    setSelectedEmployee(employeeId);
    setCameraOpen(true);
    setCameraImage(null);
    
    // Start camera
    setTimeout(() => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera");
          });
      }
    }, 100);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageData = canvasRef.current.toDataURL('image/png');
        setCameraImage(imageData);
      }
    }
  };

  // Get current location
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Submit attendance proof
  const submitAttendanceProof = async () => {
    if (!selectedEmployee || !cameraImage) {
      toast.error("Please capture a photo first");
      return;
    }

    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Update employee attendance with proof
      setEmployeeAttendance(employeeAttendance.map(emp => 
        emp.id === selectedEmployee ? { 
          ...emp, 
          proofImage: cameraImage,
          location: location
        } : emp
      ));

      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      setCameraOpen(false);
      setSelectedEmployee(null);
      setCameraImage(null);
      
      toast.success("Attendance proof uploaded successfully!");
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Could not get location. Please enable location services.");
    }
  };

  // Close camera
  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraOpen(false);
    setSelectedEmployee(null);
    setCameraImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Attendance Management" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="my-attendance" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Attendance
            </TabsTrigger>
            <TabsTrigger value="employee-attendance" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Attendance
            </TabsTrigger>
            <TabsTrigger value="weekly-register" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Weekly Register
            </TabsTrigger>
          </TabsList>

          {/* My Attendance Tab */}
          <TabsContent value="my-attendance" className="space-y-6">
            {/* Stats Cards for My Attendance */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myTotalDays}</div>
                  <p className="text-xs text-muted-foreground">Tracked period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{myPresentCount}</div>
                  <p className="text-xs text-muted-foreground">Days attended</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{myTotalDays - myPresentCount}</div>
                  <p className="text-xs text-muted-foreground">Days missed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((myPresentCount / myTotalDays) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Overall rate</p>
                </CardContent>
              </Card>
            </div>

            {/* My Attendance History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <CardTitle>My Attendance History</CardTitle>
                    <CardDescription>Your attendance records for the past days</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Hours Worked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {record.checkIn}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {record.checkOut}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(record.status)}>
                            {record.status === "Present" ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {record.hours} hrs
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Current Day Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Check In Time</p>
                      <p className="text-2xl font-bold">09:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current Status</p>
                      <p className="text-2xl font-bold text-green-600">Present</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estimated Hours</p>
                      <p className="text-2xl font-bold">8.0 hrs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employee Attendance Tab */}
          <TabsContent value="employee-attendance" className="space-y-6">
            {/* Stats Cards for Employee Attendance */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">All shifts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                  <p className="text-xs text-muted-foreground">Employees present</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {totalEmployees - presentCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Employees absent</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Overall rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Employee Attendance Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  <div>
                    <CardTitle>Today's Employee Attendance</CardTitle>
                    <CardDescription>Manage attendance for all employees</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="attendance-date" className="text-sm">Select Date:</Label>
                    <Input
                      id="attendance-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleMarkAllEmployees(true)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark All Present
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleMarkAllEmployees(false)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Mark All Absent
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing attendance for: <span className="font-medium">{selectedDate}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Punch Actions</TableHead>
                      <TableHead className="text-right">Weekly Off</TableHead>
                      <TableHead className="text-right">Upload Proof</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployeeAttendance.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>
                          <select
                            value={employee.shift}
                            onChange={(e) => updateEmployeeAttendanceField(employee.id, 'shift', e.target.value)}
                            className="border rounded px-2 py-1 text-sm bg-transparent"
                          >
                            <option value="Morning">Morning</option>
                            <option value="Evening">Evening</option>
                            <option value="Night">Night</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={employee.date}
                            readOnly
                            className="w-32 bg-gray-50"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={employee.checkIn}
                            readOnly
                            className="w-24 bg-gray-50"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={employee.checkOut}
                            readOnly
                            className="w-24 bg-gray-50"
                          />
                        </TableCell>
                        <TableCell>
                          {employee.status ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Present
                            </div>
                          ) : employee.weeklyOff ? (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Calendar className="h-4 w-4" />
                              Weekly Off
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="h-4 w-4" />
                              Absent
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {employee.hours} hrs
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePunchIn(employee.id)}
                              disabled={!employee.canPunchIn || employee.weeklyOff}
                              className="h-8"
                            >
                              <LogIn className="h-3 w-3 mr-1" />
                              Punch In
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePunchOut(employee.id)}
                              disabled={!employee.canPunchOut || employee.weeklyOff}
                              className="h-8"
                            >
                              <LogOut className="h-3 w-3 mr-1" />
                              Punch Out
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkWeeklyOff(employee.id)}
                            disabled={employee.weeklyOff}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            {employee.weeklyOff ? "Weekly Off" : "Mark Weekly Off"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {employee.proofImage ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded overflow-hidden border">
                                  <img 
                                    src={employee.proofImage} 
                                    alt="Proof" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {employee.location && (
                                  <MapPin className="h-4 w-4 text-green-600" />
                                )}
                                <span className="text-xs text-green-600">✓</span>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openCamera(employee.id)}
                              >
                                <Camera className="h-4 w-4 mr-1" />
                                Upload Proof
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEmployeeAttendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No attendance records found for {selectedDate}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Attendance
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Rate</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best Month</span>
                      <span className="font-medium">January (95%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Shift Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Morning Shift</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Evening Shift</span>
                      <span className="font-medium">40%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weekly Register Tab */}
          <TabsContent value="weekly-register" className="space-y-6">
            {/* Week Navigation */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Weekly Attendance Register</CardTitle>
                    <CardDescription>Employee-wise weekly attendance summary</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-center min-w-[200px]">
                        <div className="font-medium">
                          Week {selectedWeek}, {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleExportWeeklyReport}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Present (P)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Absent (A)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      WO
                    </div>
                    <span className="text-sm">Weekly Off (WO)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      -
                    </div>
                    <span className="text-sm">No Data</span>
                  </div>
                </div>

                {/* Weekly Attendance Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left p-4 font-medium text-gray-600 min-w-[200px] sticky left-0 bg-gray-50">
                            Employee Name
                          </th>
                          {weekDates.map((date, index) => (
                            <th key={index} className="text-center p-4 font-medium text-gray-600 min-w-[120px]">
                              <div className="flex flex-col items-center">
                                <div className="text-sm font-normal">{getDayAbbreviation(date)}</div>
                                <div className="text-xs text-gray-500">{date.getDate()}</div>
                              </div>
                            </th>
                          ))}
                          <th className="text-center p-4 font-medium text-gray-600 min-w-[100px]">
                            Present
                          </th>
                          <th className="text-center p-4 font-medium text-gray-600 min-w-[100px]">
                            Absent
                          </th>
                          <th className="text-center p-4 font-medium text-gray-600 min-w-[100px]">
                            Weekly Off
                          </th>
                          <th className="text-center p-4 font-medium text-gray-600 min-w-[100px]">
                            Total Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyAttendanceData.map((employee, empIndex) => (
                          <tr key={empIndex} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium sticky left-0 bg-white">
                              {employee.name}
                            </td>
                            {employee.attendance.map((day, dayIndex) => (
                              <td key={dayIndex} className="p-4 text-center">
                                {getDayStatusDisplay(day.status, day.weeklyOff)}
                                <div className="mt-1 text-xs text-gray-500">
                                  {day.checkIn !== "-" && `${day.checkIn}`}
                                </div>
                              </td>
                            ))}
                            <td className="p-4 text-center">
                              <div className="text-green-600 font-medium">{employee.presentCount}</div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="text-red-600 font-medium">{employee.absentCount}</div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="text-blue-600 font-medium">{employee.weeklyOffCount}</div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="font-medium">{employee.totalHours} hrs</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Summary Footer */}
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="p-4 font-medium sticky left-0 bg-gray-50">
                            Total Summary
                          </td>
                          {weekDates.map((_, dayIndex) => (
                            <td key={dayIndex} className="p-4 text-center">
                              <div className="text-sm text-gray-600">
                                {weeklyAttendanceData.filter(emp => 
                                  emp.attendance[dayIndex].status === true
                                ).length} P
                              </div>
                            </td>
                          ))}
                          <td className="p-4 text-center font-medium text-green-600">
                            {weeklyAttendanceData.reduce((sum, emp) => sum + emp.presentCount, 0)}
                          </td>
                          <td className="p-4 text-center font-medium text-red-600">
                            {weeklyAttendanceData.reduce((sum, emp) => sum + emp.absentCount, 0)}
                          </td>
                          <td className="p-4 text-center font-medium text-blue-600">
                            {weeklyAttendanceData.reduce((sum, emp) => sum + emp.weeklyOffCount, 0)}
                          </td>
                          <td className="p-4 text-center font-medium">
                            {weeklyAttendanceData.reduce((sum, emp) => sum + parseFloat(emp.totalHours), 0).toFixed(2)} hrs
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Weekly Present Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {(() => {
                          const totalDays = weeklyAttendanceData.length * 7;
                          const presentDays = weeklyAttendanceData.reduce((sum, emp) => sum + emp.presentCount, 0);
                          return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
                        })()}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average attendance rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Best Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const bestEmp = weeklyAttendanceData.reduce((best, emp) => 
                            emp.presentCount > best.presentCount ? emp : best
                          , weeklyAttendanceData[0]);
                          return bestEmp ? `${bestEmp.presentCount}/7` : "0/7";
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {weeklyAttendanceData.reduce((best, emp) => 
                          emp.presentCount > best.presentCount ? emp : best
                        , weeklyAttendanceData[0])?.name || "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Working Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {weeklyAttendanceData.reduce((sum, emp) => sum + parseFloat(emp.totalHours), 0).toFixed(2)} hrs
                      </div>
                      <div className="text-sm text-muted-foreground">Weekly total</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Full Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {weeklyAttendanceData.filter(emp => emp.presentCount === 7).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Employees with 7/7</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Camera Dialog for Attendance Proof */}
      <Dialog open={cameraOpen} onOpenChange={closeCamera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Attendance Proof</DialogTitle>
            <DialogDescription>
              Capture a photo and location for attendance verification
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!cameraImage ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto border rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={cameraImage} 
                  alt="Captured proof" 
                  className="w-full h-auto"
                />
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Photo will be captured with current timestamp</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>GPS location will be recorded automatically</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            {!cameraImage ? (
              <>
                <Button variant="outline" onClick={closeCamera}>
                  Cancel
                </Button>
                <Button onClick={capturePhoto}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCameraImage(null)}>
                  Retake
                </Button>
                <Button onClick={submitAttendanceProof}>
                  Submit Proof
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;