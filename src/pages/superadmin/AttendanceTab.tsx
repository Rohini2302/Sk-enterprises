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
      weeklyOff: 8, // Added weekly off column
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
      weeklyOff: 4, // Added weekly off column
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
      weeklyOff: 1, // Added weekly off column
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
      weeklyOff: 3, // Added weekly off column
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
      weeklyOff: 2, // Added weekly off column
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
  status: 'present' | 'absent' | 'leave' | 'weekly-off';
  checkInTime?: string;
  checkOutTime?: string;
  site: string;
  date: string;
  remark?: string; // Add remark field
  action?: 'fine' | 'advance' | 'other' | '' | 'none'; // Add action field
}

// Helper function to calculate days between dates
const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff + 1; // +1 to include both start and end dates
};

// Generate employee data for sites with weekly off counted in present
const generateEmployeeData = (siteName: string, date: string, totalEmployees: number, presentCount: number): Employee[] => {
  const employees: Employee[] = [];
  const departments = ['Housekeeping', 'Security', 'Parking', 'Waste Management', 'Consumables', 'Other'];
  const positions = ['Staff', 'Supervisor', 'Manager', 'Executive'];
  const actions = ['fine', 'advance', 'other', 'none'] as const;
  const remarks = [
    'Late arrival',
    'Early departure',
    'Half day',
    'Permission granted',
    'Medical leave',
    'Personal work',
    '',
    '',
    '',
    '' // More empty strings to have some employees without remarks
  ];
  
  // Weekly off employees are included in present count
  const weeklyOffCount = Math.floor(presentCount * 0.15); // 15% of present employees are on weekly off
  const regularPresentCount = presentCount - weeklyOffCount;
  
  // Generate weekly off employees (counted in present)
  for (let i = 1; i <= weeklyOffCount; i++) {
    employees.push({
      id: `EMP${siteName.substring(0, 3).toUpperCase()}${date.replace(/-/g, '')}WO${i}`,
      name: `Employee ${i} ${siteName.substring(0, 8)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      status: 'weekly-off',
      site: siteName,
      date: date,
      remark: 'Weekly off', // Add remark for weekly off
      action: 'none' // No action for weekly off
    });
  }
  
  // Generate regular present employees
  for (let i = 1; i <= regularPresentCount; i++) {
    const hasRemark = Math.random() > 0.5;
    const hasAction = Math.random() > 0.7;
    
    employees.push({
      id: `EMP${siteName.substring(0, 3).toUpperCase()}${date.replace(/-/g, '')}${i}`,
      name: `Employee ${i} ${siteName.substring(0, 8)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      status: 'present',
      checkInTime: '08:00',
      checkOutTime: '17:00',
      site: siteName,
      date: date,
      remark: hasRemark ? remarks[Math.floor(Math.random() * remarks.length)] : '',
      action: hasAction ? actions[Math.floor(Math.random() * actions.length)] : 'none'
    });
  }
  
  // Generate absent employees (remaining)
  const absentCount = totalEmployees - presentCount;
  for (let i = 1; i <= absentCount; i++) {
    const hasRemark = Math.random() > 0.3;
    const hasAction = Math.random() > 0.5;
    
    employees.push({
      id: `EMP${siteName.substring(0, 3).toUpperCase()}${date.replace(/-/g, '')}A${i}`,
      name: `Employee ${i} ${siteName.substring(0, 8)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      status: 'absent',
      site: siteName,
      date: date,
      remark: hasRemark ? remarks[Math.floor(Math.random() * remarks.length)] : '',
      action: hasAction ? actions[Math.floor(Math.random() * actions.length)] : 'none'
    });
  }
  
  return employees;
};

// Generate cumulative site attendance data for the period with duration-based calculations
const generateSiteAttendanceData = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange: string[] = [];
  
  // Calculate number of days in the period
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dateRange.push(date.toISOString().split('T')[0]);
  }
  
  const daysInPeriod = calculateDaysBetween(startDate, endDate);
  const isSingleDay = daysInPeriod === 1;
  const result = [];
  
  // For each site, generate cumulative data for the period
  for (let i = 0; i < siteNames.length; i++) {
    const siteName = siteNames[i];
    const siteFactor = (i + 1) * 123;
    
    const totalEmployees = Math.floor(20 + (Math.sin(siteFactor) * 15) + 15);
    const attendanceRate = 0.85 + (Math.sin(siteFactor) * 0.1);
    
    // Calculate cumulative totals for the period
    let cumulativePresent = 0;
    let cumulativeWeeklyOff = 0;
    let cumulativeAbsent = 0;
    let cumulativeShortage = 0;
    
    // For single day, calculate actual present vs weekly off
    let singleDayActualPresent = 0;
    let singleDayWeeklyOff = 0;
    let singleDayTotalPresent = 0;
    
    // Generate data for each day to calculate cumulative totals
    for (const date of dateRange) {
      const dateHash = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const dailyAttendanceRate = attendanceRate + (Math.sin(dateHash + siteFactor) * 0.05);
      const dailyPresent = Math.floor(totalEmployees * dailyAttendanceRate);
      const dailyWeeklyOff = Math.floor(dailyPresent * 0.15);
      const dailyActualPresent = dailyPresent - dailyWeeklyOff;
      const dailyAbsent = totalEmployees - dailyPresent;
      const dailyShortage = dailyAbsent;
      
      cumulativePresent += dailyPresent;
      cumulativeWeeklyOff += dailyWeeklyOff;
      cumulativeAbsent += dailyAbsent;
      cumulativeShortage += dailyShortage;
      
      // For single day view, store the detailed breakdown
      if (isSingleDay) {
        singleDayActualPresent = dailyActualPresent;
        singleDayWeeklyOff = dailyWeeklyOff;
        singleDayTotalPresent = dailyPresent;
      }
    }
    
    // Calculate period totals with duration-based calculations
    // 1. Total Required = Total Employees × Days in Period
    const totalRequired = totalEmployees * daysInPeriod;
    
    // 2. Weekly Off = Total Weekly Off for the period
    const totalWeeklyOff = cumulativeWeeklyOff;
    
    // 3. On Site Requirement = Total Required - Total Weekly Off
    const totalOnSiteRequirement = totalRequired - totalWeeklyOff;
    
    // 4. Present = Total Present (excluding weekly off) for the period
    const totalPresent = cumulativePresent - cumulativeWeeklyOff;
    
    // 5. Absent = Total Absent for the period
    const totalAbsent = cumulativeAbsent;
    
    // Calculate existing fields for backward compatibility
    const totalRequiredAttendance = daysInPeriod * totalEmployees;
    const totalPresentAttendance = cumulativePresent;
    const periodShortage = cumulativeShortage;
    
    const siteData: any = {
      id: `${siteName}-${startDate}-${endDate}`,
      name: siteName,
      totalEmployees,
      present: Math.round(cumulativePresent / daysInPeriod), // Average daily present
      weeklyOff: Math.round(cumulativeWeeklyOff / daysInPeriod), // Average daily weekly off
      absent: Math.round(cumulativeAbsent / daysInPeriod), // Average daily absent
      shortage: periodShortage, // Total shortage for period
      date: `${startDate} to ${endDate}`,
      daysInPeriod,
      totalRequiredAttendance,
      totalPresentAttendance,
      periodShortage,
      startDate,
      endDate,
      
      // New calculated fields for duration
      durationTotalRequired: totalRequired,
      durationWeeklyOff: totalWeeklyOff,
      durationOnSiteRequirement: totalOnSiteRequirement,
      durationPresent: totalPresent,
      durationAbsent: totalAbsent,
      
      // Daily averages for display
      avgDailyTotalRequired: totalEmployees, // This is constant per day
      avgDailyWeeklyOff: Math.round(cumulativeWeeklyOff / daysInPeriod),
      avgDailyOnSiteRequirement: Math.round((totalRequired - totalWeeklyOff) / daysInPeriod),
      avgDailyPresent: Math.round((cumulativePresent - cumulativeWeeklyOff) / daysInPeriod),
      avgDailyAbsent: Math.round(cumulativeAbsent / daysInPeriod),
      
      // Calculate new fields for single day view
      onSiteRequirement: isSingleDay ? (totalEmployees - singleDayWeeklyOff) : Math.round((totalRequired - totalWeeklyOff) / daysInPeriod),
      actualPresent: isSingleDay ? singleDayActualPresent : Math.round(cumulativePresent / daysInPeriod) - Math.round(cumulativeWeeklyOff / daysInPeriod),
      // Generate sample employees for one day (for view details)
      employees: generateEmployeeData(siteName, startDate, totalEmployees, Math.round(cumulativePresent / daysInPeriod))
    };
    
    // Add single day specific fields
    if (isSingleDay) {
      siteData.singleDayActualPresent = singleDayActualPresent;
      siteData.singleDayWeeklyOff = singleDayWeeklyOff;
      siteData.singleDayTotalPresent = singleDayTotalPresent;
      siteData.singleDayAbsent = totalEmployees - singleDayTotalPresent;
      siteData.singleDayShortage = siteData.singleDayAbsent;
      siteData.singleDayOnSiteRequirement = totalEmployees - singleDayWeeklyOff;
      
      // For single day, duration totals equal daily values
      siteData.durationTotalRequired = totalEmployees;
      siteData.durationWeeklyOff = singleDayWeeklyOff;
      siteData.durationOnSiteRequirement = totalEmployees - singleDayWeeklyOff;
      siteData.durationPresent = singleDayActualPresent;
      siteData.durationAbsent = totalEmployees - singleDayTotalPresent;
      
      // For single day, averages equal the daily values
      siteData.avgDailyTotalRequired = totalEmployees;
      siteData.avgDailyWeeklyOff = singleDayWeeklyOff;
      siteData.avgDailyOnSiteRequirement = totalEmployees - singleDayWeeklyOff;
      siteData.avgDailyPresent = singleDayActualPresent;
      siteData.avgDailyAbsent = totalEmployees - singleDayTotalPresent;
    }
    
    result.push(siteData);
  }
  
  return result;
};

// Generate cumulative department site data for the period with duration-based calculations
const generateDepartmentSiteData = (startDate: string, endDate: string, department: string) => {
  const deptData = departmentViewData.find(d => d.department === department);
  
  if (!deptData) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange: string[] = [];
  
  // Calculate number of days in the period
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dateRange.push(date.toISOString().split('T')[0]);
  }
  
  const daysInPeriod = calculateDaysBetween(startDate, endDate);
  const isSingleDay = daysInPeriod === 1;
  const departmentSites = siteNames.slice(0, Math.floor(siteNames.length * 0.6));
  const result = [];
  
  // For each site in department, generate cumulative data
  for (let i = 0; i < departmentSites.length; i++) {
    const siteName = departmentSites[i];
    const siteFactor = (i + 1) * 456;
    
    const totalDistribution = departmentSites.length;
    const baseCount = Math.floor(deptData.total / totalDistribution);
    const remainder = deptData.total % totalDistribution;
    
    const total = baseCount + (i < remainder ? 1 : 0);
    const departmentRate = parseFloat(deptData.rate) / 100;
    
    // Calculate cumulative totals for the period
    let cumulativePresent = 0;
    let cumulativeWeeklyOff = 0;
    let cumulativeAbsent = 0;
    let cumulativeShortage = 0;
    
    // For single day, calculate actual present vs weekly off
    let singleDayActualPresent = 0;
    let singleDayWeeklyOff = 0;
    let singleDayTotalPresent = 0;
    
    // Generate data for each day to calculate cumulative totals
    for (const date of dateRange) {
      const dateHash = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const dailyRate = departmentRate + (Math.sin(dateHash + siteFactor) * 0.05);
      const dailyPresentCount = Math.floor(total * dailyRate);
      const dailyWeeklyOffCount = Math.floor(dailyPresentCount * 0.15);
      const dailyActualPresent = dailyPresentCount - dailyWeeklyOffCount;
      const dailyAbsentCount = total - dailyPresentCount;
      const dailyShortage = dailyAbsentCount;
      
      cumulativePresent += dailyPresentCount;
      cumulativeWeeklyOff += dailyWeeklyOffCount;
      cumulativeAbsent += dailyAbsentCount;
      cumulativeShortage += dailyShortage;
      
      // For single day view, store the detailed breakdown
      if (isSingleDay) {
        singleDayActualPresent = dailyActualPresent;
        singleDayWeeklyOff = dailyWeeklyOffCount;
        singleDayTotalPresent = dailyPresentCount;
      }
    }
    
    // Calculate period totals with duration-based calculations
    // 1. Total Required = Total Employees × Days in Period
    const totalRequired = total * daysInPeriod;
    
    // 2. Weekly Off = Total Weekly Off for the period
    const totalWeeklyOff = cumulativeWeeklyOff;
    
    // 3. On Site Requirement = Total Required - Total Weekly Off
    const totalOnSiteRequirement = totalRequired - totalWeeklyOff;
    
    // 4. Present = Total Present (excluding weekly off) for the period
    const totalPresent = cumulativePresent - cumulativeWeeklyOff;
    
    // 5. Absent = Total Absent for the period
    const totalAbsent = cumulativeAbsent;
    
    // Calculate existing fields for backward compatibility
    const totalRequiredAttendance = daysInPeriod * total;
    const totalPresentAttendance = cumulativePresent;
    
    const siteData: any = {
      siteId: `${siteName}-${startDate}-${endDate}`,
      siteName,
      present: Math.round(cumulativePresent / daysInPeriod), // Average daily present
      weeklyOff: Math.round(cumulativeWeeklyOff / daysInPeriod), // Average daily weekly off
      absent: Math.round(cumulativeAbsent / daysInPeriod), // Average daily absent
      shortage: cumulativeShortage, // Total shortage for period
      total,
      date: `${startDate} to ${endDate}`,
      daysInPeriod,
      totalRequiredAttendance,
      totalPresentAttendance,
      periodShortage: cumulativeShortage,
      startDate,
      endDate,
      
      // New calculated fields for duration
      durationTotalRequired: totalRequired,
      durationWeeklyOff: totalWeeklyOff,
      durationOnSiteRequirement: totalOnSiteRequirement,
      durationPresent: totalPresent,
      durationAbsent: totalAbsent,
      
      // Daily averages for display
      avgDailyTotalRequired: total, // This is constant per day
      avgDailyWeeklyOff: Math.round(cumulativeWeeklyOff / daysInPeriod),
      avgDailyOnSiteRequirement: Math.round((totalRequired - totalWeeklyOff) / daysInPeriod),
      avgDailyPresent: Math.round((cumulativePresent - cumulativeWeeklyOff) / daysInPeriod),
      avgDailyAbsent: Math.round(cumulativeAbsent / daysInPeriod),
      
      // Calculate new fields for single day view
      onSiteRequirement: isSingleDay ? (total - singleDayWeeklyOff) : Math.round((totalRequired - totalWeeklyOff) / daysInPeriod),
      actualPresent: isSingleDay ? singleDayActualPresent : Math.round(cumulativePresent / daysInPeriod) - Math.round(cumulativeWeeklyOff / daysInPeriod),
      // Generate sample employees for one day (for view details)
      employees: generateEmployeeData(siteName, startDate, total, Math.round(cumulativePresent / daysInPeriod))
    };
    
    // Add single day specific fields
    if (isSingleDay) {
      siteData.singleDayActualPresent = singleDayActualPresent;
      siteData.singleDayWeeklyOff = singleDayWeeklyOff;
      siteData.singleDayTotalPresent = singleDayTotalPresent;
      siteData.singleDayAbsent = total - singleDayTotalPresent;
      siteData.singleDayShortage = siteData.singleDayAbsent;
      siteData.singleDayOnSiteRequirement = total - singleDayWeeklyOff;
      
      // For single day, duration totals equal daily values
      siteData.durationTotalRequired = total;
      siteData.durationWeeklyOff = singleDayWeeklyOff;
      siteData.durationOnSiteRequirement = total - singleDayWeeklyOff;
      siteData.durationPresent = singleDayActualPresent;
      siteData.durationAbsent = total - singleDayTotalPresent;
      
      // For single day, averages equal the daily values
      siteData.avgDailyTotalRequired = total;
      siteData.avgDailyWeeklyOff = singleDayWeeklyOff;
      siteData.avgDailyOnSiteRequirement = total - singleDayWeeklyOff;
      siteData.avgDailyPresent = singleDayActualPresent;
      siteData.avgDailyAbsent = total - singleDayTotalPresent;
    }
    
    result.push(siteData);
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
  const [activeTab, setActiveTab] = useState<'all' | 'present' | 'absent' | 'weekly-off'>('all');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>(siteData.employees || []);
  
  // Update employees when siteData changes
  useEffect(() => {
    setEmployees(siteData.employees || []);
  }, [siteData.employees]);

  const itemsPerPage = 20;

  // Update employee action
  const updateEmployeeAction = (employeeId: string, action: 'fine' | 'advance' | 'other' | '' | 'none') => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === employeeId ? { 
          ...emp, 
          action: action === 'none' ? '' : action 
        } : emp
      )
    );
  };

  // Update employee remark
  const updateEmployeeRemark = (employeeId: string, remark: string) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === employeeId ? { ...emp, remark } : emp
      )
    );
  };

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

  const allEmployees = employees;
  const presentEmployees = allEmployees.filter((emp: Employee) => emp.status === 'present' || emp.status === 'weekly-off');
  const absentEmployees = allEmployees.filter((emp: Employee) => emp.status === 'absent');
  const weeklyOffEmployees = allEmployees.filter((emp: Employee) => emp.status === 'weekly-off');
  const regularPresentEmployees = allEmployees.filter((emp: Employee) => emp.status === 'present');

  const filteredEmployees = useMemo(() => {
    let employees = [];
    switch (activeTab) {
      case 'present':
        employees = presentEmployees;
        break;
      case 'absent':
        employees = absentEmployees;
        break;
      case 'weekly-off':
        employees = weeklyOffEmployees;
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
  }, [activeTab, employeeSearch, allEmployees, presentEmployees, absentEmployees, weeklyOffEmployees]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleExportEmployees = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Position', 'Status', 'Check In', 'Check Out', 'Action', 'Remark', 'Site', 'Date'];
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
        emp.action === 'none' || !emp.action ? '-' : emp.action,
        `"${emp.remark || ''}"`,
        `"${emp.site}"`,
        emp.date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${siteData.name || siteData.siteName}_${siteData.startDate}_to_${siteData.endDate}.csv`);
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
                {formatDateDisplay(siteData.startDate)} to {formatDateDisplay(siteData.endDate)} • {viewType === 'department' ? 'Department View' : 'Site View'}
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
                <p className="text-2xl font-bold text-blue-600">{siteData.totalEmployees || siteData.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show actual present for single day view */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  {siteData.daysInPeriod === 1 ? 'Today Actual Present' : 'Avg Daily Present'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {siteData.daysInPeriod === 1 
                    ? (siteData.singleDayActualPresent || siteData.actualPresent || siteData.present)
                    : (siteData.actualPresent || siteData.present)
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {siteData.daysInPeriod === 1 ? 'Excluding weekly off' : 'Including weekly off'}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  {siteData.daysInPeriod === 1 ? 'Today Weekly Off' : 'Avg Weekly Off'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {siteData.daysInPeriod === 1
                    ? (siteData.singleDayWeeklyOff || siteData.weeklyOff)
                    : siteData.weeklyOff
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {siteData.daysInPeriod === 1 ? 'Weekly off today' : 'Included in present count'}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">
                  {siteData.daysInPeriod === 1 ? 'Today Shortage' : 'Total Shortage'}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {siteData.daysInPeriod === 1
                    ? (siteData.singleDayShortage || siteData.shortage)
                    : siteData.shortage
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  For {siteData.daysInPeriod} {siteData.daysInPeriod === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Period Calculation Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-sm">
              <h3 className="font-semibold mb-2">Period Attendance Calculation ({siteData.daysInPeriod} days):</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium">Total Required Attendance</span>
                  <div className="text-green-600 font-medium mt-1">
                    = {siteData.totalEmployees || siteData.total} employees × {siteData.daysInPeriod} days
                  </div>
                  <div className="text-green-600 font-medium mt-1">
                    = {siteData.totalRequiredAttendance}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium">Total Present Attendance</span>
                  <div className="text-blue-600 font-medium mt-1">
                    = Sum of daily present counts
                  </div>
                  <div className="text-blue-600 font-medium mt-1">
                    = {siteData.totalPresentAttendance}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <span className="font-medium">Total Shortage</span>
                  <div className="text-red-600 font-medium mt-1">
                    = Total Required - Total Present
                  </div>
                  <div className="text-red-600 font-medium mt-1">
                    = {siteData.totalRequiredAttendance} - {siteData.totalPresentAttendance} = {siteData.shortage}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">
                <strong>Note:</strong> Weekly off employees are counted in present. Daily shortage = Total Employees - Daily Present Count
              </p>
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
                  variant={activeTab === 'weekly-off' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('weekly-off');
                    setCurrentPage(1);
                  }}
                  className="text-xs"
                >
                  Weekly Off ({weeklyOffEmployees.length})
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
              Employee Details - {filteredEmployees.length} employees found (Sample day)
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
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Action
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Remark
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
                            variant={
                              employee.status === 'present' ? 'default' :
                              employee.status === 'weekly-off' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {employee.status === 'weekly-off' ? 'Weekly Off' : 
                             employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          {employee.checkInTime || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          {employee.checkOutTime || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          <Select 
                            value={employee.action || 'none'}
                            onValueChange={(value) => updateEmployeeAction(employee.id, value === 'none' ? '' : value as 'fine' | 'advance' | 'other' | '')}
                          >
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Action</SelectItem>
                              <SelectItem value="fine">Fine</SelectItem>
                              <SelectItem value="advance">Advance</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 align-middle">
                          <Input
                            value={employee.remark || ''}
                            placeholder="Add remark..."
                            className="h-8 text-xs"
                            onChange={(e) => updateEmployeeRemark(employee.id, e.target.value)}
                          />
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
  const [editingCell, setEditingCell] = useState<{siteIndex: number, date: string, type: 'shortage' | 'deploy' | 'supervisor' | 'weeklyOff'} | null>(null);
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
  const daysInMonth = 30; // For September

  const handleEdit = (siteIndex: number, date: string, currentValue: number, type: 'shortage' | 'deploy' | 'supervisor' | 'weeklyOff' = 'shortage') => {
    setEditingCell({ siteIndex, date, type });
    
    if (type === 'deploy') {
      setEditValue(shortages[siteIndex].deploy.toString());
    } else if (type === 'supervisor') {
      setEditValue(shortages[siteIndex].supervisor);
    } else if (type === 'weeklyOff') {
      setEditValue(shortages[siteIndex].weeklyOff.toString());
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
      } else if (editingCell.type === 'weeklyOff') {
        newShortages[editingCell.siteIndex].weeklyOff = parseInt(editValue) || 0;
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

  const calculateTotalWeeklyOff = () => {
    return shortages.reduce((sum, site) => sum + site.weeklyOff, 0);
  };

  // Calculate month attendance and shortage for each site
  const calculateSiteMetrics = (site: any) => {
    const totalRequiredAttendance = daysInMonth * site.deploy;
    
    // Calculate total present for the month (including weekly off)
    let totalPresentForMonth = 0;
    let totalShortageForMonth = 0;
    
    dates.forEach(date => {
      const shortage = site.shortages[date] || 0;
      // Present = Deploy - Shortage (including weekly off)
      const present = Math.max(0, site.deploy - shortage);
      totalPresentForMonth += present;
      totalShortageForMonth += shortage;
    });
    
    // For the period, shortage is the sum of daily shortages
    const shortage = totalShortageForMonth;
    const attendanceRate = totalRequiredAttendance > 0 ? ((totalPresentForMonth / totalRequiredAttendance) * 100).toFixed(1) : '0.0';
    
    return { 
      totalRequiredAttendance, 
      totalPresentForMonth, 
      shortage, 
      attendanceRate 
    };
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

      {/* Shortages Table - Show daily view for shortages management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Daily Shortages Management - {selectedMonth}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any cell to edit shortages, deploy numbers, weekly off, or supervisor names
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
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-indigo-50 min-w-[80px]">
                        WEEKLY OFF
                      </th>
                      {dates.map((date, index) => (
                        <th 
                          key={date} 
                          className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[50px]"
                        >
                          {index + 1}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 text-green-700 min-w-[80px]">
                        TOTAL REQUIRED
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 text-blue-700 min-w-[80px]">
                        TOTAL PRESENT
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50 text-red-700 min-w-[80px]">
                        TOTAL SHORTAGE
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50 text-yellow-700 min-w-[80px]">
                        ATTENDANCE RATE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shortages.map((site, siteIndex) => {
                      const metrics = calculateSiteMetrics(site);
                      
                      return (
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
                          
                          {/* Weekly Off - Editable */}
                          <td 
                            className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 border-r bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition-colors group relative"
                            onClick={() => handleEdit(siteIndex, '', 0, 'weeklyOff')}
                          >
                            {editingCell?.siteIndex === siteIndex && editingCell?.type === 'weeklyOff' ? (
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  ref={editInputRef}
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  className="w-16 h-7 text-center text-xs"
                                  min="0"
                                  max={site.deploy}
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
                                <span className="font-bold text-indigo-700">{site.weeklyOff}</span>
                                <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
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
                          
                          {/* Total Required Attendance */}
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-green-700 bg-green-50">
                            {metrics.totalRequiredAttendance}
                          </td>
                          
                          {/* Total Present (including weekly off) */}
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-blue-700 bg-blue-50">
                            {metrics.totalPresentForMonth}
                          </td>
                          
                          {/* Total Shortage */}
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-red-700 bg-red-50">
                            {metrics.shortage}
                          </td>
                          
                          {/* Attendance Rate */}
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-yellow-700 bg-yellow-50">
                            {metrics.attendanceRate}%
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Total Row */}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 border-r sticky left-0 bg-gray-100 z-10">
                        MONTHLY TOTAL
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500 border-r bg-blue-100">
                        -
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-purple-700 border-r bg-purple-100">
                        {calculateTotalDeploy()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-indigo-700 border-r bg-indigo-100">
                        {calculateTotalWeeklyOff()}
                      </td>
                      {dates.map(date => (
                        <td 
                          key={date} 
                          className="px-2 py-2 whitespace-nowrap text-sm text-center font-bold border-r bg-gray-200"
                        >
                          {calculateDateTotal(date)}
                        </td>
                      ))}
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-green-700 bg-green-100">
                        {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalRequiredAttendance, 0)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-blue-700 bg-blue-100">
                        {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalPresentForMonth, 0)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-red-700 bg-red-100">
                        {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).shortage, 0)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-bold text-yellow-700 bg-yellow-100">
                        {(() => {
                          const totalRequiredAttendance = shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalRequiredAttendance, 0);
                          const totalPresentAttendance = shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalPresentForMonth, 0);
                          return totalRequiredAttendance > 0 ? ((totalPresentAttendance / totalRequiredAttendance) * 100).toFixed(1) : '0.0';
                        })()}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Calculation Info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-sm">
            <h3 className="font-semibold mb-2 text-lg">Monthly Attendance Calculation ({daysInMonth} days):</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="font-medium text-green-700">Total Required Attendance</div>
                <div className="mt-1">= Days in Month × Total Employees</div>
                <div className="text-green-600 font-medium mt-2 text-lg">
                  {daysInMonth} days × {calculateTotalDeploy()} employees = {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalRequiredAttendance, 0).toLocaleString()} required attendances
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="font-medium text-blue-700">Total Present Attendance</div>
                <div className="mt-1">= Sum of daily present counts (including weekly off)</div>
                <div className="text-blue-600 font-medium mt-2 text-lg">
                  {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalPresentForMonth, 0).toLocaleString()} present attendances
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="font-medium text-red-700">Total Shortage</div>
                <div className="mt-1">= Sum of daily shortage counts</div>
                <div className="text-red-600 font-medium mt-2 text-lg">
                  {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).shortage, 0)} shortage
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-1">Important Calculation Rules:</h4>
              <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                <li><strong>Weekly off employees are counted in present</strong> - They are part of present count</li>
                <li><strong>Daily Shortage</strong> = Total Employees - Present Count (for that day)</li>
                <li><strong>Monthly Shortage</strong> = Sum of daily shortages</li>
                <li><strong>If Present = Total Employees</strong>, then <strong>NO shortage</strong> for that day</li>
                <li><strong>If Present &lt; Total Employees</strong>, then shortage = difference</li>
              </ul>
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
                <p className="text-sm font-medium text-green-600">Total Required</p>
                <p className="text-3xl font-bold text-green-700">
                  {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalRequiredAttendance, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">Monthly attendance required</p>
              </div>
              <div className="p-3 rounded-full bg-green-200">
                <Users className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Present</p>
                <p className="text-3xl font-bold text-blue-700">
                  {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalPresentForMonth, 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">Including weekly off</p>
              </div>
              <div className="p-3 rounded-full bg-blue-200">
                <UserCheck className="h-6 w-6 text-blue-700" />
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
                  {shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).shortage, 0)}
                </p>
                <p className="text-xs text-red-600 mt-1">Monthly shortage</p>
              </div>
              <div className="p-3 rounded-full bg-red-200">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {(() => {
                    const totalRequiredAttendance = shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalRequiredAttendance, 0);
                    const totalPresentAttendance = shortages.reduce((sum, site) => sum + calculateSiteMetrics(site).totalPresentForMonth, 0);
                    return totalRequiredAttendance > 0 ? ((totalPresentAttendance / totalRequiredAttendance) * 100).toFixed(1) : '0.0';
                  })()}%
                </p>
                <p className="text-xs text-yellow-600 mt-1">Overall attendance rate</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-200">
                <TrendingUp className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SuperAdminAttendanceView = () => {
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

  // Calculate days in period
  const daysInPeriod = useMemo(() => {
    return calculateDaysBetween(startDate, endDate);
  }, [startDate, endDate]);

  // Generate cumulative data for the period
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

  // Calculate overall totals for the period
  const overallTotals = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalEmployees: 0,
        durationTotalRequired: 0,
        durationWeeklyOff: 0,
        durationOnSiteRequirement: 0,
        durationPresent: 0,
        durationAbsent: 0,
        totalRequiredAttendance: 0,
        totalPresentAttendance: 0,
        totalShortage: 0,
        attendanceRate: '0.0'
      };
    }
    
    // Calculate duration totals
    const durationTotalRequired = filteredData.reduce((sum, item) => sum + item.durationTotalRequired, 0);
    const durationWeeklyOff = filteredData.reduce((sum, item) => sum + item.durationWeeklyOff, 0);
    const durationOnSiteRequirement = filteredData.reduce((sum, item) => sum + item.durationOnSiteRequirement, 0);
    const durationPresent = filteredData.reduce((sum, item) => sum + item.durationPresent, 0);
    const durationAbsent = filteredData.reduce((sum, item) => sum + item.durationAbsent, 0);
    
    // Existing calculations
    const totalEmployees = filteredData.reduce((sum, item) => sum + (item.totalEmployees || item.total), 0);
    const totalRequiredAttendance = filteredData.reduce((sum, item) => sum + item.totalRequiredAttendance, 0);
    const totalPresentAttendance = filteredData.reduce((sum, item) => sum + item.totalPresentAttendance, 0);
    const totalShortage = filteredData.reduce((sum, item) => sum + item.shortage, 0);
    const attendanceRate = totalRequiredAttendance > 0 ? ((totalPresentAttendance / totalRequiredAttendance) * 100).toFixed(1) : '0.0';
    
    return {
      totalEmployees,
      durationTotalRequired,
      durationWeeklyOff,
      durationOnSiteRequirement,
      durationPresent,
      durationAbsent,
      totalRequiredAttendance,
      totalPresentAttendance,
      totalShortage,
      attendanceRate
    };
  }, [filteredData]);

  // Calculate average daily values for the columns
  const columnValues = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgTotalRequired: 0,
        avgWeeklyOff: 0,
        avgOnSiteRequirement: 0,
        avgPresent: 0,
        avgAbsent: 0
      };
    }
    
    // Use the pre-calculated daily averages from the data
    const avgTotalRequired = Math.round(filteredData.reduce((sum, item) => sum + item.avgDailyTotalRequired, 0) / filteredData.length);
    const avgWeeklyOff = Math.round(filteredData.reduce((sum, item) => sum + item.avgDailyWeeklyOff, 0) / filteredData.length);
    const avgOnSiteRequirement = Math.round(filteredData.reduce((sum, item) => sum + item.avgDailyOnSiteRequirement, 0) / filteredData.length);
    const avgPresent = Math.round(filteredData.reduce((sum, item) => sum + item.avgDailyPresent, 0) / filteredData.length);
    const avgAbsent = Math.round(filteredData.reduce((sum, item) => sum + item.avgDailyAbsent, 0) / filteredData.length);
    
    return {
      avgTotalRequired,
      avgWeeklyOff,
      avgOnSiteRequirement,
      avgPresent,
      avgAbsent
    };
  }, [filteredData]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle export to Excel
  const handleExportToExcel = () => {
    let filename, csvContent;

    if (viewType === 'shortages') {
      filename = `Shortages_${shortagesData.months[0]}.csv`;
      const headers = ['Site Name', 'Supervisor', 'Deploy', 'Weekly Off', ...Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`), 'Total Required', 'Total Present', 'Total Shortage', 'Attendance Rate'];
      csvContent = [
        headers.join(','),
        ...shortagesData.sites.map(site => {
          const metrics = calculateSiteMetricsForExport(site);
          const shortagesArray = Array.from({ length: 30 }, (_, i) => site.shortages[`2024-09-${(i + 1).toString().padStart(2, '0')}`] || 0);
          return [
            `"${site.name}"`,
            `"${site.supervisor}"`,
            site.deploy,
            site.weeklyOff,
            ...shortagesArray,
            metrics.totalRequiredAttendance,
            metrics.totalPresentForMonth,
            metrics.shortage,
            metrics.attendanceRate + '%'
          ].join(',');
        })
      ].join('\n');
      
      function calculateSiteMetricsForExport(site: any) {
        const daysInMonth = 30;
        const totalRequiredAttendance = daysInMonth * site.deploy;
        
        let totalPresentForMonth = 0;
        let totalShortageForMonth = 0;
        
        for (let i = 1; i <= 30; i++) {
          const date = `2024-09-${i.toString().padStart(2, '0')}`;
          const shortage = site.shortages[date] || 0;
          const present = Math.max(0, site.deploy - shortage);
          totalPresentForMonth += present;
          totalShortageForMonth += shortage;
        }
        
        const attendanceRate = totalRequiredAttendance > 0 ? ((totalPresentForMonth / totalRequiredAttendance) * 100).toFixed(1) : '0.0';
        
        return { 
          totalRequiredAttendance, 
          totalPresentForMonth, 
          shortage: totalShortageForMonth, 
          attendanceRate 
        };
      }
    } else {
      // Original columns with duration calculations
      const headers = ['Site Name', 'Department', 'Period', 'Days', 'Total Required', 'Weekly Off', 'On Site Requirement', 'Present', 'Absent/Shortage', 'Attendance Rate'];
      filename = viewType === 'department' 
        ? `Attendance_${selectedDepartment}_${startDate}_to_${endDate}.csv`
        : `Sitewise_Attendance_${startDate}_to_${endDate}.csv`;
      
      csvContent = [
        headers.join(','),
        ...filteredData.map(item => {
          const total = item.total || item.totalEmployees;
          
          // For multi-day view, show daily averages
          let weeklyOff, onSiteRequirement, present, absent;
          
          if (daysInPeriod === 1) {
            // Single day: use daily values
            weeklyOff = item.singleDayWeeklyOff || item.weeklyOff;
            onSiteRequirement = item.singleDayOnSiteRequirement || (total - weeklyOff);
            present = item.singleDayActualPresent || (item.present - weeklyOff);
            absent = item.singleDayAbsent || item.absent;
          } else {
            // Multi-day: show daily averages
            weeklyOff = item.avgDailyWeeklyOff;
            onSiteRequirement = item.avgDailyOnSiteRequirement;
            present = item.avgDailyPresent;
            absent = item.avgDailyAbsent;
          }
          
          const rate = item.totalRequiredAttendance > 0 ? ((item.totalPresentAttendance / item.totalRequiredAttendance) * 100).toFixed(1) + '%' : '0.0%';
          
          return [
            `"${item.siteName || item.name}"`,
            `"${viewType === 'department' ? selectedDepartment : 'General'}"`,
            `"${item.date}"`,
            item.daysInPeriod,
            total,
            weeklyOff,
            onSiteRequirement,
            present,
            absent,
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
    navigate('/superadmin/dashboard');
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
                  ? `Showing cumulative attendance data for ${selectedDepartment} department across all sites`
                  : viewType === 'shortages'
                  ? 'Manage daily shortages with Excel-like interface'
                  : 'Showing cumulative attendance data for all sites'
                } - {viewType !== 'shortages' && `${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)} (${daysInPeriod} days)`}
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
                        Site View (Cumulative)
                      </div>
                    </SelectItem>
                    <SelectItem value="department">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Department View (Cumulative)
                      </div>
                    </SelectItem>
                    <SelectItem value="shortages">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Daily Shortages Management
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
          {/* Period Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="text-sm">
                  <h3 className="font-semibold mb-2 text-lg">Duration-Based Calculations ({daysInPeriod} days):</h3>
                  
                  {/* Duration Calculations Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-green-700">Total Required</div>
                      <div className="text-green-600 font-medium mt-2 text-2xl">
                        {overallTotals.durationTotalRequired.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = Total Employees × {daysInPeriod} days
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-purple-700">Weekly Off</div>
                      <div className="text-purple-600 font-medium mt-2 text-2xl">
                        {overallTotals.durationWeeklyOff.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = Total weekly off for {daysInPeriod} days
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-amber-700">On Site Requirement</div>
                      <div className="text-amber-600 font-medium mt-2 text-2xl">
                        {overallTotals.durationOnSiteRequirement.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = Total Required - Total Weekly Off
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-blue-700">Present</div>
                      <div className="text-blue-600 font-medium mt-2 text-2xl">
                        {overallTotals.durationPresent.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = Total present for {daysInPeriod} days
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-red-700">Absent</div>
                      <div className="text-red-600 font-medium mt-2 text-2xl">
                        {overallTotals.durationAbsent.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = Total absent for {daysInPeriod} days
                      </div>
                    </div>
                  </div>
                  
                  {/* Attendance Rate Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-green-700">Total Required Attendance</div>
                      <div className="text-green-600 font-medium mt-2 text-2xl">
                        {overallTotals.totalRequiredAttendance.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = {overallTotals.totalEmployees} employees × {daysInPeriod} days
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-blue-700">Total Present Attendance</div>
                      <div className="text-blue-600 font-medium mt-2 text-2xl">
                        {overallTotals.totalPresentAttendance.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = Sum of daily present counts
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="font-medium text-yellow-700">Attendance Rate</div>
                      <div className="text-yellow-600 font-medium mt-2 text-2xl">
                        {overallTotals.attendanceRate}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        = (Total Present ÷ Total Required) × 100
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-1">Calculation Rules for {daysInPeriod} days:</h4>
                    <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                      <li><strong>Total Required</strong> = Total Employees × Days in Period</li>
                      <li><strong>Weekly Off</strong> = Sum of daily weekly off counts for the period</li>
                      <li><strong>On Site Requirement</strong> = Total Required - Total Weekly Off</li>
                      <li><strong>Present</strong> = Sum of daily present counts (excluding weekly off) for the period</li>
                      <li><strong>Absent</strong> = Sum of daily absent counts for the period</li>
                      <li><strong>Attendance Rate</strong> = (Total Present Attendance ÷ Total Required Attendance) × 100</li>
                      <li><strong>Weekly off employees are counted in present attendance</strong></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Average Cards - Show what appears in the table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Required (Daily Avg)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {columnValues.avgTotalRequired}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average daily total employees
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Weekly Off (Daily Avg)</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {columnValues.avgWeeklyOff}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average daily weekly off
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">On Site Requirement (Daily Avg)</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {columnValues.avgOnSiteRequirement}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average daily on-site requirement
                    </p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Building className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Present (Daily Avg)</p>
                    <p className="text-2xl font-bold text-green-600">
                      {columnValues.avgPresent}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average daily actual present
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
                    <p className="text-sm font-medium text-red-800">Absent (Daily Avg)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {columnValues.avgAbsent}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average daily absent
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
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
                      ? `Showing ${daysInPeriod === 1 ? 'single day' : 'daily average'} data for ${selectedDepartment} department from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)} (${daysInPeriod} days)`
                      : `Showing ${daysInPeriod === 1 ? 'single day' : 'daily average'} data for all sites from ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)} (${daysInPeriod} days)`
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

          {/* Data Table - Original Columns with Duration Calculations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {viewType === 'department' 
                    ? `${selectedDepartment} Sites Attendance - ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)} (${daysInPeriod} days)`
                    : `All Sites Attendance - ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)} (${daysInPeriod} days)`
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
                          <th className="h-12 px-4 text-left align-middle font-medium text-blue-700 bg-blue-50">
                            Total Required
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-purple-700 bg-purple-50">
                            Weekly Off
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-amber-700 bg-amber-50">
                            On Site Requirement
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-green-700 bg-green-50">
                            Present
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-red-700 bg-red-50">
                            Absent/Shortage
                          </th>
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
                          
                          // For table display, show daily averages for multi-day, daily values for single day
                          let weeklyOff, onSiteRequirement, present, absent;
                          
                          if (daysInPeriod === 1) {
                            // Single day: show actual daily values
                            weeklyOff = item.singleDayWeeklyOff || item.weeklyOff;
                            onSiteRequirement = item.singleDayOnSiteRequirement || (total - weeklyOff);
                            present = item.singleDayActualPresent || (item.present - weeklyOff);
                            absent = item.singleDayAbsent || item.absent;
                          } else {
                            // Multi-day: show daily averages
                            weeklyOff = item.avgDailyWeeklyOff;
                            onSiteRequirement = item.avgDailyOnSiteRequirement;
                            present = item.avgDailyPresent;
                            absent = item.avgDailyAbsent;
                          }
                          
                          const rate = item.totalRequiredAttendance > 0 ? ((item.totalPresentAttendance / item.totalRequiredAttendance) * 100).toFixed(1) : '0.0';
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
                                <div className="text-xs text-muted-foreground">
                                  {item.daysInPeriod} {item.daysInPeriod === 1 ? 'day' : 'days'}
                                  {daysInPeriod > 1 && (
                                    <div className="text-blue-600 mt-1">
                                      Total for period: {item.durationPresent.toLocaleString()} present
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {viewType === 'department' ? selectedDepartment : primaryDepartment}
                                </Badge>
                              </td>
                              
                              {/* Total Required - Show daily average for multi-day */}
                              <td className="p-4 align-middle font-bold text-blue-700 bg-blue-50">
                                {total}
                                {daysInPeriod > 1 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    × {daysInPeriod} days = {item.durationTotalRequired.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              
                              {/* Weekly Off - Show daily average for multi-day */}
                              <td className="p-4 align-middle font-bold text-purple-700 bg-purple-50">
                                {weeklyOff}
                                {daysInPeriod > 1 && (
                                  <div className="text-xs text-purple-600 mt-1">
                                    Total: {item.durationWeeklyOff.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              
                              {/* On Site Requirement - Show daily average for multi-day */}
                              <td className="p-4 align-middle font-bold text-amber-700 bg-amber-50">
                                {onSiteRequirement}
                                {daysInPeriod > 1 && (
                                  <div className="text-xs text-amber-600 mt-1">
                                    Total: {item.durationOnSiteRequirement.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              
                              {/* Present - Show daily average for multi-day */}
                              <td className="p-4 align-middle font-bold text-green-700 bg-green-50">
                                {present}
                                {daysInPeriod > 1 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Total: {item.durationPresent.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              
                              {/* Absent/Shortage - Show daily average for multi-day */}
                              <td className="p-4 align-middle font-bold text-red-700 bg-red-50">
                                {absent}
                                {daysInPeriod > 1 && (
                                  <div className="text-xs text-red-600 mt-1">
                                    Total: {item.durationAbsent.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              
                              {/* Attendance Rate */}
                              <td className="p-4 align-middle font-bold">
                                {rate}%
                              </td>
                              
                              {/* Status */}
                              <td className="p-4 align-middle">
                                <Badge variant={
                                  status === 'Excellent' ? 'default' :
                                  status === 'Good' ? 'secondary' :
                                  status === 'Average' ? 'outline' : 'destructive'
                                }>
                                  {status}
                                </Badge>
                              </td>
                              
                              {/* Actions */}
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

export default SuperAdminAttendanceView;