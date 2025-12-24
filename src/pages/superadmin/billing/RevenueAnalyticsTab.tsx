import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Pie, Cell } from "recharts";
import { SiteProfit, Invoice, Expense, formatCurrency } from "../Billing";

interface RevenueAnalyticsTabProps {
  siteProfits: SiteProfit[];
  invoices: Invoice[];
  expenses: Expense[];
  onExportData: (type: string) => void;
}

const RevenueAnalyticsTab: React.FC<RevenueAnalyticsTabProps> = ({
  siteProfits,
  invoices,
  expenses,
  onExportData
}) => {
  // Enhanced revenue data
  const revenueData = [
    { month: "Jan", revenue: 245000, expenses: 82000, profit: 163000 },
    { month: "Feb", revenue: 318000, expenses: 95000, profit: 223000 },
    { month: "Mar", revenue: 422000, expenses: 112000, profit: 310000 },
    { month: "Apr", revenue: 389000, expenses: 98000, profit: 291000 },
    { month: "May", revenue: 515000, expenses: 125000, profit: 390000 },
    { month: "Jun", revenue: 628000, expenses: 145000, profit: 483000 },
  ];

  const expenseByCategory = [
    { name: "Equipment", value: 185000 },
    { name: "Cleaning Supplies", value: 75000 },
    { name: "Infrastructure", value: 320000 },
    { name: "Waste Management", value: 45000 },
    { name: "STP Maintenance", value: 68000 },
    { name: "Salaries", value: 420000 },
    { name: "Utilities", value: 85000 },
  ];

  const serviceRevenueData = [
    { service: "Housekeeping", revenue: 450000 },
    { service: "Security", revenue: 320000 },
    { service: "Parking", revenue: 280000 },
    { service: "Waste Management", revenue: 190000 },
    { service: "STP Cleaning", revenue: 310000 },
    { service: "Consumables", revenue: 220000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Financial Analytics</CardTitle>
        <Button variant="outline" onClick={() => onExportData("site-profits")}>
          <Download className="mr-2 h-4 w-4" />
          Export Site Profits
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Site-wise Profit Section */}
        <div>
          <h3 className="font-semibold mb-4">Site-wise Profit Analysis</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {siteProfits.map((profit) => (
              <Card key={profit.site} className={
                profit.netProfit >= 0 ? "border-green-200" : "border-red-200"
              }>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{profit.site}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue:</span>
                    <span className="font-medium text-green-600">{formatCurrency(profit.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expenses:</span>
                    <span className="font-medium text-red-600">{formatCurrency(profit.expenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 font-semibold">
                    <span>Net Profit:</span>
                    <span className={
                      profit.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }>
                      {formatCurrency(profit.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin:</span>
                    <span className={
                      profit.profitMargin >= 20 ? "text-green-600" : 
                      profit.profitMargin >= 10 ? "text-yellow-600" : "text-red-600"
                    }>
                      {profit.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Service Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ service, percent }) => `${service} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {serviceRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-4">Expense Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Profit"]} />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Net Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueAnalyticsTab;