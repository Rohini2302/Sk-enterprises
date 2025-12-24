import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, TrendingUp, Receipt, Download, FileText } from "lucide-react";
import { Invoice, Payment, Expense, getStatusColor, formatCurrency } from "../Billing";

interface PaymentSummaryTabProps {
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  onExportData: (type: string) => void;
}

const PaymentSummaryTab: React.FC<PaymentSummaryTabProps> = ({
  invoices,
  payments,
  expenses,
  onExportData
}) => {
  const totalRevenue = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(i => i.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter(i => i.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpenses = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Payment Summary</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onExportData("payments")}>
            <Download className="mr-2 h-4 w-4" />
            Export Payments
          </Button>
          <Button variant="outline" onClick={() => onExportData("invoices")}>
            <FileText className="mr-2 h-4 w-4" />
            Export Invoices
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Invoices</p>
                  <p className="text-2xl font-bold">
                    {invoices.filter(i => i.status === "paid").length}
                  </p>
                  <p className="text-sm text-primary font-semibold">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {invoices.filter(i => i.status === "pending").length}
                  </p>
                  <p className="text-sm text-secondary font-semibold">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-destructive">
                    {invoices.filter(i => i.status === "overdue").length}
                  </p>
                  <p className="text-sm text-destructive font-semibold">
                    {formatCurrency(overdueAmount)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">
                    {expenses.length}
                  </p>
                  <p className="text-sm text-destructive font-semibold">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Payments</h3>
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{payment.client}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.date} • {payment.method}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                  <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Methods</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Bank Transfer</span>
                <span className="font-semibold">60%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">UPI</span>
                <span className="font-semibold">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Credit Card</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Other</span>
                <span className="font-semibold">5%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryTab;