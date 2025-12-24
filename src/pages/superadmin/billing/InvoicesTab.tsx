import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Eye, Download, Calendar, Search, ChevronLeft, ChevronRight, List, Grid } from "lucide-react";
import { Invoice, InvoiceItem, clients, serviceTypes, sites, getServiceIcon, getStatusColor, formatCurrency } from "../Billing";

interface InvoicesTabProps {
  invoices: Invoice[];
  onInvoiceCreate: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({
  invoices,
  onInvoiceCreate,
  onMarkAsPaid,
  onDownloadInvoice
}) => {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleCreateInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const items: InvoiceItem[] = [];
    const itemCount = 3;
    
    for (let i = 0; i < itemCount; i++) {
      const description = formData.get(`item-${i}-description`) as string;
      const quantity = parseInt(formData.get(`item-${i}-quantity`) as string) || 0;
      const rate = parseInt(formData.get(`item-${i}-rate`) as string) || 0;
      
      if (description && quantity && rate) {
        items.push({
          description,
          quantity,
          rate,
          amount: quantity * rate
        });
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.18;
    const discount = parseInt(formData.get("discount") as string) || 0;
    const totalAmount = subtotal + tax - discount;

    const newInvoice: Invoice = {
      id: `INV-${(invoices.length + 1).toString().padStart(3, '0')}`,
      client: formData.get("client") as string,
      clientEmail: formData.get("clientEmail") as string,
      amount: totalAmount,
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.get("dueDate") as string,
      items,
      tax,
      discount,
      serviceType: formData.get("serviceType") as string,
      site: formData.get("site") as string,
    };
    
    onInvoiceCreate(newInvoice);
    setInvoiceDialogOpen(false);
  };

  const getFilteredInvoices = () => {
    return invoices.filter(invoice => 
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPaginatedData = (data: Invoice[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = (data: Invoice[]) => Math.ceil(data.length / itemsPerPage);

  const filteredInvoices = getFilteredInvoices();
  const paginatedInvoices = getPaginatedData(filteredInvoices);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <CardTitle>Invoice Management</CardTitle>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Create Invoice</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Client Name</Label>
                      <Select name="client" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client} value={client}>{client}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input id="clientEmail" name="clientEmail" type="email" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select name="serviceType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map(service => (
                            <SelectItem key={service} value={service}>{service}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site">Site</Label>
                      <Select name="site" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site} value={site}>{site}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (₹)</Label>
                      <Input id="discount" name="discount" type="number" defaultValue="0" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Items</Label>
                    <div className="space-y-2">
                      {[0, 1, 2].map(index => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <Input 
                            name={`item-${index}-description`} 
                            placeholder="Description" 
                            className="col-span-5" 
                            defaultValue={index === 0 ? "Service Description" : ""}
                          />
                          <Input 
                            name={`item-${index}-quantity`} 
                            type="number" 
                            placeholder="Qty" 
                            className="col-span-2" 
                            defaultValue={index === 0 ? "1" : ""}
                          />
                          <Input 
                            name={`item-${index}-rate`} 
                            type="number" 
                            placeholder="Rate" 
                            className="col-span-3" 
                            defaultValue={index === 0 ? "10000" : ""}
                          />
                          <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                            ₹{(10 * 10000).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Create Invoice</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {searchTerm && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                Showing {filteredInvoices.length} of {invoices.length} invoices matching "{searchTerm}"
              </p>
            </div>
          )}

          {viewMode === "table" ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className={
                      invoice.status === "overdue" ? "bg-red-50 hover:bg-red-100" :
                      invoice.status === "pending" ? "bg-yellow-50 hover:bg-yellow-100" : ""
                    }>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.client}</div>
                          <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceIcon(invoice.serviceType || "")}
                          {invoice.serviceType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {invoice.site}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {invoice.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setPreviewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDownloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onMarkAsPaid(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredInvoices.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages(filteredInvoices)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(filteredInvoices)))}
                      disabled={currentPage === totalPages(filteredInvoices)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedInvoices.map((invoice) => (
                  <Card key={invoice.id} className={`hover:shadow-md transition-shadow ${
                    invoice.status === "overdue" ? "border-red-200 bg-red-50" :
                    invoice.status === "pending" ? "border-yellow-200 bg-yellow-50" : ""
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{invoice.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">{invoice.client}</p>
                        </div>
                        <Badge variant={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        {getServiceIcon(invoice.serviceType || "")}
                        <span>{invoice.serviceType}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Site: {invoice.site}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <div>Date: {invoice.date}</div>
                          <div>Due: {invoice.dueDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{formatCurrency(invoice.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.items.length} items
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => onDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status !== "paid" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => onMarkAsPaid(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredInvoices.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages(filteredInvoices)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(filteredInvoices)))}
                      disabled={currentPage === totalPages(filteredInvoices)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first invoice"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setInvoiceDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview - {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p className="text-muted-foreground">{selectedInvoice.id}</p>
                </div>
                <Badge variant={getStatusColor(selectedInvoice.status)}>
                  {selectedInvoice.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Billed To:</p>
                  <p className="font-semibold text-lg">{selectedInvoice.client}</p>
                  <p className="text-muted-foreground">{selectedInvoice.clientEmail}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span className="font-medium">{selectedInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Type:</span>
                    <span className="font-medium">{selectedInvoice.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Site:</span>
                    <span className="font-medium">{selectedInvoice.site}</span>
                  </div>
                  {selectedInvoice.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">{selectedInvoice.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onMarkAsPaid(selectedInvoice.id);
                      setPreviewDialogOpen(false);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex justify-between gap-8">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.items.reduce((sum, item) => sum + item.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span>GST (18%):</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between gap-8">
                      <span>Discount:</span>
                      <span className="text-green-600">-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-8 border-t pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  onDownloadInvoice(selectedInvoice);
                  setPreviewDialogOpen(false);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoicesTab;