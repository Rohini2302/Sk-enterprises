import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { initialAlerts, Alert } from "../data";
import { Plus, Eye, Camera, X, Image as ImageIcon, Calendar, Clock } from "lucide-react";

const AlertsSection = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlertForEdit, setSelectedAlertForEdit] = useState<Alert | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [editPhotoFiles, setEditPhotoFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateStatus = (alertId: string, status: Alert["status"]) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
    toast.success("Alert status updated!");
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    // Split the date string into date and time for the edit form
    const [date = "", time = ""] = alert.date.split(' ');
    setSelectedAlertForEdit({
      ...alert,
      date,
      time
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - photoFiles.length); // Max 5 photos
      setPhotoFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - editPhotoFiles.length); // Max 5 photos
      setEditPhotoFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEditPhoto = (index: number) => {
    setEditPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Convert photo files to base64 strings (in real app, you'd upload to server)
    const photoPromises = photoFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(photoUrls => {
      const date = formData.get("date") as string;
      const time = formData.get("time") as string;
      
      const newAlert: Alert = {
        id: Date.now().toString(),
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        severity: formData.get("severity") as Alert["severity"],
        status: "open" as const,
        date: `${date} ${time}`,
        reportedBy: formData.get("reportedBy") as string,
        site: formData.get("site") as string,
        photos: photoUrls,
        assignedTo: formData.get("assignedTo") as string,
      };

      setAlerts(prev => [newAlert, ...prev]);
      toast.success("Alert created successfully!");
      setDialogOpen(false);
      setPhotoFiles([]);
      (e.target as HTMLFormElement).reset();
    });
  };

  const handleUpdateAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAlertForEdit) return;

    const formData = new FormData(e.currentTarget);

    // Convert new photo files to base64 strings
    const newPhotoPromises = editPhotoFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotoPromises).then(newPhotoUrls => {
      const date = formData.get("editDate") as string;
      const time = formData.get("editTime") as string;
      
      const updatedAlert: Alert = {
        id: selectedAlertForEdit.id,
        title: formData.get("editTitle") as string,
        description: formData.get("editDescription") as string,
        severity: formData.get("editSeverity") as Alert["severity"],
        status: formData.get("editStatus") as Alert["status"],
        date: `${date} ${time}`,
        reportedBy: formData.get("editReportedBy") as string,
        site: formData.get("editSite") as string,
        photos: [...(selectedAlertForEdit.photos || []), ...newPhotoUrls],
        assignedTo: formData.get("editAssignedTo") as string,
      };

      setAlerts(prev => prev.map(alert => 
        alert.id === selectedAlertForEdit.id ? updatedAlert : alert
      ));
      
      toast.success("Alert updated successfully!");
      setSelectedAlert(null);
      setSelectedAlertForEdit(null);
      setEditPhotoFiles([]);
    });
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    const colors = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive"
    };
    return colors[severity];
  };

  const formatDateTime = (dateTimeString: string) => {
    const [date, time] = dateTimeString.split(' ');
    return (
      <div>
        <div>{date}</div>
        <div className="text-sm text-muted-foreground">{time}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Alerts & Issues</CardTitle>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAddAlert} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Alert Title *</Label>
                      <Input id="title" name="title" placeholder="Enter alert title" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity *</Label>
                      <select
                        id="severity"
                        name="severity"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select severity</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site">Site *</Label>
                      <Input id="site" name="site" placeholder="Enter site name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportedBy">Reported By *</Label>
                      <Input id="reportedBy" name="reportedBy" placeholder="Enter reporter name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input id="assignedTo" name="assignedTo" placeholder="Assign to staff" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input id="time" name="time" type="time" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Describe the issue in detail..."
                      rows={4}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Photos (Max 5)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Click to upload photos
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Supports JPG, PNG up to 5MB each
                      </p>
                    </div>

                    {photoFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Uploaded Photos:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {photoFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square border rounded-md overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemovePhoto(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <p className="text-xs truncate mt-1">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full">Create Alert</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => toast.success("Navigating to detailed alerts page...")}>
              View All Alerts
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{alert.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.site} • {alert.reportedBy}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(alert.severity) as "default" | "destructive" | "outline" | "secondary"}>
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={alert.status === "resolved" ? "default" : "secondary"}>
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(alert.date)}</TableCell>
                  <TableCell>
                    {alert.photos && alert.photos.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm">{alert.photos.length} photo(s)</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No photos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewAlert(alert)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Alert Details</DialogTitle>
                          </DialogHeader>
                          {selectedAlertForEdit && (
                            <form onSubmit={handleUpdateAlert} className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Basic Info */}
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="editTitle">Alert Title *</Label>
                                    <Input 
                                      id="editTitle" 
                                      name="editTitle" 
                                      defaultValue={selectedAlertForEdit.title}
                                      required 
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="editDescription">Description *</Label>
                                    <Textarea 
                                      id="editDescription" 
                                      name="editDescription" 
                                      defaultValue={selectedAlertForEdit.description}
                                      rows={5}
                                      required 
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editSeverity">Severity *</Label>
                                      <select
                                        id="editSeverity"
                                        name="editSeverity"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={selectedAlertForEdit.severity}
                                        required
                                      >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                      </select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editStatus">Status *</Label>
                                      <select
                                        id="editStatus"
                                        name="editStatus"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={selectedAlertForEdit.status}
                                        required
                                      >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column - Additional Info & Photos */}
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editSite">Site *</Label>
                                      <Input 
                                        id="editSite" 
                                        name="editSite" 
                                        defaultValue={selectedAlertForEdit.site}
                                        required 
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="editReportedBy">Reported By *</Label>
                                      <Input 
                                        id="editReportedBy" 
                                        name="editReportedBy" 
                                        defaultValue={selectedAlertForEdit.reportedBy}
                                        required 
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editAssignedTo">Assigned To</Label>
                                      <Input 
                                        id="editAssignedTo" 
                                        name="editAssignedTo" 
                                        defaultValue={selectedAlertForEdit.assignedTo || ""}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-2">
                                        <Label htmlFor="editDate">Date *</Label>
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <Input 
                                            id="editDate" 
                                            name="editDate" 
                                            type="date"
                                            defaultValue={selectedAlertForEdit.date}
                                            required 
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="editTime">Time *</Label>
                                        <div className="flex items-center">
                                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <Input 
                                            id="editTime" 
                                            name="editTime" 
                                            type="time"
                                            defaultValue={selectedAlertForEdit.time}
                                            required 
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Add More Photos Section */}
                                  <div className="space-y-2">
                                    <Label>Add More Photos (Max 5 total)</Label>
                                    <div className="border-2 border-dashed rounded-lg p-3 text-center">
                                      <Input
                                        type="file"
                                        ref={editFileInputRef}
                                        onChange={handleEditPhotoUpload}
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => editFileInputRef.current?.click()}
                                        className="w-full"
                                      >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Add more photos
                                      </Button>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Supports JPG, PNG up to 5MB each
                                      </p>
                                    </div>

                                    {editPhotoFiles.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-sm font-medium mb-2">New Photos to Upload:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                          {editPhotoFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                              <div className="aspect-square border rounded-md overflow-hidden">
                                                <img
                                                  src={URL.createObjectURL(file)}
                                                  alt={`New upload ${index + 1}`}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                              <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveEditPhoto(index)}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                              <p className="text-xs truncate mt-1">{file.name}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Existing Photos */}
                                    {selectedAlertForEdit.photos && selectedAlertForEdit.photos.length > 0 && (
                                      <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">Existing Photos:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                          {selectedAlertForEdit.photos.map((photo, index) => (
                                            <div key={index} className="border rounded-md overflow-hidden">
                                              <img
                                                src={photo}
                                                alt={`Existing photo ${index + 1}`}
                                                className="w-full h-24 object-cover"
                                              />
                                              <div className="p-1 text-xs text-center truncate">
                                                Photo {index + 1}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-4 border-t">
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedAlert(null);
                                    setSelectedAlertForEdit(null);
                                    setEditPhotoFiles([]);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  className="flex-1"
                                >
                                  Update Alert
                                </Button>
                              </div>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {alert.status !== "open" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(alert.id, "open")}
                        >
                          Reopen
                        </Button>
                      )}
                      {alert.status !== "in-progress" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(alert.id, "in-progress")}
                        >
                          In Progress
                        </Button>
                      )}
                      {alert.status !== "resolved" && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleUpdateStatus(alert.id, "resolved")}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsSection;