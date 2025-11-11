// src/components/hrms/tabs/LeaveManagementTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { LeaveRequest } from "./types";
import StatCard from "./StatCard";
import Pagination from "./Pagination";

interface LeaveManagementTabProps {
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
}

const LeaveManagementTab = ({ leaveRequests, setLeaveRequests }: LeaveManagementTabProps) => {
  const [leaveRequestsPage, setLeaveRequestsPage] = useState(1);
  const [leaveRequestsItemsPerPage, setLeaveRequestsItemsPerPage] = useState(5);

  const paginatedLeaveRequests = leaveRequests.slice(
    (leaveRequestsPage - 1) * leaveRequestsItemsPerPage,
    leaveRequestsPage * leaveRequestsItemsPerPage
  );

  const handleLeaveAction = (id: number, action: "approved" | "rejected") => {
    setLeaveRequests(leaveRequests.map(leave => 
      leave.id === id ? { ...leave, status: action } : leave
    ));
    toast.success(`Leave request ${action}!`);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Requests" value={leaveRequests.length} />
        <StatCard 
          title="Pending" 
          value={leaveRequests.filter(l => l.status === "pending").length} 
          className="text-muted-foreground" 
        />
        <StatCard 
          title="Approved" 
          value={leaveRequests.filter(l => l.status === "approved").length} 
          className="text-primary" 
        />
        <StatCard 
          title="Rejected" 
          value={leaveRequests.filter(l => l.status === "rejected").length} 
          className="text-destructive" 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeaveRequests.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.employee}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{leave.type}</Badge>
                  </TableCell>
                  <TableCell>{leave.from}</TableCell>
                  <TableCell>{leave.to}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(leave.status)}>
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {leave.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleLeaveAction(leave.id, "approved")}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleLeaveAction(leave.id, "rejected")}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {leaveRequests.length > 0 && (
            <Pagination
              currentPage={leaveRequestsPage}
              totalPages={Math.ceil(leaveRequests.length / leaveRequestsItemsPerPage)}
              totalItems={leaveRequests.length}
              itemsPerPage={leaveRequestsItemsPerPage}
              onPageChange={setLeaveRequestsPage}
              onItemsPerPageChange={setLeaveRequestsItemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagementTab;