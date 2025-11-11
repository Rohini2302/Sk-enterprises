// src/components/hrms/tabs/ShiftRosterTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Shift, Employee } from "./types";
import FormField from "./FormField";

interface ShiftRosterTabProps {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  employees: Employee[];
}

const ShiftRosterTab = ({ shifts, setShifts, employees }: ShiftRosterTabProps) => {
  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "06:00",
    endTime: "14:00",
    employees: [] as string[]
  });

  const handleAddShift = () => {
    if (!newShift.name) {
      toast.error("Please enter shift name");
      return;
    }

    const shift: Shift = {
      id: shifts.length + 1,
      name: newShift.name,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      employees: newShift.employees
    };

    setShifts([...shifts, shift]);
    setNewShift({ name: "", startTime: "06:00", endTime: "14:00", employees: [] });
    toast.success("Shift created successfully!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shift & Roster Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Shift</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftName">Shift Name</Label>
                  <Input 
                    id="shiftName" 
                    placeholder="Morning Shift" 
                    value={newShift.name}
                    onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="time" 
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="time" 
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign Employees</Label>
                  <Select 
                    onValueChange={(value) => setNewShift({
                      ...newShift, 
                      employees: [...newShift.employees, value]
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employees" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.employeeId}>
                          {emp.name} ({emp.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newShift.employees.length > 0 && (
                    <div className="space-y-2">
                      <Label>Assigned Employees:</Label>
                      {newShift.employees.map(empId => {
                        const emp = employees.find(e => e.employeeId === empId);
                        return (
                          <div key={empId} className="flex justify-between items-center p-2 border rounded">
                            <span>{emp?.name}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setNewShift({
                                ...newShift,
                                employees: newShift.employees.filter(id => id !== empId)
                              })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Button onClick={handleAddShift}>
                  Create Shift
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Shifts</h3>
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{shift.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {shift.employees.length} employees assigned
                      </div>
                    </div>
                    <Badge>{shift.employees.length} employees</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftRosterTab;