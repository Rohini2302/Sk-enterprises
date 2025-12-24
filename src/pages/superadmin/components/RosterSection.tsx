import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Calendar, Download, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addWeeks, subWeeks, startOfWeek as weekStart, endOfWeek as weekEnd, addDays, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { initialRoster, initialSites, staffMembers, supervisors, rosterTypes, RosterEntry } from "../data";
import { FormField } from "./shared";
import { cn } from "@/lib/utils";

const RosterSection = () => {
  const [selectedRoster, setSelectedRoster] = useState<"daily" | "weekly" | "fortnightly" | "monthly">("daily");
  const [roster, setRoster] = useState<RosterEntry[]>(initialRoster);
  const [addEntryDialogOpen, setAddEntryDialogOpen] = useState(false);
  
  // Date states for different roster types
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Calculate date ranges based on roster type
  const getDateRange = () => {
    switch (selectedRoster) {
      case "daily":
        return {
          start: selectedDate,
          end: selectedDate,
          label: format(selectedDate, "dd MMMM yyyy")
        };
      case "weekly":
        const weekStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
        const weekEndDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return {
          start: weekStartDate,
          end: weekEndDate,
          label: `${format(weekStartDate, "dd MMM")} - ${format(weekEndDate, "dd MMM yyyy")}`
        };
      case "fortnightly":
        const fortnightStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const fortnightEnd = addDays(fortnightStart, 13); // 14 days total
        return {
          start: fortnightStart,
          end: fortnightEnd,
          label: `${format(fortnightStart, "dd MMM")} - ${format(fortnightEnd, "dd MMM yyyy")}`
        };
      case "monthly":
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return {
          start: monthStart,
          end: monthEnd,
          label: format(selectedDate, "MMMM yyyy")
        };
      default:
        return {
          start: selectedDate,
          end: selectedDate,
          label: format(selectedDate, "dd MMMM yyyy")
        };
    }
  };

  const dateRange = getDateRange();

  // Get days for calendar view
  const getDaysInRange = () => {
    if (selectedRoster === "monthly") {
      const start = startOfMonth(dateRange.start);
      const end = endOfMonth(dateRange.start);
      return eachDayOfInterval({ start, end });
    } else if (selectedRoster === "weekly") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (selectedRoster === "fortnightly") {
      const start = dateRange.start;
      const end = dateRange.end;
      return eachDayOfInterval({ start, end });
    } else {
      return [selectedDate];
    }
  };

  const handleAddRosterEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedStaff = staffMembers.find(s => s.id === formData.get("employee"));
    
    const newRoster: RosterEntry = {
      id: Date.now().toString(),
      date: formData.get("date") as string,
      employeeName: selectedStaff?.name || "",
      employeeId: selectedStaff?.employeeId || "",
      department: selectedStaff?.department || "",
      designation: selectedStaff?.role || "",
      shift: formData.get("shift") as string,
      shiftTiming: formData.get("shiftTiming") as string,
      assignedTask: formData.get("assignedTask") as string,
      hours: Number(formData.get("hours")),
      remark: formData.get("remark") as string,
      type: selectedRoster as "daily" | "weekly" | "fortnightly" | "monthly",
      siteClient: formData.get("siteClient") as string,
      supervisor: formData.get("supervisor") as string
    };

    setRoster(prev => [newRoster, ...prev]);
    toast.success("Roster entry added successfully!");
    setAddEntryDialogOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteRoster = (rosterId: string) => {
    setRoster(prev => prev.filter(entry => entry.id !== rosterId));
    toast.success("Roster entry deleted!");
  };

  // Filter roster by date range
  const filteredRoster = roster.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= dateRange.start && entryDate <= dateRange.end;
  });

  const handleExportReport = () => {
    toast.success(`Exporting ${selectedRoster} roster report for ${dateRange.label}...`);
  };

  const navigateDate = (direction: "prev" | "next") => {
    switch (selectedRoster) {
      case "daily":
        setSelectedDate(prev => addDays(prev, direction === "next" ? 1 : -1));
        break;
      case "weekly":
        setSelectedDate(prev => addWeeks(prev, direction === "next" ? 1 : -1));
        break;
      case "fortnightly":
        setSelectedDate(prev => addDays(prev, direction === "next" ? 14 : -14));
        break;
      case "monthly":
        setSelectedDate(prev => addMonths(prev, direction === "next" ? 1 : -1));
        break;
    }
  };

  // Group roster by date for calendar view
  const groupedRoster = filteredRoster.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, RosterEntry[]>);

  // Daily Roster Table Component
  const DailyRosterTable = ({ roster, onDelete }: { roster: RosterEntry[], onDelete: (id: string) => void }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sr. No.</TableHead>
          <TableHead>Employee Name</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Shift Timing</TableHead>
          <TableHead>Assigned Task</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Remarks</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roster.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8" />
                <div>No roster entries found for selected period</div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          roster.map((entry, index) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{entry.employeeName}</TableCell>
              <TableCell>{entry.employeeId}</TableCell>
              <TableCell>{entry.department}</TableCell>
              <TableCell>{entry.designation}</TableCell>
              <TableCell>{entry.shiftTiming}</TableCell>
              <TableCell>{entry.assignedTask}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {entry.hours}h
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={entry.remark}>
                {entry.remark}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toast.info("Edit functionality coming soon")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  // Calendar View for Monthly Roster
  const MonthlyCalendarView = () => {
    const days = getDaysInRange();
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);
    
    // Get all days in month
    const monthDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Get days before month start to fill first week
    const firstDayOfMonth = startOfWeek(startDate, { weekStartsOn: 1 });
    
    const allDays = eachDayOfInterval({ 
      start: firstDayOfMonth, 
      end: endDate 
    }).filter(day => day <= endDate || isSameMonth(day, startDate));

    const totalHoursByDate = filteredRoster.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += entry.hours;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
            <div key={day} className="py-2 bg-muted rounded-t">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayEntries = groupedRoster[dateStr] || [];
            const totalHours = totalHoursByDate[dateStr] || 0;
            const isCurrentMonth = isSameMonth(day, startDate);
            
            return (
              <div
                key={index}
                className={cn(
                  "min-h-32 border rounded p-2 text-sm transition-colors",
                  isCurrentMonth ? "bg-background" : "bg-muted/50",
                  isSameDay(day, new Date()) && "border-primary border-2"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={cn(
                    "font-semibold",
                    !isCurrentMonth && "text-muted-foreground",
                    isSameDay(day, new Date()) && "text-primary"
                  )}>
                    {format(day, "d")}
                  </span>
                  {totalHours > 0 && (
                    <Badge variant="secondary" className="h-5">
                      {totalHours}h
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {dayEntries.slice(0, 3).map(entry => (
                    <div key={entry.id} className="text-xs p-1 bg-secondary rounded truncate">
                      {entry.employeeName.split(' ')[0]}: {entry.shift}
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEntries.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Roster Management
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Roster Type Selection */}
          <div className="flex flex-wrap gap-4 mb-6">
            {rosterTypes.map((type) => (
              <Button
                key={type}
                variant={selectedRoster === type ? "default" : "outline"}
                onClick={() => setSelectedRoster(type)}
                className="capitalize"
              >
                {type} Roster
              </Button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.label}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="font-semibold">
                        {format(selectedDate, "MMMM yyyy")}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <div key={i} className="text-center text-xs font-medium">
                          {day}
                        </div>
                      ))}
                      {eachDayOfInterval({
                        start: startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 }),
                        end: endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 })
                      }).map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, selectedDate);
                        const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                        
                        return (
                          <Button
                            key={i}
                            variant={isSelected ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-8 w-8 p-0",
                              !isCurrentMonth && "text-muted-foreground opacity-50"
                            )}
                            onClick={() => setSelectedDate(day)}
                          >
                            {format(day, "d")}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedRoster === "daily" && "Daily View"}
              {selectedRoster === "weekly" && "Weekly View"}
              {selectedRoster === "fortnightly" && "15 Days View"}
              {selectedRoster === "monthly" && "Monthly View"}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredRoster.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {filteredRoster.reduce((sum, entry) => sum + entry.hours, 0)}h
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(filteredRoster.map(entry => entry.employeeId)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Dialog open={addEntryDialogOpen} onOpenChange={setAddEntryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Roster Entry - {selectedRoster.toUpperCase()} ROSTER</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRosterEntry} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Date" id="date" required>
                      <Input 
                        id="date" 
                        name="date" 
                        type="date" 
                        defaultValue={format(selectedDate, "yyyy-MM-dd")}
                        required 
                      />
                    </FormField>
                    <FormField label="Site / Client" id="siteClient" required>
                      <Select name="siteClient" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select site/client" />
                        </SelectTrigger>
                        <SelectContent>
                          {initialSites.map(site => (
                            <SelectItem key={site.id} value={`${site.name} - ${site.clientName}`}>
                              {site.name} - {site.clientName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Supervisor" id="supervisor" required>
                      <Select name="supervisor" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map(sup => (
                            <SelectItem key={sup.id} value={sup.name}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Employee" id="employee" required>
                      <Select name="employee" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map(staff => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name} - {staff.role} ({staff.employeeId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Department" id="department" required>
                      <Select name="department" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Designation" id="designation" required>
                      <Input 
                        id="designation" 
                        name="designation" 
                        placeholder="Enter designation"
                        required 
                      />
                    </FormField>
                    <FormField label="Shift" id="shift" required>
                      <Select name="shift" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning Shift</SelectItem>
                          <SelectItem value="Evening">Evening Shift</SelectItem>
                          <SelectItem value="Night">Night Shift</SelectItem>
                          <SelectItem value="General">General Shift</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Shift Timing" id="shiftTiming" required>
                      <Input 
                        id="shiftTiming" 
                        name="shiftTiming" 
                        placeholder="e.g., 09:00-17:00" 
                        required 
                      />
                    </FormField>
                    <FormField label="Assigned Task" id="assignedTask" required>
                      <Input 
                        id="assignedTask" 
                        name="assignedTask" 
                        placeholder="Enter assigned task" 
                        required 
                      />
                    </FormField>
                    <FormField label="Hours" id="hours" required>
                      <Input 
                        id="hours" 
                        name="hours" 
                        type="number" 
                        placeholder="Enter hours" 
                        min="0"
                        max="24"
                        step="0.5"
                        required 
                      />
                    </FormField>
                  </div>
                  <FormField label="Remark" id="remark">
                    <Textarea id="remark" name="remark" placeholder="Enter any remarks or notes" />
                  </FormField>
                  <Button type="submit" className="w-full">Add Entry</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Roster Display */}
          {selectedRoster === "monthly" ? (
            <MonthlyCalendarView />
          ) : (
            <DailyRosterTable roster={filteredRoster} onDelete={handleDeleteRoster} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RosterSection;