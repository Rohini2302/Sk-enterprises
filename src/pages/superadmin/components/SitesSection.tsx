import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Eye, Trash2, Edit, MapPin, User, Phone, Calendar, Users, Building, DollarSign, Square } from "lucide-react";
import { toast } from "sonner";
import { initialSites, Site } from "../data";
import { FormField } from "./shared";

const ServicesList = [
  "Housekeeping",
  "Security",
  "Parking",
  "Waste Management"
];

const StaffRoles = [
  "Manager",
  "Supervisor",
  "Housekeeping Staff",
  "Security Guard",
  "Parking Attendant",
  "Waste Collector"
];

const SitesSection = () => {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [staffDeployment, setStaffDeployment] = useState<
    Array<{ role: string; count: number }>
  >([]);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

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

  const handleViewSite = (site: Site) => {
    setSelectedSite(site);
    setViewDialogOpen(true);
  };

  const handleEditSite = (site: Site) => {
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
      // Add new site
      const newSite: Site = {
        ...siteData,
        id: Date.now().toString()
      };
      setSites(prev => [newSite, ...prev]);
      toast.success("Site added successfully!");
    }

    setDialogOpen(false);
    resetForm();
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteSite = (siteId: string) => {
    setSites(prev => prev.filter(site => site.id !== siteId));
    toast.success("Site deleted successfully!");
  };

  const handleToggleStatus = (siteId: string) => {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setDialogOpen(open);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Site Management</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Site" : "Add New Site"}</DialogTitle>
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
                    <Input id="area-sqft" name="area-sqft" type="number" placeholder="Enter area in sqft" required />
                  </FormField>
                  <FormField label="Site Manager" id="site-manager" required>
                    <Input id="site-manager" name="site-manager" placeholder="Enter site manager name" required />
                  </FormField>
                  <FormField label="Manager Phone" id="manager-phone" required>
                    <Input id="manager-phone" name="manager-phone" placeholder="Enter manager phone" required />
                  </FormField>
                  <FormField label="Supervisor" id="supervisor" required>
                    <Input id="supervisor" name="supervisor" placeholder="Enter supervisor name" required />
                  </FormField>
                  <FormField label="Supervisor Phone" id="supervisor-phone" required>
                    <Input id="supervisor-phone" name="supervisor-phone" placeholder="Enter supervisor phone" required />
                  </FormField>
                  <FormField label="Contract Value" id="contract-value" required>
                    <Input id="contract-value" name="contract-value" type="number" placeholder="Enter contract value" required />
                  </FormField>
                  <FormField label="Contract End Date" id="contract-end-date" required>
                    <Input id="contract-end-date" name="contract-end-date" type="date" required />
                  </FormField>
                </div>

                <div className="border p-4 rounded-md">
                  <p className="font-medium mb-3">Services for this Site</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ServicesList.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={selectedServices.includes(service)}
                          onCheckedChange={() => toggleService(service)}
                        />
                        <label htmlFor={`service-${service}`} className="cursor-pointer">
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border p-4 rounded-md">
                  <p className="font-medium mb-3">Staff Deployment</p>
                  <div className="space-y-3">
                    {StaffRoles.map((role) => {
                      const deployment = staffDeployment.find(item => item.role === role);
                      const count = deployment?.count || 0;
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <span>{role}</span>
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

                <Button type="submit" className="w-full">
                  {editMode ? "Update Site" : "Add Site"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Area (sqft)</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{site.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Manager: {site.siteManager}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{site.clientName}</TableCell>
                  <TableCell>{site.location}</TableCell>
                  <TableCell className="w-[160px]">
                    {site.services?.map((srv, i) => (
                      <Badge key={i} className="mr-1 mb-1">{srv}</Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="mr-1">
                        Total: {getTotalStaff(site)}
                      </Badge>
                      {site.staffDeployment?.slice(0, 2).map((deploy, i) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          {deploy.role}: {deploy.count}
                        </div>
                      ))}
                      {site.staffDeployment && site.staffDeployment.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{site.staffDeployment.length - 2} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{site.areaSqft.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(site.contractValue)}</TableCell>
                  <TableCell>
                    <Badge variant={site.status === "active" ? "default" : "secondary"}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {/* View Site Details Dialog */}
                      <Dialog open={viewDialogOpen && selectedSite?.id === site.id} onOpenChange={(open) => {
                        if (!open) {
                          setViewDialogOpen(false);
                          setSelectedSite(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSite(site)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          {selectedSite && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Building className="h-5 w-5" />
                                  Site Details
                                </DialogTitle>
                                <DialogDescription>
                                  Complete information about {selectedSite.name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Site Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                      <Building className="h-4 w-4" />
                                      Site Information
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Site Name:</span>
                                        <span className="font-medium">{selectedSite.name}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Client:</span>
                                        <span className="font-medium">{selectedSite.clientName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          Location:
                                        </span>
                                        <span className="font-medium">{selectedSite.location}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                          <Square className="h-3 w-3" />
                                          Area:
                                        </span>
                                        <span className="font-medium">{selectedSite.areaSqft.toLocaleString()} sqft</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant={selectedSite.status === "active" ? "default" : "secondary"}>
                                          {selectedSite.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Contract Details */}
                                  <div className="space-y-2">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      Contract Details
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contract Value:</span>
                                        <span className="font-medium">{formatCurrency(selectedSite.contractValue)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          End Date:
                                        </span>
                                        <span className="font-medium">{formatDate(selectedSite.contractEndDate)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Contact Information
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 border p-3 rounded-md">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">Site Manager</span>
                                      </div>
                                      <div>{selectedSite.siteManager}</div>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        {selectedSite.managerPhone}
                                      </div>
                                    </div>
                                    <div className="space-y-2 border p-3 rounded-md">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">Supervisor</span>
                                      </div>
                                      <div>{selectedSite.supervisor}</div>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        {selectedSite.supervisorPhone}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Services */}
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-lg">Services Provided</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedSite.services?.map((service, i) => (
                                      <Badge key={i} className="px-3 py-1">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Staff Deployment */}
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-lg">Staff Deployment</h3>
                                  <div className="border rounded-md">
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                      {selectedSite.staffDeployment?.map((deployment, i) => (
                                        <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                                          <span className="text-sm">{deployment.role}</span>
                                          <Badge variant="outline" className="font-mono">
                                            {deployment.count}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="border-t p-3 bg-muted/50">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Staff</span>
                                        <Badge className="px-3 py-1 text-base">
                                          {getTotalStaff(selectedSite)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSite(site)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(site.id)}
                      >
                        {site.status === "active" ? "Deactivate" : "Activate"}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SitesSection;