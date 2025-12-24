import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { serviceTypes, Service } from "../data";

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>(serviceTypes);

  const handleUpdateStatus = (serviceId: string, status: Service["status"]) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { 
        ...service, 
        status,
        lastChecked: new Date().toISOString().split('T')[0]
      } : service
    ));
    toast.success(`Service status updated to ${status}`);
  };

  const getStatusColor = (status: Service["status"]) => {
    const colors = {
      operational: "default",
      maintenance: "secondary",
      down: "destructive"
    };
    return colors[status];
  };

  const getStatusIcon = (status: Service["status"]) => {
    const icons = {
      operational: <CheckCircle className="h-4 w-4" />,
      maintenance: <Clock className="h-4 w-4" />,
      down: <XCircle className="h-4 w-4" />
    };
    return icons[status];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {service.name}
                    {getStatusIcon(service.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant={getStatusColor(service.status) as "default" | "destructive" | "outline" | "secondary"}>
                    {service.status}
                  </Badge>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Team: {service.assignedTeam}</p>
                    <p className="text-muted-foreground">Last checked: {service.lastChecked}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant={service.status === "operational" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(service.id, "operational")}
                    >
                      Operational
                    </Button>
                    <Button 
                      size="sm" 
                      variant={service.status === "maintenance" ? "secondary" : "outline"}
                      onClick={() => handleUpdateStatus(service.id, "maintenance")}
                    >
                      Maintenance
                    </Button>
                    <Button 
                      size="sm" 
                      variant={service.status === "down" ? "destructive" : "outline"}
                      onClick={() => handleUpdateStatus(service.id, "down")}
                    >
                      Down
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesSection;