import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Filter, FileDown, Users, Eye, ChevronLeft, ChevronRight, List, Grid, Download } from "lucide-react";
import { LedgerEntry, PartyBalance, getTypeIcon, getStatusColor, getBalanceColor, getBalanceBadgeVariant, formatCurrency } from "../Billing";

interface LedgerBalanceTabProps {
  ledgerEntries: LedgerEntry[];
  partyBalances: PartyBalance[];
  onExportData: (type: string) => void;
}

const LedgerBalanceTab: React.FC<LedgerBalanceTabProps> = ({
  ledgerEntries,
  partyBalances,
  onExportData
}) => {
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [ledgerViewMode, setLedgerViewMode] = useState<"table" | "card">("table");
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [ledgerCurrentPage, setLedgerCurrentPage] = useState(1);
  const [ledgerItemsPerPage] = useState(10);

  const handleViewPartyLedger = (party: string) => {
    setSelectedParty(party);
    setLedgerDialogOpen(true);
  };

  const getFilteredLedgerEntries = () => {
    let filtered = ledgerEntries;

    if (dateFilter.startDate) {
      filtered = filtered.filter(entry => entry.date >= dateFilter.startDate);
    }

    if (dateFilter.endDate) {
      filtered = filtered.filter(entry => entry.date <= dateFilter.endDate);
    }

    if (selectedParty) {
      filtered = filtered.filter(entry => entry.party === selectedParty);
    }

    if (ledgerSearchTerm) {
      filtered = filtered.filter(entry => 
        entry.party.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        entry.type.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(ledgerSearchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getPartyLedgerEntries = (party: string) => {
    return ledgerEntries
      .filter(entry => entry.party === party)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPaginatedLedgerData = (data: LedgerEntry[]) => {
    const startIndex = (ledgerCurrentPage - 1) * ledgerItemsPerPage;
    const endIndex = startIndex + ledgerItemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalLedgerPages = (data: LedgerEntry[]) => Math.ceil(data.length / ledgerItemsPerPage);

  const filteredLedgerEntries = getFilteredLedgerEntries();
  const paginatedLedgerEntries = getPaginatedLedgerData(filteredLedgerEntries);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <CardTitle>Ledger & Site Balances</CardTitle>
            <div className="flex border rounded-lg">
              <Button
                variant={ledgerViewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLedgerViewMode("table")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={ledgerViewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLedgerViewMode("card")}
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
                placeholder="Search ledger entries..."
                className="pl-8 w-64"
                value={ledgerSearchTerm}
                onChange={(e) => setLedgerSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onExportData("ledger")}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Ledger
              </Button>
              <Button variant="outline" onClick={() => onExportData("balances")}>
                <Users className="mr-2 h-4 w-4" />
                Export Balances
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Filter */}
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">From Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">To Date</Label>
              <Input 
                id="endDate" 
                type="date" 
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filter
            </Button>
          </div>

          {/* Site Balances Summary */}
          <div>
            <h3 className="font-semibold mb-4">Site Balances Summary</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {partyBalances.map((party) => (
                <Card key={party.party} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6" onClick={() => handleViewPartyLedger(party.party)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium truncate">{party.party}</div>
                      <Badge variant={getBalanceBadgeVariant(party.status)}>
                        {party.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getBalanceColor(party.currentBalance)}`}>
                      {formatCurrency(Math.abs(party.currentBalance))}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Debit: {formatCurrency(party.totalDebit)}</span>
                      <span>Credit: {formatCurrency(party.totalCredit)}</span>
                    </div>
                    {party.site && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Site: {party.site}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Last: {party.lastTransaction}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Ledger Entries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Ledger Entries</h3>
              <div className="text-sm text-muted-foreground">
                Showing {filteredLedgerEntries.length} entries
              </div>
            </div>

            {(ledgerSearchTerm || dateFilter.startDate || dateFilter.endDate) && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  Showing {filteredLedgerEntries.length} of {ledgerEntries.length} ledger entries
                  {ledgerSearchTerm && ` matching "${ledgerSearchTerm}"`}
                  {(dateFilter.startDate || dateFilter.endDate) && ` within selected date range`}
                </p>
              </div>
            )}

            {ledgerViewMode === "table" ? (
              <>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit (₹)</TableHead>
                        <TableHead className="text-right">Credit (₹)</TableHead>
                        <TableHead className="text-right">Balance (₹)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLedgerEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                          <TableCell>
                            <div 
                              className="font-medium cursor-pointer hover:text-primary hover:underline"
                              onClick={() => handleViewPartyLedger(entry.party)}
                            >
                              {entry.party}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(entry.type)}
                              <Badge variant="outline" className="capitalize">
                                {entry.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={entry.description}>
                              {entry.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${getBalanceColor(entry.balance)}`}>
                            {formatCurrency(entry.balance)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredLedgerEntries.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((ledgerCurrentPage - 1) * ledgerItemsPerPage) + 1} to {Math.min(ledgerCurrentPage * ledgerItemsPerPage, filteredLedgerEntries.length)} of {filteredLedgerEntries.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLedgerCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={ledgerCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {ledgerCurrentPage} of {totalLedgerPages(filteredLedgerEntries)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLedgerCurrentPage(prev => Math.min(prev + 1, totalLedgerPages(filteredLedgerEntries)))}
                        disabled={ledgerCurrentPage === totalLedgerPages(filteredLedgerEntries)}
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
                  {paginatedLedgerEntries.map((entry) => (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{entry.reference}</CardTitle>
                            <p className="text-sm text-muted-foreground">{entry.party}</p>
                          </div>
                          <Badge variant={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          {getTypeIcon(entry.type)}
                          <span className="capitalize">{entry.type.replace('_', ' ')}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Date: {entry.date}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Debit</div>
                            <div className="font-semibold">
                              {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Credit</div>
                            <div className="font-semibold">
                              {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Balance</div>
                            <div className={`font-semibold ${getBalanceColor(entry.balance)}`}>
                              {formatCurrency(entry.balance)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewPartyLedger(entry.party)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredLedgerEntries.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((ledgerCurrentPage - 1) * ledgerItemsPerPage) + 1} to {Math.min(ledgerCurrentPage * ledgerItemsPerPage, filteredLedgerEntries.length)} of {filteredLedgerEntries.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLedgerCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={ledgerCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {ledgerCurrentPage} of {totalLedgerPages(filteredLedgerEntries)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLedgerCurrentPage(prev => Math.min(prev + 1, totalLedgerPages(filteredLedgerEntries)))}
                        disabled={ledgerCurrentPage === totalLedgerPages(filteredLedgerEntries)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {filteredLedgerEntries.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No ledger entries found</h3>
                <p className="text-muted-foreground">
                  {ledgerSearchTerm || dateFilter.startDate || dateFilter.endDate 
                    ? "Try adjusting your search terms or date filters" 
                    : "No ledger entries available"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Party Ledger Dialog */}
      <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ledger Statement - {selectedParty}</DialogTitle>
          </DialogHeader>
          {selectedParty && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/50">
                <div>
                  <h3 className="font-semibold">{selectedParty}</h3>
                  <p className="text-sm text-muted-foreground">
                    Current Balance: 
                    <span className={`ml-2 font-bold ${getBalanceColor(
                      partyBalances.find(p => p.party === selectedParty)?.currentBalance || 0
                    )}`}>
                      {formatCurrency(partyBalances.find(p => p.party === selectedParty)?.currentBalance || 0)}
                    </span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const partyEntries = getPartyLedgerEntries(selectedParty);
                    const headers = ["Date", "Type", "Reference", "Description", "Debit", "Credit", "Balance", "Status"];
                    const csvContent = [
                      headers.join(","),
                      ...partyEntries.map(entry => [
                        entry.date,
                        entry.type,
                        entry.reference,
                        `"${entry.description}"`,
                        entry.debit,
                        entry.credit,
                        entry.balance,
                        entry.status
                      ].join(","))
                    ].join("\n");
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `ledger-statement-${selectedParty}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Statement
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Service/Client</TableHead>
                      <TableHead className="text-right">Debit (₹)</TableHead>
                      <TableHead className="text-right">Credit (₹)</TableHead>
                      <TableHead className="text-right">Balance (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPartyLedgerEntries(selectedParty).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {entry.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {entry.serviceType && <div>{entry.serviceType}</div>}
                            {entry.site && <div>{entry.site}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${getBalanceColor(entry.balance)}`}>
                          {formatCurrency(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LedgerBalanceTab;