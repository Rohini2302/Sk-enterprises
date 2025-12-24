import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  Plus,
  Search,
  Package,
  UserCheck,
  AlertTriangle,
  Eye,
  Trash2,
  Download,
  Edit,
  History,
  Building,
  Shield,
  Wrench,
  Printer,
  Palette,
  ShoppingBag,
  Coffee,
  BarChart3,
  Tag,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Types
interface Product {
  id: string;
  sku: string;
  name: string;
  department: string;
  category: string;
  site: string;
  assignedManager: string;
  quantity: number;
  price: number;
  costPrice: number;
  supplier: string;
  reorderLevel: number;
  description?: string;
  brushCount?: number;
  squeegeeCount?: number;
  changeHistory: Array<{
    date: string;
    change: string;
    user: string;
    quantity: number;
  }>;
}

interface Site {
  id: string;
  name: string;
}

interface Department {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
}

const InventoryPage = () => {
  // State
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      sku: "PROD-001",
      name: "Cleaning Brush",
      department: "cleaning",
      category: "Tools",
      site: "1",
      assignedManager: "John Doe",
      quantity: 45,
      price: 25.99,
      costPrice: 15.50,
      supplier: "CleanSupplies Inc.",
      reorderLevel: 20,
      brushCount: 50,
      description: "High-quality cleaning brush for industrial use",
      changeHistory: [
        { date: "2024-01-15", change: "Initial Stock", user: "Admin", quantity: 100 },
        { date: "2024-02-20", change: "Usage", user: "Manager", quantity: -30 },
        { date: "2024-03-10", change: "Restock", user: "Admin", quantity: 25 },
      ]
    },
    {
      id: "2",
      sku: "PROD-002",
      name: "Industrial Squeepee",
      department: "cleaning",
      category: "Tools",
      site: "2",
      assignedManager: "Jane Smith",
      quantity: 18,
      price: 45.99,
      costPrice: 30.75,
      supplier: "CleanTech Solutions",
      reorderLevel: 15,
      squeegeeCount: 20,
      description: "Heavy-duty industrial squeegee",
      changeHistory: [
        { date: "2024-01-20", change: "Initial Stock", user: "Admin", quantity: 50 },
        { date: "2024-03-05", change: "Usage", user: "Supervisor", quantity: -32 },
      ]
    },
    {
      id: "3",
      sku: "PROD-003",
      name: "Safety Helmet",
      department: "maintenance",
      category: "Safety",
      site: "1",
      assignedManager: "Robert Johnson",
      quantity: 120,
      price: 35.50,
      costPrice: 22.80,
      supplier: "SafetyFirst Ltd.",
      reorderLevel: 50,
      description: "ANSI certified safety helmet",
      changeHistory: [
        { date: "2024-02-01", change: "Initial Stock", user: "Admin", quantity: 150 },
        { date: "2024-03-15", change: "Usage", user: "Manager", quantity: -30 },
      ]
    },
    {
      id: "4",
      sku: "PROD-004",
      name: "Office Chair",
      department: "office",
      category: "Furniture",
      site: "2",
      assignedManager: "Sarah Wilson",
      quantity: 8,
      price: 299.99,
      costPrice: 220.00,
      supplier: "OfficeFurn Co.",
      reorderLevel: 10,
      description: "Ergonomic office chair with lumbar support",
      changeHistory: [
        { date: "2024-01-10", change: "Initial Stock", user: "Admin", quantity: 15 },
        { date: "2024-02-25", change: "Usage", user: "HR", quantity: -7 },
      ]
    },
    {
      id: "5",
      sku: "PROD-005",
      name: "Disinfectant Spray",
      department: "cleaning",
      category: "Chemicals",
      site: "1",
      assignedManager: "John Doe",
      quantity: 65,
      price: 12.99,
      costPrice: 8.25,
      supplier: "CleanChem Ltd.",
      reorderLevel: 30,
      description: "Hospital-grade disinfectant spray",
      changeHistory: [
        { date: "2024-02-05", change: "Initial Stock", user: "Admin", quantity: 100 },
        { date: "2024-03-01", change: "Usage", user: "Supervisor", quantity: -35 },
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [changeHistoryDialogOpen, setChangeHistoryDialogOpen] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  
  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    sku: "",
    department: "cleaning",
    category: "",
    site: "1",
    assignedManager: "",
    quantity: 0,
    price: 0,
    costPrice: 0,
    supplier: "",
    reorderLevel: 10,
    description: "",
  });

  // Data
  const departments: Department[] = [
    { value: "cleaning", label: "Cleaning", icon: Shield },
    { value: "maintenance", label: "Maintenance", icon: Wrench },
    { value: "office", label: "Office Supplies", icon: Printer },
    { value: "paint", label: "Paint", icon: Palette },
    { value: "tools", label: "Tools", icon: ShoppingBag },
    { value: "canteen", label: "Canteen", icon: Coffee },
  ];

  const sites: Site[] = [
    { id: "1", name: "Main Site" },
    { id: "2", name: "Branch Office" },
    { id: "3", name: "Warehouse A" },
    { id: "4", name: "Construction Site B" },
  ];

  const managers = ["John Doe", "Jane Smith", "Robert Johnson", "Sarah Wilson", "Michael Brown"];
  
  const categories = {
    cleaning: ["Tools", "Chemicals", "Equipment", "Supplies"],
    maintenance: ["Tools", "Safety", "Equipment", "Parts"],
    office: ["Furniture", "Stationery", "Electronics", "Supplies"],
    paint: ["Paints", "Brushes", "Rollers", "Accessories"],
    tools: ["Power Tools", "Hand Tools", "Safety Gear", "Consumables"],
    canteen: ["Food Items", "Beverages", "Utensils", "Cleaning"],
  };

  // Functions
  const getDepartmentIcon = (department: string) => {
    const dept = departments.find(d => d.value === department);
    return dept ? dept.icon : Package;
  };

  const getCategoriesForDepartment = (dept: string) => {
    return categories[dept as keyof typeof categories] || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === "all" || product.department === selectedDepartment;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSite = selectedSite === "all" || product.site === selectedSite;
    
    return matchesSearch && matchesDept && matchesCategory && matchesSite;
  });

  // Handle product actions
  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast.success("Product deleted successfully!");
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku) {
      toast.error("Please fill in required fields");
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      sku: newProduct.sku || `PROD-${Date.now().toString().slice(-6)}`,
      name: newProduct.name || "",
      department: newProduct.department || "cleaning",
      category: newProduct.category || "Tools",
      site: newProduct.site || "1",
      assignedManager: newProduct.assignedManager || "John Doe",
      quantity: newProduct.quantity || 0,
      price: newProduct.price || 0,
      costPrice: newProduct.costPrice || 0,
      supplier: newProduct.supplier || "",
      reorderLevel: newProduct.reorderLevel || 10,
      description: newProduct.description,
      changeHistory: [{
        date: new Date().toISOString().split('T')[0],
        change: "Created",
        user: "Supervisor",
        quantity: newProduct.quantity || 0
      }]
    };

    setProducts(prev => [...prev, product]);
    setProductDialogOpen(false);
    resetNewProductForm();
    toast.success("Product added successfully!");
  };

  const handleEditProduct = () => {
    if (!editProduct) return;

    setProducts(prev => prev.map(p => 
      p.id === editProduct.id 
        ? {
            ...editProduct,
            changeHistory: [
              ...editProduct.changeHistory,
              {
                date: new Date().toISOString().split('T')[0],
                change: "Updated",
                user: "Supervisor",
                quantity: editProduct.quantity
              }
            ]
          }
        : p
    ));
    
    setEditProduct(null);
    setProductDialogOpen(false);
    toast.success("Product updated successfully!");
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: "",
      sku: "",
      department: "cleaning",
      category: "",
      site: "1",
      assignedManager: "",
      quantity: 0,
      price: 0,
      costPrice: 0,
      supplier: "",
      reorderLevel: 10,
      description: "",
    });
  };

  const openEditDialog = (product: Product) => {
    setEditProduct(product);
    setProductDialogOpen(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate import process
    toast.info("Importing products from file...");
    setTimeout(() => {
      toast.success("Products imported successfully!");
      setImportDialogOpen(false);
    }, 1500);
  };

  const handleExport = () => {
    const csvContent = [
      ["SKU", "Name", "Department", "Category", "Site", "Manager", "Quantity", "Price", "Supplier", "Reorder Level"],
      ...products.map(p => [
        p.sku,
        p.name,
        departments.find(d => d.value === p.department)?.label || p.department,
        p.category,
        sites.find(s => s.id === p.site)?.name || p.site,
        p.assignedManager,
        p.quantity.toString(),
        p.price.toString(),
        p.supplier,
        p.reorderLevel.toString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Inventory exported successfully!");
  };

  // Stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage and track your inventory across all sites</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => {
            setEditProduct(null);
            setProductDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Low Stock ({lowStockProducts})
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="sites">
            <MapPin className="mr-2 h-4 w-4" />
            Sites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardContent className="pt-6">
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => {
                      const Icon = dept.icon;
                      return (
                        <SelectItem key={dept.value} value={dept.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {dept.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  disabled={selectedDepartment === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {selectedDepartment !== "all" && 
                      getCategoriesForDepartment(selectedDepartment).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {site.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const DeptIcon = getDepartmentIcon(product.department);
                      const isLowStock = product.quantity <= product.reorderLevel;
                      const siteName = sites.find(s => s.id === product.site)?.name;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono font-medium">{product.sku}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{product.name}</span>
                            </div>
                            {product.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {product.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <DeptIcon className="h-3 w-3" />
                              {departments.find(d => d.value === product.department)?.label}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">{product.category}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {siteName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {product.assignedManager}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isLowStock ? 'text-amber-600' : ''}`}>
                                {product.quantity}
                              </span>
                              {isLowStock && (
                                <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Low
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Reorder: {product.reorderLevel}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(product.price)}</div>
                            <div className="text-xs text-muted-foreground">
                              Cost: {formatCurrency(product.costPrice)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isLowStock ? (
                              <Badge variant="destructive" className="text-xs">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Product Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div><strong>SKU:</strong> {product.sku}</div>
                                      <div><strong>Name:</strong> {product.name}</div>
                                      <div><strong>Department:</strong> {departments.find(d => d.value === product.department)?.label}</div>
                                      <div><strong>Category:</strong> {product.category}</div>
                                      <div><strong>Quantity:</strong> {product.quantity}</div>
                                      <div><strong>Price:</strong> {formatCurrency(product.price)}</div>
                                      <div><strong>Cost Price:</strong> {formatCurrency(product.costPrice)}</div>
                                      <div><strong>Supplier:</strong> {product.supplier}</div>
                                      <div><strong>Reorder Level:</strong> {product.reorderLevel}</div>
                                      <div><strong>Site:</strong> {siteName}</div>
                                      <div><strong>Manager:</strong> {product.assignedManager}</div>
                                      {product.brushCount && <div><strong>Brush Count:</strong> {product.brushCount}</div>}
                                      {product.squeegeeCount && <div><strong>Squeegee Count:</strong> {product.squeegeeCount}</div>}
                                      {product.description && (
                                        <div className="col-span-2">
                                          <strong>Description:</strong> {product.description}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Change History */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Change History</h4>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {product.changeHistory.map((change, index) => (
                                          <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                            <span>{change.date}</span>
                                            <span>{change.change}</span>
                                            <span>by {change.user}</span>
                                            <span className={`font-medium ${change.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                              {change.quantity > 0 ? '+' : ''}{change.quantity}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setChangeHistoryDialogOpen(product.id)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Additional tabs content can be added here */}
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>Products that need reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products
                  .filter(p => p.quantity <= p.reorderLevel)
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </div>
                      <div className="text-amber-600 font-medium">
                        {product.quantity} / {product.reorderLevel}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={editProduct ? editProduct.name : newProduct.name}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, name: e.target.value})
                    : setNewProduct({...newProduct, name: e.target.value})
                }
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={editProduct ? editProduct.sku : newProduct.sku}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, sku: e.target.value})
                    : setNewProduct({...newProduct, sku: e.target.value})
                }
                placeholder="Enter SKU"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={editProduct ? editProduct.department : newProduct.department}
                onValueChange={(value) => 
                  editProduct 
                    ? setEditProduct({...editProduct, department: value})
                    : setNewProduct({...newProduct, department: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => {
                    const Icon = dept.icon;
                    return (
                      <SelectItem key={dept.value} value={dept.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {dept.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={editProduct ? editProduct.category : newProduct.category}
                onValueChange={(value) => 
                  editProduct 
                    ? setEditProduct({...editProduct, category: value})
                    : setNewProduct({...newProduct, category: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(editProduct ? getCategoriesForDepartment(editProduct.department) : 
                    getCategoriesForDepartment(newProduct.department || 'cleaning')).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={editProduct ? editProduct.quantity : newProduct.quantity}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, quantity: parseInt(e.target.value) || 0})
                    : setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})
                }
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                value={editProduct ? editProduct.reorderLevel : newProduct.reorderLevel}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, reorderLevel: parseInt(e.target.value) || 0})
                    : setNewProduct({...newProduct, reorderLevel: parseInt(e.target.value) || 0})
                }
                placeholder="Enter reorder level"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editProduct ? editProduct.price : newProduct.price}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, price: parseFloat(e.target.value) || 0})
                    : setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})
                }
                placeholder="Enter price"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={editProduct ? editProduct.costPrice : newProduct.costPrice}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, costPrice: parseFloat(e.target.value) || 0})
                    : setNewProduct({...newProduct, costPrice: parseFloat(e.target.value) || 0})
                }
                placeholder="Enter cost price"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editProduct ? editProduct.description : newProduct.description}
                onChange={(e) => 
                  editProduct 
                    ? setEditProduct({...editProduct, description: e.target.value})
                    : setNewProduct({...newProduct, description: e.target.value})
                }
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editProduct ? handleEditProduct : handleAddProduct}>
              {editProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4">Drop your CSV file here or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports .csv files with product data</p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="mt-4 mx-auto max-w-xs"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold">CSV Format:</p>
              <p>SKU,Name,Department,Category,Quantity,Price,Supplier</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change History Dialog */}
      <Dialog open={!!changeHistoryDialogOpen} onOpenChange={() => setChangeHistoryDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change History</DialogTitle>
          </DialogHeader>
          {changeHistoryDialogOpen && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.find(p => p.id === changeHistoryDialogOpen)?.changeHistory.map((change, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                  <span>{change.date}</span>
                  <span>{change.change}</span>
                  <span>by {change.user}</span>
                  <span className={`font-medium ${change.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change.quantity > 0 ? '+' : ''}{change.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;