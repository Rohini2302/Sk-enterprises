import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Eye, MapPin, User, Phone, Calendar, Users, Building, DollarSign, Square } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getSites, addSite, updateSite, deleteSite } from "@/services/siteService";
import { useRole } from "@/context/RoleContext";
import { db } from "@/firebase";
import { ref, get, onValue } from "firebase/database";

interface Site {
  id: string;
  name: string;
  clientName: string;
  location: string;
  areaSqft: number;
  siteManager: string;
  managerPhone: string;
  supervisor: string;
  supervisorPhone: string;
  contractValue: number;
  contractEndDate: string;
  services: string[];
  staffDeployment?: Array<{ role: string; count: number }>;
  status: "active" | "inactive";
}

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

// Initial form state
const initialFormData = {
  name: "",
  clientName: "",
  location: "",
  areaSqft: 0,
  siteManager: "",
  managerPhone: "",
  supervisor: "",
  supervisorPhone: "",
  contractValue: 0,
  contractEndDate: "",
  services: [] as string[],
  staffDeployment: [] as { role: string; count: number }[],
  status: "active" as "active" | "inactive",
};

const SitesSection = () => {
  const { user } = useRole();
  const [sites, setSites] = useState<Site[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [staffDeployment, setStaffDeployment] = useState<Array<{ role: string; count: number }>>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  // Load sites
  useEffect(() => {
    fetchSites();
  }, []);

  // Fetch clients from Firebase (same as CRM page)
  useEffect(() => {
    if (!user?.email) return;

    const userPath = user.email.replace(/[@.]/g, '_');
    setLoadingClients(true);

    const clientsRef = ref(db, `users/${userPath}/clients`);
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const clientsData = snapshot.val();
        const clientsArray = Object.keys(clientsData).map(key => ({
          id: key,
          ...clientsData[key]
        }));
        setClients(clientsArray);
      } else {
        setClients([]);
      }
      setLoadingClients(false);
    });

    return () => unsubscribe();
  }, [user?.email]);

  // Fetch supervisors from Firebase (same as clients)
  useEffect(() => {
    if (!user?.email) {
      setSupervisors([]);
      setLoadingSupervisors(false);
      return;
    }

    const userPath = user.email.replace(/[@.]/g, '_');
    setLoadingSupervisors(true);

    try {
      const supervisorsRef = ref(db, `users/${userPath}/supervisors`);
      const unsubscribe = onValue(supervisorsRef, (snapshot) => {
        try {
          if (snapshot.exists()) {
            const supervisorsData = snapshot.val();
            const supervisorsArray = Object.keys(supervisorsData).map(key => ({
              id: key,
              ...supervisorsData[key]
            }));
            setSupervisors(supervisorsArray);
          } else {
            setSupervisors([]);
          }
        } catch (error) {
          console.error('Error processing supervisors data:', error);
          setSupervisors([]);
        } finally {
          setLoadingSupervisors(false);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up supervisors listener:', error);
      setSupervisors([]);
      setLoadingSupervisors(false);
    }
  }, [user?.email]);

  const fetchSites = async () => {
    try {
      const sitesData = await getSites();
      setSites(sitesData);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to load sites');
    } finally {
      setFetchLoading(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!dialogOpen) {
      setFormData(initialFormData);
      setEditId(null);
      setSelectedServices([]);
      setStaffDeployment([]);
    }
  }, [dialogOpen]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

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

  // Handle edit button click
  const handleEditClick = (site: Site) => {
    setEditId(site.id);
    setFormData({
      name: site.name,
      clientName: site.clientName,
      location: site.location,
      areaSqft: site.areaSqft,
      siteManager: site.siteManager,
      managerPhone: site.managerPhone,
      supervisor: site.supervisor,
      supervisorPhone: site.supervisorPhone,
      contractValue: site.contractValue,
      contractEndDate: site.contractEndDate,
      services: site.services || [],
      staffDeployment: site.staffDeployment || [],
      status: site.status,
    });
    setSelectedServices(site.services || []);
    setStaffDeployment(site.staffDeployment || []);
    setDialogOpen(true);
  };

  const handleViewSite = (site: Site) => {
    setSelectedSite(site);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const siteData = {
      ...formData,
      services: selectedServices,
      staffDeployment: staffDeployment.filter(item => item.count > 0),
    };

    setLoading(true);
    try {
      if (editId) {
        // Update existing site
        await updateSite(editId, siteData);
        toast.success("Site updated successfully");
      } else {
        // Add new site
        await addSite(siteData);
        toast.success("Site added successfully");
      }

      // Refresh list and reset form
      fetchSites();
      setDialogOpen(false);
      setFormData(initialFormData);
      setEditId(null);
      setSelectedServices([]);
      setStaffDeployment([]);
    } catch (error: any) {
      console.error("Error saving site:", error);
      toast.error(error.message || (editId ? "Error updating site" : "Error adding site"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return;

    try {
      await deleteSite(id);
      setSites(prev => prev.filter(s => s.id !== id));
      toast.success("Site deleted successfully");
    } catch (error: any) {
      console.error("Error deleting site:", error);
      toast.error(error.message || "Error deleting site");
    }
  };

  const handleToggleStatus = async (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const newStatus = site.status === "active" ? "inactive" : "active";
    
    try {
      await updateSite(siteId, { ...site, status: newStatus });
      setSites(prev =>
        prev.map(site =>
          site.id === siteId
            ? { ...site, status: newStatus }
            : site
        )
      );
      toast.success("Site status updated!");
    } catch (error: any) {
      console.error("Error updating site status:", error);
      toast.error("Failed to update site status");
    }
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

  // Show loading
  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading sites...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 overflow-x-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Site Management</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setFormData(initialFormData);
                setSelectedServices([]);
                setStaffDeployment([]);
                setEditId(null);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Site" : "Add New Site"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Site Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter site name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Select name="clientName" value={formData.clientName} onValueChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingClients ? (
                          <SelectItem value="" disabled>Loading clients...</SelectItem>
                        ) : clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No clients available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter location"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaSqft">Area (sqft) *</Label>
                    <Input
                      id="areaSqft"
                      name="areaSqft"
                      type="number"
                      value={formData.areaSqft}
                      onChange={handleInputChange}
                      placeholder="Enter area in sqft"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteManager">Site Manager *</Label>
                    <Input
                      id="siteManager"
                      name="siteManager"
                      value={formData.siteManager}
                      onChange={handleInputChange}
                      placeholder="Enter site manager name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managerPhone">Manager Phone *</Label>
                    <Input
                      id="managerPhone"
                      name="managerPhone"
                      value={formData.managerPhone}
                      onChange={handleInputChange}
                      placeholder="Enter manager phone"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor *</Label>
                    <Select name="supervisor" value={formData.supervisor} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingSupervisors ? (
                          <SelectItem value="" disabled>Loading supervisors...</SelectItem>
                        ) : supervisors.length > 0 ? (
                          supervisors.map((supervisor) => (
                            <SelectItem key={supervisor.id} value={supervisor.name}>
                              {supervisor.name} - {supervisor.site || supervisor.department}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No supervisors available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supervisorPhone">Supervisor Phone *</Label>
                    <Input
                      id="supervisorPhone"
                      name="supervisorPhone"
                      value={formData.supervisorPhone}
                      onChange={handleInputChange}
                      placeholder="Enter supervisor phone"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractValue">Contract Value *</Label>
                    <Input
                      id="contractValue"
                      name="contractValue"
                      type="number"
                      value={formData.contractValue}
                      onChange={handleInputChange}
                      placeholder="Enter contract value"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractEndDate">Contract End Date *</Label>
                    <Input
                      id="contractEndDate"
                      name="contractEndDate"
                      type="date"
                      value={formData.contractEndDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : editId ? "Update Site" : "Add Site"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Total Sites: {sites.length}
            </p>
          </div>
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
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No sites found. Add your first site to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site) => (
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
                          onClick={() => handleEditClick(site)}
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
                          onClick={() => handleDelete(site.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SitesSection;