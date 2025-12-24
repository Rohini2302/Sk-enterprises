import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Eye, 
  Trash2, 
  Edit, 
  Building, 
  User, 
  Phone, 
  MapPin, 
  Users,
  Shield,
  FileText,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { initialSites, Site } from "../data";
import { FormField } from "./shared";

// Mock current logged-in manager
const currentManager = {
  id: "manager-a",
  name: "Manager A",
  role: "manager",
  assignedSiteIds: ["1", "2", "3"] // Sites assigned to this manager
};

const ServicesList = [
  "Housekeeping",
  "Security",
  "Parking",
  "Waste Management",
  "STP Tank Cleaning",
  "Maintenance"
];

const StaffRoles = [
  "Manager",
  "Supervisor",
  "Housekeeping Staff",
  "Security Guard",
  "Parking Attendant",
  "Waste Collector",
  "STP Operator",
  "Maintenance Staff"
];

const SitesSection = () => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [staffDeployment, setStaffDeployment] = useState<
    Array<{ role: string; count: number }>
  >([]);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  // Filter sites to show only those assigned to current manager
  const assignedSites = sites.filter(site => 
    currentManager.assignedSiteIds.includes(site.id)
  );

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const updateStaffCount = (role: string, count: number) => {
    setStaffDeployment(prev => {
      const existing = prev.find(item => item.role === role);
      if (existing) {
        return prev.map(item =>
          item.role === role ? { ...item, count: Math.max(0, count) } : item
        );
      }
      return [...prev, { role, count }];
    });
  };

  const resetForm = () => {
    setSelectedServices([]);
    setStaffDeployment([]);
    setEditMode(false);
    setEditingSiteId(null);
  };

  const handleEditSite = (site: Site) => {
    // Check if site is assigned to current manager
    if (!currentManager.assignedSiteIds.includes(site.id)) {
      toast.error("You can only edit sites assigned to you");
      return;
    }

    setEditMode(true);
    setEditingSiteId(site.id);
    setSelectedServices(site.services || []);
    setStaffDeployment(site.staffDeployment || []);
    
    // Set form values for editing
    setTimeout(() => {
      const form = document.getElementById('site-form') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('site-name') as HTMLInputElement).value = site.name;
        (form.elements.namedItem('client-name') as HTMLInputElement).value = site.clientName;
        (form.elements.namedItem('location') as HTMLInputElement).value = site.location;
        (form.elements.namedItem('area-sqft') as HTMLInputElement).value = site.areaSqft.toString();
        (form.elements.namedItem('site-manager') as HTMLInputElement).value = site.siteManager;
        (form.elements.namedItem('manager-phone') as HTMLInputElement).value = site.managerPhone;
        (form.elements.namedItem('supervisor') as HTMLInputElement).value = site.supervisor;
        (form.elements.namedItem('supervisor-phone') as HTMLInputElement).value = site.supervisorPhone;
        (form.elements.namedItem('contract-value') as HTMLInputElement).value = site.contractValue.toString();
        (form.elements.namedItem('contract-end-date') as HTMLInputElement).value = site.contractEndDate;
      }
    }, 0);
    
    setDialogOpen(true);
  };

  const handleAddOrUpdateSite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const siteData = {
      name: formData.get("site-name") as string,
      clientName: formData.get("client-name") as string,
      location: formData.get("location") as string,
      areaSqft: Number(formData.get("area-sqft")),
      siteManager: formData.get("site-manager") as string,
      managerPhone: formData.get("manager-phone") as string,
      supervisor: formData.get("supervisor") as string,
      supervisorPhone: formData.get("supervisor-phone") as string,
      contractValue: Number(formData.get("contract-value")),
      contractEndDate: formData.get("contract-end-date") as string,
      services: selectedServices,
      staffDeployment: staffDeployment.filter(item => item.count > 0),
      status: "active" as const
    };

    if (editMode && editingSiteId) {
      // Check if site is assigned to current manager
      if (!currentManager.assignedSiteIds.includes(editingSiteId)) {
        toast.error("You can only update sites assigned to you");
        return;
      }

      // Update existing site
      setSites(prev =>
        prev.map(site =>
          site.id === editingSiteId
            ? { ...site, ...siteData }
            : site
        )
      );
      toast.success("Site updated successfully!");
    } else {
      // Add new site (auto-assign to current manager)
      const newSite: Site = {
        ...siteData,
        id: Date.now().toString()
      };
      setSites(prev => [newSite, ...prev]);
      
      // Add to manager's assigned sites
      currentManager.assignedSiteIds.push(newSite.id);
      
      toast.success("Site added successfully!");
    }

    setDialogOpen(false);
    resetForm();
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteSite = (siteId: string) => {
    // Check if site is assigned to current manager
    if (!currentManager.assignedSiteIds.includes(siteId)) {
      toast.error("You can only delete sites assigned to you");
      return;
    }

    setSites(prev => prev.filter(site => site.id !== siteId));
    // Remove from manager's assigned sites
    const index = currentManager.assignedSiteIds.indexOf(siteId);
    if (index > -1) {
      currentManager.assignedSiteIds.splice(index, 1);
    }
    toast.success("Site deleted successfully!");
  };

  const handleToggleStatus = (siteId: string) => {
    // Check if site is assigned to current manager
    if (!currentManager.assignedSiteIds.includes(siteId)) {
      toast.error("You can only update status of sites assigned to you");
      return;
    }

    setSites(prev =>
      prev.map(site =>
        site.id === siteId
          ? { ...site, status: site.status === "active" ? "inactive" : "active" }
          : site
      )
    );
    toast.success("Site status updated!");
  };

  const getTotalStaff = (site: Site) => {
    return site.staffDeployment?.reduce((total, item) => total + item.count, 0) || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setDialogOpen(open);
  };

  // Calculate statistics for dashboard
  const totalStaffCount = assignedSites.reduce((total, site) => 
    total + (getTotalStaff(site)), 0
  );
  
  const totalContractValue = assignedSites.reduce((total, site) => 
    total + site.contractValue, 0
  );
  
  const totalArea = assignedSites.reduce((total, site) => 
    total + site.areaSqft, 0
  );

  return (
    <div className="space-y-6">
      {/* Manager Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Site Management</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium text-blue-600">{currentManager.name}</span>
                </p>
                <Badge variant="outline" className="ml-2">
                  Manager
                </Badge>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Site
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editMode ? "Edit Site" : "Add New Site"}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {editMode ? "Update site details" : "Add a new site to your management"}
                  </p>
                </DialogHeader>

                <form id="site-form" onSubmit={handleAddOrUpdateSite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Site Name" id="site-name" required>
                      <Input id="site-name" name="site-name" placeholder="Enter site name" required />
                    </FormField>
                    <FormField label="Client Name" id="client-name" required>
                      <Input id="client-name" name="client-name" placeholder="Enter client name" required />
                    </FormField>
                    <FormField label="Location" id="location" required>
                      <Input id="location" name="location" placeholder="Enter location" required />
                    </FormField>
                    <FormField label="Area (sqft)" id="area-sqft" required>
                      <Input 
                        id="area-sqft" 
                        name="area-sqft" 
                        type="number" 
                        placeholder="Enter area in sqft" 
                        required 
                      />
                    </FormField>
                    <FormField label="Site Manager" id="site-manager" required>
                      <Input 
                        id="site-manager" 
                        name="site-manager" 
                        placeholder="Enter site manager name" 
                        required 
                      />
                    </FormField>
                    <FormField label="Manager Phone" id="manager-phone" required>
                      <Input 
                        id="manager-phone" 
                        name="manager-phone" 
                        placeholder="Enter manager phone" 
                        required 
                      />
                    </FormField>
                    <FormField label="Supervisor" id="supervisor" required>
                      <Input 
                        id="supervisor" 
                        name="supervisor" 
                        placeholder="Enter supervisor name" 
                        required 
                      />
                    </FormField>
                    <FormField label="Supervisor Phone" id="supervisor-phone" required>
                      <Input 
                        id="supervisor-phone" 
                        name="supervisor-phone" 
                        placeholder="Enter supervisor phone" 
                        required 
                      />
                    </FormField>
                    <FormField label="Contract Value (₹)" id="contract-value" required>
                      <Input 
                        id="contract-value" 
                        name="contract-value" 
                        type="number" 
                        placeholder="Enter contract value" 
                        required 
                      />
                    </FormField>
                    <FormField label="Contract End Date" id="contract-end-date" required>
                      <Input 
                        id="contract-end-date" 
                        name="contract-end-date" 
                        type="date" 
                        required 
                      />
                    </FormField>
                  </div>

                  <div className="border p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <p className="font-medium">Services for this Site</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ServicesList.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service}`}
                            checked={selectedServices.includes(service)}
                            onCheckedChange={() => toggleService(service)}
                          />
                          <label htmlFor={`service-${service}`} className="cursor-pointer text-sm">
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-green-600" />
                      <p className="font-medium">Staff Deployment</p>
                    </div>
                    <div className="space-y-3">
                      {StaffRoles.map((role) => {
                        const deployment = staffDeployment.find(item => item.role === role);
                        const count = deployment?.count || 0;
                        return (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-sm">{role}</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateStaffCount(role, count - 1)}
                                disabled={count <= 0}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={count}
                                onChange={(e) => updateStaffCount(role, parseInt(e.target.value) || 0)}
                                className="w-20 text-center"
                                min="0"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateStaffCount(role, count + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">Manager Information</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Manager:</span>
                        <span className="font-medium">{currentManager.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Assigned Sites:</span>
                        <span className="font-medium">{assignedSites.length} sites</span>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    {editMode ? "Update Site" : "Add Site"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Assigned Sites</p>
                      <p className="text-2xl font-bold text-blue-900">{assignedSites.length}</p>
                    </div>
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Total sites under your management
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Total Staff</p>
                      <p className="text-2xl font-bold text-green-900">{totalStaffCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Staff across all your sites
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Total Contract Value</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(totalContractValue)}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    Combined contract value
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Total Area</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {(totalArea / 1000).toFixed(1)}K sqft
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="mt-2 text-xs text-amber-600">
                    Combined area of all sites
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sites Table */}
            {assignedSites.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Sites Assigned</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't been assigned any sites yet. Add your first site to get started.
                  </p>
                  <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Site
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Details</TableHead>
                    <TableHead>Client Information</TableHead>
                    <TableHead>Location & Area</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{site.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            Manager: {site.siteManager}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {site.managerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{site.clientName}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            Sup: {site.supervisor}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {site.supervisorPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{site.location}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {site.areaSqft.toLocaleString()} sqft
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {site.services?.slice(0, 3).map((srv, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {srv}
                            </Badge>
                          ))}
                          {site.services && site.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{site.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Total: {getTotalStaff(site)}
                          </Badge>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {site.staffDeployment?.slice(0, 2).map((deploy, i) => (
                              <div key={i}>
                                {deploy.role.split(' ')[0]}: {deploy.count}
                              </div>
                            ))}
                            {site.staffDeployment && site.staffDeployment.length > 2 && (
                              <div>+{site.staffDeployment.length - 2} roles</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(site.contractValue)}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Ends: {formatDate(site.contractEndDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={site.status === "active" ? "default" : "secondary"}
                          className={site.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {site.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(site.id)}
                          >
                            {site.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSite(site)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSite(site.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SitesSection;