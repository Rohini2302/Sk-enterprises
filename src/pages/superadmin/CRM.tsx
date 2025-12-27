import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Phone, Mail, Calendar, Eye, MapPin, Building } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { db } from "@/firebase";
import { ref, set, get, push, remove, update, onValue } from "firebase/database";
import { useRole } from "@/context/RoleContext";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: "active" | "inactive";
  value: string;
  industry: string;
  contactPerson: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  value: string;
  assignedTo: string;
  followUpDate: string;
  notes: string;
}

interface Communication {
  id: string;
  clientName: string;
  clientId: string;
  type: "call" | "email" | "meeting" | "demo";
  date: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

// Indian Data
const indianNames = {
  male: ["Rajesh Kumar", "Amit Sharma", "Sanjay Patel", "Vikram Singh", "Arun Reddy", "Mohan Das", "Suresh Iyer", "Prakash Joshi"],
  female: ["Priya Sharma", "Anjali Singh", "Sunita Reddy", "Kavita Patel", "Meera Iyer", "Laxmi Kumar", "Sonia Das", "Neha Joshi"]
};

const indianCompanies = [
  "Reliance Industries", "Tata Group", "Infosys", "Wipro", "HDFC Bank", 
  "ICICI Bank", "Mahindra & Mahindra", "Bajaj Auto", "Tech Mahindra", "Larsen & Toubro"
];

const indianCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
const industries = ["IT Services", "Manufacturing", "Banking", "Healthcare", "Education", "Real Estate", "Retail", "Automobile"];

const generateIndianPhone = () => `9${Math.floor(100000000 + Math.random() * 900000000)}`;

const CRM = () => {
  const { user } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [commDialogOpen, setCommDialogOpen] = useState(false);
  const [editClientDialog, setEditClientDialog] = useState<string | null>(null);
  const [editLeadDialog, setEditLeadDialog] = useState<string | null>(null);
  const [viewClientDialog, setViewClientDialog] = useState<string | null>(null);
  const [viewLeadDialog, setViewLeadDialog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);

  // Helper function to sanitize email for Firebase path
  const sanitizeEmail = (email: string) => email.replace(/[@.]/g, '_');

  // Load data from Firebase
  useEffect(() => {
    if (!user?.email) return;

    const userPath = sanitizeEmail(user.email);
    setLoading(true);

    // Load clients
    const clientsRef = ref(db, `users/${userPath}/clients`);
    const clientsUnsubscribe = onValue(clientsRef, (snapshot) => {
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
    });

    // Load leads
    const leadsRef = ref(db, `users/${userPath}/leads`);
    const leadsUnsubscribe = onValue(leadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const leadsData = snapshot.val();
        const leadsArray = Object.keys(leadsData).map(key => ({
          id: key,
          ...leadsData[key]
        }));
        setLeads(leadsArray);
      } else {
        setLeads([]);
      }
    });

    // Load communications
    const commsRef = ref(db, `users/${userPath}/communications`);
    const commsUnsubscribe = onValue(commsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commsData = snapshot.val();
        const commsArray = Object.keys(commsData).map(key => ({
          id: key,
          ...commsData[key]
        }));
        setCommunications(commsArray);
      } else {
        setCommunications([]);
      }
      setLoading(false);
    });

    return () => {
      clientsUnsubscribe();
      leadsUnsubscribe();
      commsUnsubscribe();
    };
  }, [user?.email]);

  // Client Functions
  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) return;

    const formData = new FormData(e.currentTarget);
    const userPath = sanitizeEmail(user.email);
    const clientsRef = ref(db, `users/${userPath}/clients`);
    const newClientRef = push(clientsRef);

    const newClient: Client = {
      id: newClientRef.key!,
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      status: "active",
      value: formData.get("value") as string,
      industry: formData.get("industry") as string,
      contactPerson: formData.get("contactPerson") as string,
    };

    try {
      await set(newClientRef, newClient);
      toast.success("Client added successfully!");
      setClientDialogOpen(false);
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    }
  };

  const handleEditClient = async (clientId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) return;

    const formData = new FormData(e.currentTarget);
    const userPath = sanitizeEmail(user.email);
    const clientRef = ref(db, `users/${userPath}/clients/${clientId}`);

    const updatedClient = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      value: formData.get("value") as string,
      industry: formData.get("industry") as string,
      contactPerson: formData.get("contactPerson") as string,
    };

    try {
      await update(clientRef, updatedClient);
      toast.success("Client updated successfully!");
      setEditClientDialog(null);
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user?.email) return;

    const userPath = sanitizeEmail(user.email);
    const clientRef = ref(db, `users/${userPath}/clients/${clientId}`);

    try {
      await remove(clientRef);
      // Also delete related communications
      const commsToDelete = communications.filter(comm => comm.clientId === clientId);
      for (const comm of commsToDelete) {
        const commRef = ref(db, `users/${userPath}/communications/${comm.id}`);
        await remove(commRef);
      }
      toast.success("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    }
  };

  // Lead Functions
  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) return;

    const formData = new FormData(e.currentTarget);
    const userPath = sanitizeEmail(user.email);
    const leadsRef = ref(db, `users/${userPath}/leads`);
    const newLeadRef = push(leadsRef);

    const newLead: Lead = {
      id: newLeadRef.key!,
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      source: formData.get("source") as string,
      status: "new",
      value: formData.get("value") as string,
      assignedTo: formData.get("assignedTo") as string,
      followUpDate: formData.get("followUpDate") as string,
      notes: formData.get("notes") as string,
    };

    try {
      await set(newLeadRef, newLead);
      toast.success("Lead added successfully!");
      setLeadDialogOpen(false);
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Failed to add lead");
    }
  };

  const handleEditLead = async (leadId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) return;

    const formData = new FormData(e.currentTarget);
    const userPath = sanitizeEmail(user.email);
    const leadRef = ref(db, `users/${userPath}/leads/${leadId}`);

    const updatedLead = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      source: formData.get("source") as string,
      value: formData.get("value") as string,
      assignedTo: formData.get("assignedTo") as string,
      followUpDate: formData.get("followUpDate") as string,
      notes: formData.get("notes") as string,
    };

    try {
      await update(leadRef, updatedLead);
      toast.success("Lead updated successfully!");
      setEditLeadDialog(null);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!user?.email) return;

    const userPath = sanitizeEmail(user.email);
    const leadRef = ref(db, `users/${userPath}/leads/${leadId}`);

    try {
      await remove(leadRef);
      toast.success("Lead deleted successfully!");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    if (!user?.email) return;

    const userPath = sanitizeEmail(user.email);
    const leadRef = ref(db, `users/${userPath}/leads/${leadId}`);

    try {
      await update(leadRef, { status: newStatus });
      toast.success("Lead status updated!");
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update lead status");
    }
  };

  // Communication Functions
  const handleAddCommunication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) return;

    const formData = new FormData(e.currentTarget);
    const clientId = formData.get("clientId") as string;
    const selectedClient = clients.find(c => c.id === clientId);

    if (!selectedClient) {
      toast.error("Please select a valid client");
      return;
    }

    const userPath = sanitizeEmail(user.email);
    const commsRef = ref(db, `users/${userPath}/communications`);
    const newCommRef = push(commsRef);

    const newComm: Communication = {
      id: newCommRef.key!,
      clientName: selectedClient.name,
      clientId: clientId,
      type: formData.get("type") as "call" | "email" | "meeting" | "demo",
      date: formData.get("date") as string,
      notes: formData.get("notes") as string,
      followUpRequired: formData.get("followUpRequired") === "on",
      followUpDate: formData.get("followUpDate") as string || undefined,
    };

    try {
      await set(newCommRef, newComm);
      toast.success("Communication logged successfully!");
      setCommDialogOpen(false);
    } catch (error) {
      console.error("Error adding communication:", error);
      toast.error("Failed to log communication");
    }
  };

  const handleDeleteCommunication = async (commId: string) => {
    if (!user?.email) return;

    const userPath = sanitizeEmail(user.email);
    const commRef = ref(db, `users/${userPath}/communications/${commId}`);

    try {
      await remove(commRef);
      toast.success("Communication deleted!");
    } catch (error) {
      console.error("Error deleting communication:", error);
      toast.error("Failed to delete communication");
    }
  };

  // Utility Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "default";
      case "contacted": return "secondary";
      case "qualified": return "default";
      case "proposal": return "secondary";
      case "negotiation": return "outline";
      case "closed-won": return "default";
      case "closed-lost": return "destructive";
      case "active": return "default";
      case "inactive": return "outline";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new": return "New";
      case "contacted": return "Contacted";
      case "qualified": return "Qualified";
      case "proposal": return "Proposal Sent";
      case "negotiation": return "Negotiation";
      case "closed-won": return "Won";
      case "closed-lost": return "Lost";
      default: return status;
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunications = communications.filter(comm =>
    comm.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comm.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientById = (id: string) => clients.find(client => client.id === id);
  const getLeadById = (id: string) => leads.find(lead => lead.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="CRM Management" />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading CRM data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="CRM Management" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {leads.filter(l => !l.status.includes('closed')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2.5Cr</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communications.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Client List</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Client</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddClient} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Client Name *</Label>
                            <Input id="name" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company">Company *</Label>
                            <Input id="company" name="company" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" name="email" type="email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input id="phone" name="phone" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <Input id="contactPerson" name="contactPerson" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select name="industry">
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {industries.map(industry => (
                                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Select name="city">
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                {indianCities.map(city => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value">Expected Value *</Label>
                            <Input id="value" name="value" placeholder="₹50,00,000" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea id="address" name="address" />
                        </div>
                        <Button type="submit" className="w-full">Add Client</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {client.company}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{client.industry}</TableCell>
                        <TableCell className="font-semibold">{client.value}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setViewClientDialog(client.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Client Details</DialogTitle>
                                </DialogHeader>
                                {viewClientDialog && getClientById(viewClientDialog) && (() => {
                                  const client = getClientById(viewClientDialog)!;
                                  return (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div><strong>Name:</strong> {client.name}</div>
                                        <div><strong>Company:</strong> {client.company}</div>
                                        <div><strong>Email:</strong> {client.email}</div>
                                        <div><strong>Phone:</strong> {client.phone}</div>
                                        <div><strong>Industry:</strong> {client.industry}</div>
                                        <div><strong>City:</strong> {client.city}</div>
                                        <div><strong>Value:</strong> {client.value}</div>
                                        <div><strong>Status:</strong> {client.status}</div>
                                      </div>
                                      {client.address && (
                                        <div>
                                          <strong>Address:</strong>
                                          <div className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {client.address}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </DialogContent>
                            </Dialog>
                            <Dialog open={editClientDialog === client.id} onOpenChange={(open) => setEditClientDialog(open ? client.id : null)}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Client</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={(e) => handleEditClient(client.id, e)} className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">Client Name</Label>
                                      <Input id="edit-name" name="name" defaultValue={client.name} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-company">Company</Label>
                                      <Input id="edit-company" name="company" defaultValue={client.company} required />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">Email</Label>
                                      <Input id="edit-email" name="email" type="email" defaultValue={client.email} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-phone">Phone</Label>
                                      <Input id="edit-phone" name="phone" defaultValue={client.phone} required />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-contactPerson">Contact Person</Label>
                                      <Input id="edit-contactPerson" name="contactPerson" defaultValue={client.contactPerson} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-industry">Industry</Label>
                                      <Select name="industry" defaultValue={client.industry}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {industries.map(industry => (
                                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-city">City</Label>
                                      <Select name="city" defaultValue={client.city}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {indianCities.map(city => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-value">Expected Value</Label>
                                      <Input id="edit-value" name="value" defaultValue={client.value} required />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-address">Address</Label>
                                    <Textarea id="edit-address" name="address" defaultValue={client.address} />
                                  </div>
                                  <Button type="submit" className="w-full">Update Client</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteClient(client.id)}
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
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Lead Tracker</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Add Lead</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Lead</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddLead} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="leadName">Lead Name *</Label>
                            <Input id="leadName" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="leadCompany">Company *</Label>
                            <Input id="leadCompany" name="company" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="leadEmail">Email *</Label>
                            <Input id="leadEmail" name="email" type="email" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="leadPhone">Phone *</Label>
                            <Input id="leadPhone" name="phone" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="source">Source *</Label>
                            <Select name="source" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Website">Website</SelectItem>
                                <SelectItem value="Referral">Referral</SelectItem>
                                <SelectItem value="Cold Call">Cold Call</SelectItem>
                                <SelectItem value="Social Media">Social Media</SelectItem>
                                <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                                <SelectItem value="Trade Show">Trade Show</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="leadValue">Expected Value *</Label>
                            <Input id="leadValue" name="value" placeholder="₹30,00,000" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignedTo">Assign To *</Label>
                            <Input id="assignedTo" name="assignedTo" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="followUpDate">Follow-up Date</Label>
                            <Input id="followUpDate" name="followUpDate" type="date" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leadNotes">Notes</Label>
                          <Textarea id="leadNotes" name="notes" />
                        </div>
                        <Button type="submit" className="w-full">Add Lead</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.company}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm">{lead.email}</div>
                            <div className="text-sm">{lead.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>
                          <Select 
                            value={lead.status} 
                            onValueChange={(value) => handleLeadStatusChange(lead.id, value as Lead['status'])}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="proposal">Proposal Sent</SelectItem>
                              <SelectItem value="negotiation">Negotiation</SelectItem>
                              <SelectItem value="closed-won">Won</SelectItem>
                              <SelectItem value="closed-lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="font-semibold">{lead.value}</TableCell>
                        <TableCell>
                          {lead.followUpDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {lead.followUpDate}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setViewLeadDialog(lead.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Lead Details</DialogTitle>
                                </DialogHeader>
                                {viewLeadDialog && getLeadById(viewLeadDialog) && (() => {
                                  const lead = getLeadById(viewLeadDialog)!;
                                  return (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div><strong>Name:</strong> {lead.name}</div>
                                        <div><strong>Company:</strong> {lead.company}</div>
                                        <div><strong>Email:</strong> {lead.email}</div>
                                        <div><strong>Phone:</strong> {lead.phone}</div>
                                        <div><strong>Source:</strong> {lead.source}</div>
                                        <div><strong>Status:</strong> {getStatusText(lead.status)}</div>
                                        <div><strong>Value:</strong> {lead.value}</div>
                                        <div><strong>Assigned To:</strong> {lead.assignedTo}</div>
                                      </div>
                                      {lead.followUpDate && (
                                        <div>
                                          <strong>Follow-up Date:</strong> {lead.followUpDate}
                                        </div>
                                      )}
                                      {lead.notes && (
                                        <div>
                                          <strong>Notes:</strong>
                                          <div className="mt-1 p-2 border rounded">{lead.notes}</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </DialogContent>
                            </Dialog>
                            <Dialog open={editLeadDialog === lead.id} onOpenChange={(open) => setEditLeadDialog(open ? lead.id : null)}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Lead</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={(e) => handleEditLead(lead.id, e)} className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-lead-name">Lead Name</Label>
                                      <Input id="edit-lead-name" name="name" defaultValue={lead.name} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-lead-company">Company</Label>
                                      <Input id="edit-lead-company" name="company" defaultValue={lead.company} required />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-lead-email">Email</Label>
                                      <Input id="edit-lead-email" name="email" type="email" defaultValue={lead.email} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-lead-phone">Phone</Label>
                                      <Input id="edit-lead-phone" name="phone" defaultValue={lead.phone} required />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-source">Source</Label>
                                      <Select name="source" defaultValue={lead.source}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Website">Website</SelectItem>
                                          <SelectItem value="Referral">Referral</SelectItem>
                                          <SelectItem value="Cold Call">Cold Call</SelectItem>
                                          <SelectItem value="Social Media">Social Media</SelectItem>
                                          <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                                          <SelectItem value="Trade Show">Trade Show</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-lead-value">Expected Value</Label>
                                      <Input id="edit-lead-value" name="value" defaultValue={lead.value} required />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-assignedTo">Assign To</Label>
                                      <Input id="edit-assignedTo" name="assignedTo" defaultValue={lead.assignedTo} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-followUpDate">Follow-up Date</Label>
                                      <Input id="edit-followUpDate" name="followUpDate" type="date" defaultValue={lead.followUpDate} />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-lead-notes">Notes</Label>
                                    <Textarea id="edit-lead-notes" name="notes" defaultValue={lead.notes} />
                                  </div>
                                  <Button type="submit" className="w-full">Update Lead</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteLead(lead.id)}
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
          </TabsContent>

          <TabsContent value="communications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Communication Logs</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={commDialogOpen} onOpenChange={setCommDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Log Communication</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Log Communication</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddCommunication} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="commClient">Client *</Label>
                          <Select name="clientId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name} - {client.company}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="commType">Type *</Label>
                            <Select name="type" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="call">Phone Call</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="demo">Product Demo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="commDate">Date *</Label>
                            <Input id="commDate" name="date" type="date" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commNotes">Notes *</Label>
                          <Textarea id="commNotes" name="notes" required />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="followUpRequired" name="followUpRequired" className="rounded" />
                          <Label htmlFor="followUpRequired">Follow-up Required</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commFollowUpDate">Follow-up Date</Label>
                          <Input id="commFollowUpDate" name="followUpDate" type="date" />
                        </div>
                        <Button type="submit" className="w-full">Log Communication</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommunications.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell className="font-medium">{comm.clientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {comm.type === "call" && <Phone className="h-3 w-3 mr-1" />}
                            {comm.type === "email" && <Mail className="h-3 w-3 mr-1" />}
                            {comm.type === "meeting" && <Calendar className="h-3 w-3 mr-1" />}
                            {comm.type === "demo" && <Eye className="h-3 w-3 mr-1" />}
                            {comm.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{comm.date}</TableCell>
                        <TableCell className="max-w-xs truncate">{comm.notes}</TableCell>
                        <TableCell>
                          {comm.followUpRequired ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {comm.followUpDate || "Pending"}
                            </div>
                          ) : (
                            <Badge variant="outline">Not Required</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteCommunication(comm.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default CRM;