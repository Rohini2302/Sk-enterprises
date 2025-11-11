// src/components/hrms/tabs/PerformanceTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Performance } from "./types";
import Pagination from "./Pagination";

interface PerformanceTabProps {
  performance: Performance[];
  setPerformance: React.Dispatch<React.SetStateAction<Performance[]>>;
}

const PerformanceTab = ({ performance }: PerformanceTabProps) => {
  const [performancePage, setPerformancePage] = useState(1);
  const [performanceItemsPerPage, setPerformanceItemsPerPage] = useState(5);

  const paginatedPerformance = performance.slice(
    (performancePage - 1) * performanceItemsPerPage,
    performancePage * performanceItemsPerPage
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Evaluation & KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>KPI Score</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPerformance.map((perf) => (
                <TableRow key={perf.id}>
                  <TableCell className="font-medium">{perf.employeeName}</TableCell>
                  <TableCell>{perf.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${perf.kpi}%` }}
                        />
                      </div>
                      {perf.kpi}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {perf.rating}/5
                    </Badge>
                  </TableCell>
                  <TableCell>{perf.reviewDate}</TableCell>
                  <TableCell className="max-w-xs truncate">{perf.feedback}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {performance.length > 0 && (
            <Pagination
              currentPage={performancePage}
              totalPages={Math.ceil(performance.length / performanceItemsPerPage)}
              totalItems={performance.length}
              itemsPerPage={performanceItemsPerPage}
              onPageChange={setPerformancePage}
              onItemsPerPageChange={setPerformanceItemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTab;