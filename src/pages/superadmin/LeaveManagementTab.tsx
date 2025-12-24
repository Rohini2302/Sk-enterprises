// src/components/hrms/tabs/LeaveManagementTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Paperclip, Download, Eye } from "lucide-react";
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
  const [selectedFiles, setSelectedFiles] = useState<{ [key: number]: File[] }>({});

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, leaveId: number) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => ({
        ...prev,
        [leaveId]: [...(prev[leaveId] || []), ...newFiles]
      }));
      toast.success(`${newFiles.length} file(s) attached to leave application`);
    }
  };

  const handleRemoveFile = (leaveId: number, fileName: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [leaveId]: (prev[leaveId] || []).filter(file => file.name !== fileName)
    }));
    toast.success("File removed");
  };

  const handleDownloadFile = (file: File) => {
    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewFile = (file: File) => {
    // Create a temporary URL for the file and open in new tab
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    // Note: URL will be revoked when the tab is closed or after a timeout
    setTimeout(() => URL.revokeObjectURL(url), 60000); // Revoke after 1 minute
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                <TableHead>Attachments</TableHead>
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
                  <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                    {leave.reason}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {/* File Attachment Section */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id={`file-upload-${leave.id}`}
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileSelect(e, leave.id)}
                          className="hidden"
                        />
                        <label htmlFor={`file-upload-${leave.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <Paperclip className="mr-1 h-3 w-3" />
                            Attach Files
                          </Button>
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {selectedFiles[leave.id]?.length || 0} files
                        </span>
                      </div>

                      {/* Attached Files List */}
                      {selectedFiles[leave.id] && selectedFiles[leave.id].length > 0 && (
                        <div className="space-y-1 max-w-[200px]">
                          {selectedFiles[leave.id].map((file, index) => (
                            <div
                              key={`${leave.id}-${file.name}-${index}`}
                              className="flex items-center justify-between gap-2 p-1 bg-muted/50 rounded text-xs"
                            >
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                <span className="text-xs">{getFileIcon(file.name)}</span>
                                <span className="truncate flex-1" title={file.name}>
                                  {file.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleViewFile(file)}
                                  title="View file"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDownloadFile(file)}
                                  title="Download file"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive"
                                  onClick={() => handleRemoveFile(leave.id, file.name)}
                                  title="Remove file"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
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

      {/* File Upload Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            File Attachment Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Supported File Types:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• PDF documents (.pdf)</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• Excel files (.xls, .xlsx)</li>
                  <li>• Images (.jpg, .jpeg, .png, .gif)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Maximum file size: 10MB per file</li>
                  <li>• Use descriptive file names</li>
                  <li>• Attach relevant supporting documents</li>
                  <li>• Multiple files can be attached per request</li>
                </ul>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Attach medical certificates, travel tickets, or other supporting documents 
                to help process your leave application faster.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagementTab;