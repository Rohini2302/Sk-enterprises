import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { initialAlerts, Alert } from "../data";

const AlertsSection = () => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleUpdateStatus = (alertId: string, status: Alert["status"]) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
    toast.success("Alert status updated!");
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Alerts & Issues</CardTitle>
          <Button onClick={() => toast.success("Navigating to detailed alerts page...")}>
            View All Alerts
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.title}</TableCell>
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
                  <TableCell>{alert.date}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
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