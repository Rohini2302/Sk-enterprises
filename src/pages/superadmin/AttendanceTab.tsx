// src/components/hrms/tabs/AttendanceTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Attendance } from "./types";
import StatCard from "./StatCard";
import Pagination from "./Pagination";

interface AttendanceTabProps {
  attendance: Attendance[];
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

const AttendanceTab = ({ attendance }: AttendanceTabProps) => {
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceItemsPerPage, setAttendanceItemsPerPage] = useState(5);

  const attendanceSummary = {
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
    late: attendance.filter(a => a.status === "late").length,
    halfDay: attendance.filter(a => a.status === "half-day").length,
    total: attendance.length
  };

  const paginatedAttendance = attendance.slice(
    (attendancePage - 1) * attendanceItemsPerPage,
    attendancePage * attendanceItemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "present": return "default";
      case "absent": return "destructive";
      case "late": return "secondary";
      case "half-day": return "outline";
      default: return "outline";
    }
  };

  const handleExportAttendance = () => {
    // Implementation for export
    console.log("Exporting attendance data...");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        <Button variant="outline" onClick={handleExportAttendance}>
          <Download className="mr-2 h-4 w-4" />
          Export Attendance
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Present Today" value={attendanceSummary.present} className="text-primary" />
        <StatCard title="Absent Today" value={attendanceSummary.absent} className="text-destructive" />
        <StatCard title="Late Today" value={attendanceSummary.late} className="text-secondary" />
        <StatCard title="Half Day" value={attendanceSummary.halfDay} className="text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {attendance.length > 0 && (
            <Pagination
              currentPage={attendancePage}
              totalPages={Math.ceil(attendance.length / attendanceItemsPerPage)}
              totalItems={attendance.length}
              itemsPerPage={attendanceItemsPerPage}
              onPageChange={setAttendancePage}
              onItemsPerPageChange={setAttendanceItemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTab;