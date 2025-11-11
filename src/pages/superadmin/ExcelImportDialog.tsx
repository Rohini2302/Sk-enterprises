// src/components/hrms/shared/ExcelImportDialog.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, Upload } from "lucide-react";

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => void;
}

const ExcelImportDialog = ({ open, onOpenChange, onImport }: ExcelImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (file) {
      onImport(file);
      setFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Employees from Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Sheet className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Upload Excel/CSV file with employee data
            </p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <Label htmlFor="excel-upload">
              <Button variant="outline" className="mt-4" asChild>
                <span>Choose File</span>
              </Button>
            </Label>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Expected CSV Format:</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Columns: name, email, phone, aadharNumber, department, position, salary</div>
              <div>• First row should be headers</div>
              <div>• File should be UTF-8 encoded</div>
            </div>
          </div>
          
          <Button 
            onClick={handleImport} 
            disabled={!file}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Employees
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;