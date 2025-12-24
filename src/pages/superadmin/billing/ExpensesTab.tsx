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
import { Plus, Eye, Edit, Search, Receipt, ChevronLeft, ChevronRight, List, Grid } from "lucide-react";
import { Expense, sites, expenseCategories, getStatusColor, getExpenseTypeColor, formatCurrency } from "../Billing";

interface ExpensesTabProps {
  expenses: Expense[];
  onExpenseAdd: (expense: Expense) => void;
  onExpenseUpdate: (expense: Expense) => void;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  onExpenseAdd,
  onExpenseUpdate
}) => {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseViewDialogOpen, setExpenseViewDialogOpen] = useState(false);
  const [expenseEditDialogOpen, setExpenseEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<"all" | "operational" | "office" | "other">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reportPeriod, setReportPeriod] = useState<"weekly" | "monthly">("monthly");

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const amount = parseInt(formData.get("amount") as string);
    const gst = amount * 0.18;
    const expenseType = formData.get("expenseType") as "operational" | "office" | "other";
    
    const newExpense: Expense = {
      id: `EXP-${(expenses.length + 1).toString().padStart(3, '0')}`,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: amount + gst,
      date: formData.get("date") as string,
      status: "pending",
      vendor: formData.get("vendor") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      gst: gst,
      site: formData.get("site") as string,
      expenseType: expenseType
    };
    
    onExpenseAdd(newExpense);
    setExpenseDialogOpen(false);
  };

  const handleEditExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedExpense) return;
    
    const formData = new FormData(e.currentTarget);
    const amount = parseInt(formData.get("amount") as string);
    const gst = amount * 0.18;
    const expenseType = formData.get("expenseType") as "operational" | "office" | "other";
    
    const updatedExpense: Expense = {
      ...selectedExpense,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: amount + gst,
      date: formData.get("date") as string,
      vendor: formData.get("vendor") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      gst: gst,
      site: formData.get("site") as string,
      expenseType: expenseType
    };
    
    onExpenseUpdate(updatedExpense);
    setExpenseEditDialogOpen(false);
    setSelectedExpense(null);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseViewDialogOpen(true);
  };

  const handleEditExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseEditDialogOpen(true);
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;

    if (expenseTypeFilter !== "all") {
      filtered = filtered.filter(expense => expense.expenseType === expenseTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getSiteWiseExpenses = () => {
    const siteExpenses: { [key: string]: { operational: number, office: number, other: number, total: number } } = {};
    
    sites.forEach(site => {
      siteExpenses[site] = {
        operational: expenses
          .filter(exp => exp.site === site && exp.expenseType === "operational" && exp.status === "approved")
          .reduce((sum, exp) => sum + exp.amount, 0),
        office: expenses
          .filter(exp => exp.site === site && exp.expenseType === "office" && exp.status === "approved")
          .reduce((sum, exp) => sum + exp.amount, 0),
        other: expenses
          .filter(exp => exp.site === site && exp.expenseType === "other" && exp.status === "approved")
          .reduce((sum, exp) => sum + exp.amount, 0),
        total: expenses
          .filter(exp => exp.site === site && exp.status === "approved")
          .reduce((sum, exp) => sum + exp.amount, 0)
      };
    });
    
    return siteExpenses;
  };

  const getWeeklyMonthlyExpenses = (period: "weekly" | "monthly") => {
    const now = new Date();
    let startDate: Date;
    
    if (period === "weekly") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
  };

  const getPaginatedData = (data: Expense[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = (data: Expense[]) => Math.ceil(data.length / itemsPerPage);

  const filteredExpenses = getFilteredExpenses();
  const paginatedExpenses = getPaginatedData(filteredExpenses);
  const siteWiseExpenses = getSiteWiseExpenses();
  const periodExpenses = getWeeklyMonthlyExpenses(reportPeriod);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <CardTitle>Expense Management</CardTitle>
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
                placeholder="Search expenses..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expenseType">Expense Type</Label>
                    <Select name="expenseType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational Expenses</SelectItem>
                        <SelectItem value="office">Office Expenses</SelectItem>
                        <SelectItem value="other">Other Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input id="amount" name="amount" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Input id="vendor" name="vendor" required />
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
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select name="paymentMethod" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Add Expense</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Expense Type Filter */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={expenseTypeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setExpenseTypeFilter("all")}
            >
              All Expenses
            </Button>
            <Button
              variant={expenseTypeFilter === "operational" ? "default" : "outline"}
              size="sm"
              onClick={() => setExpenseTypeFilter("operational")}
            >
              Operational
            </Button>
            <Button
              variant={expenseTypeFilter === "office" ? "default" : "outline"}
              size="sm"
              onClick={() => setExpenseTypeFilter("office")}
            >
              Office
            </Button>
            <Button
              variant={expenseTypeFilter === "other" ? "default" : "outline"}
              size="sm"
              onClick={() => setExpenseTypeFilter("other")}
            >
              Other
            </Button>
          </div>

          {/* Site-wise Expense Report */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Site-wise Expense Report ({reportPeriod === "weekly" ? "Weekly" : "Monthly"})</h3>
            <div className="flex gap-2 mb-4">
              <Button
                variant={reportPeriod === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setReportPeriod("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={reportPeriod === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setReportPeriod("monthly")}
              >
                Monthly
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.map(site => (
                <Card key={site}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{site}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Operational:</span>
                      <span className="font-medium">{formatCurrency(siteWiseExpenses[site]?.operational || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Office:</span>
                      <span className="font-medium">{formatCurrency(siteWiseExpenses[site]?.office || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Other:</span>
                      <span className="font-medium">{formatCurrency(siteWiseExpenses[site]?.other || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2 font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(siteWiseExpenses[site]?.total || 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Search and Filter Info */}
          {searchTerm && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                Showing {filteredExpenses.length} of {expenses.length} expenses matching "{searchTerm}"
              </p>
            </div>
          )}

          {viewMode === "table" ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getExpenseTypeColor(expense.expenseType)}>
                          {expense.expenseType}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {expense.site}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewExpense(expense)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditExpenseClick(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredExpenses.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
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
                      Page {currentPage} of {totalPages(filteredExpenses)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(filteredExpenses)))}
                      disabled={currentPage === totalPages(filteredExpenses)}
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
                {paginatedExpenses.map((expense) => (
                  <Card key={expense.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{expense.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">{expense.vendor}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                          <Badge variant="outline" className={getExpenseTypeColor(expense.expenseType)}>
                            {expense.expenseType}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="font-medium">{expense.category}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {expense.description}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Site: {expense.site}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <div>Date: {expense.date}</div>
                          <div>Method: {expense.paymentMethod}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{formatCurrency(expense.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            GST: {formatCurrency(expense.gst || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewExpense(expense)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditExpenseClick(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredExpenses.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
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
                      Page {currentPage} of {totalPages(filteredExpenses)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(filteredExpenses)))}
                      disabled={currentPage === totalPages(filteredExpenses)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {filteredExpenses.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No expenses found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first expense"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setExpenseDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense View Dialog */}
      <Dialog open={expenseViewDialogOpen} onOpenChange={setExpenseViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details - {selectedExpense?.id}</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Expense ID:</strong> {selectedExpense.id}</div>
                <div><strong>Category:</strong> {selectedExpense.category}</div>
                <div><strong>Vendor:</strong> {selectedExpense.vendor}</div>
                <div><strong>Date:</strong> {selectedExpense.date}</div>
                <div><strong>Payment Method:</strong> {selectedExpense.paymentMethod}</div>
                <div><strong>Status:</strong> {selectedExpense.status}</div>
                <div><strong>Site:</strong> {selectedExpense.site}</div>
                <div>
                  <strong>Expense Type:</strong>
                  <Badge variant="outline" className={`ml-2 ${getExpenseTypeColor(selectedExpense.expenseType)}`}>
                    {selectedExpense.expenseType}
                  </Badge>
                </div>
              </div>
              <div>
                <strong>Description:</strong>
                <p className="mt-1">{selectedExpense.description}</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>{formatCurrency(selectedExpense.amount - (selectedExpense.gst || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(selectedExpense.gst || 0)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedExpense.amount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expense Edit Dialog */}
      <Dialog open={expenseEditDialogOpen} onOpenChange={setExpenseEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense - {selectedExpense?.id}</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <form onSubmit={handleEditExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expenseType">Expense Type</Label>
                <Select name="expenseType" defaultValue={selectedExpense.expenseType} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational Expenses</SelectItem>
                    <SelectItem value="office">Office Expenses</SelectItem>
                    <SelectItem value="other">Other Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={selectedExpense.category} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedExpense.description} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Base Amount (₹)</Label>
                  <Input 
                    id="edit-amount" 
                    name="amount" 
                    type="number" 
                    defaultValue={selectedExpense.amount - (selectedExpense.gst || 0)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input 
                    id="edit-date" 
                    name="date" 
                    type="date" 
                    defaultValue={selectedExpense.date}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vendor">Vendor</Label>
                  <Input 
                    id="edit-vendor" 
                    name="vendor" 
                    defaultValue={selectedExpense.vendor}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-site">Site</Label>
                  <Select name="site" defaultValue={selectedExpense.site} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map(site => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                <Select name="paymentMethod" defaultValue={selectedExpense.paymentMethod} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Expense</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpensesTab;