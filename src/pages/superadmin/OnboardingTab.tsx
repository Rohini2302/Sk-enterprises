// src/components/hrms/tabs/OnboardingTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Employee, SalaryStructure, NewEmployeeForm } from "./types";
import FormField from "./FormField";

interface OnboardingTabProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  salaryStructures: SalaryStructure[];
  setSalaryStructures: React.Dispatch<React.SetStateAction<SalaryStructure[]>>;
}

const departments = [
  "Housekeeping Management", 
  "Security Management", 
  "Parking Management", 
  "Waste Management", 
  "STP Tank Cleaning", 
  "Consumables Management"
];

const OnboardingTab = ({ 
  employees, 
  setEmployees, 
  salaryStructures, 
  setSalaryStructures 
}: OnboardingTabProps) => {
  const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>({
    name: "",
    email: "",
    phone: "",
    aadharNumber: "",
    department: "",
    position: "",
    salary: "",
    photo: null,
    siteName: "",
    dateOfBirth: "",
    dateOfJoining: "",
    dateOfExit: "",
    bloodGroup: "",
    permanentAddress: "",
    permanentPincode: "",
    localAddress: "",
    localPincode: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    numberOfChildren: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    nomineeName: "",
    nomineeRelation: "",
    pantSize: "",
    shirtSize: "",
    capSize: "",
    idCardIssued: false,
    westcoatIssued: false,
    apronIssued: false,
    employeeSignature: null,
    authorizedSignature: null
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.aadharNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    const employee: Employee = {
      id: employees.length + 1,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      aadharNumber: newEmployee.aadharNumber,
      department: newEmployee.department,
      position: newEmployee.position,
      joinDate: newEmployee.dateOfJoining || new Date().toISOString().split('T')[0],
      status: "active",
      salary: Number(newEmployee.salary),
      uan: `1012345678${String(employees.length + 1).padStart(2, '0')}`,
      esicNumber: `2312345678${String(employees.length + 1).padStart(2, '0')}`,
      documents: uploadedDocuments.map((doc, index) => ({
        id: index + 1,
        type: doc.name.split('.')[0],
        name: doc.name,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: "2025-12-31",
        status: "valid" as const
      }))
    };

    const defaultSalaryStructure: SalaryStructure = {
      id: salaryStructures.length + 1,
      employeeId: employee.employeeId,
      basic: Number(newEmployee.salary) * 0.7,
      hra: Number(newEmployee.salary) * 0.2,
      da: Number(newEmployee.salary) * 0.15,
      conveyance: 1600,
      medical: 1250,
      specialAllowance: Number(newEmployee.salary) * 0.2,
      otherAllowances: Number(newEmployee.salary) * 0.1,
      pf: Number(newEmployee.salary) * 0.12,
      esic: Number(newEmployee.salary) * 0.0075,
      professionalTax: 200,
      tds: 0,
      otherDeductions: 0,
      workingDays: 26,
      paidDays: 26,
      lopDays: 0
    };

    setEmployees([...employees, employee]);
    setSalaryStructures([...salaryStructures, defaultSalaryStructure]);
    
    // Reset form
    setNewEmployee({
      name: "", email: "", phone: "", aadharNumber: "", department: "", position: "", salary: "",
      photo: null, siteName: "", dateOfBirth: "", dateOfJoining: "", dateOfExit: "", bloodGroup: "",
      permanentAddress: "", permanentPincode: "", localAddress: "", localPincode: "", bankName: "",
      accountNumber: "", ifscCode: "", branchName: "", fatherName: "", motherName: "", spouseName: "",
      numberOfChildren: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
      nomineeName: "", nomineeRelation: "", pantSize: "", shirtSize: "", capSize: "", idCardIssued: false,
      westcoatIssued: false, apronIssued: false, employeeSignature: null, authorizedSignature: null
    });
    setUploadedDocuments([]);
    toast.success("Employee added successfully!");
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files);
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      toast.success(`${newDocuments.length} document(s) uploaded successfully!`);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSignatureUpload = (type: 'employee' | 'authorized', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'employee') {
        setNewEmployee({...newEmployee, employeeSignature: file});
      } else {
        setNewEmployee({...newEmployee, authorizedSignature: file});
      }
      toast.success(`${type === 'employee' ? 'Employee' : 'Authorized'} signature uploaded successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Digital Onboarding & Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header Section */}
          <div className="border-2 border-gray-300 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">SK ENTERPRISES</div>
                  <div className="text-sm text-muted-foreground">Housekeeping • Parking • Waste Management</div>
                  <div className="text-lg font-semibold mt-2">Employee Joining Form</div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="border-2 border-dashed border-gray-400 w-24 h-32 flex items-center justify-center text-xs text-muted-foreground text-center p-2">
                    Photo
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="text-sm font-semibold">New Joining</div>
                    <div className="text-sm">
                      Code No. / Ref No.: <span className="border-b border-gray-400 inline-block min-w-[100px]">SK-___________</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Employee Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Employee Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Site Name" id="siteName">
                  <Input
                    id="siteName"
                    value={newEmployee.siteName}
                    onChange={(e) => setNewEmployee({...newEmployee, siteName: e.target.value})}
                    placeholder="Enter site name"
                  />
                </FormField>
                
                <FormField label="Name" id="name" required>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                </FormField>
                
                <FormField label="Date of Birth" id="dateOfBirth">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newEmployee.dateOfBirth}
                    onChange={(e) => setNewEmployee({...newEmployee, dateOfBirth: e.target.value})}
                  />
                </FormField>
                
                <FormField label="Date of Joining" id="dateOfJoining">
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={newEmployee.dateOfJoining}
                    onChange={(e) => setNewEmployee({...newEmployee, dateOfJoining: e.target.value})}
                  />
                </FormField>
                
                <FormField label="Date of Exit" id="dateOfExit">
                  <Input
                    id="dateOfExit"
                    type="date"
                    value={newEmployee.dateOfExit}
                    onChange={(e) => setNewEmployee({...newEmployee, dateOfExit: e.target.value})}
                  />
                </FormField>
                
                <FormField label="Contact No." id="phone">
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </FormField>
                
                <FormField label="Blood Group" id="bloodGroup">
                  <Input
                    id="bloodGroup"
                    value={newEmployee.bloodGroup}
                    onChange={(e) => setNewEmployee({...newEmployee, bloodGroup: e.target.value})}
                    placeholder="Enter blood group"
                  />
                </FormField>
                
                <FormField label="Email" id="email" required>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </FormField>
                
                <FormField label="Aadhar Number" id="aadharNumber" required>
                  <Input
                    id="aadharNumber"
                    value={newEmployee.aadharNumber}
                    onChange={(e) => setNewEmployee({...newEmployee, aadharNumber: e.target.value})}
                    placeholder="Enter Aadhar number"
                    required
                  />
                </FormField>
              </div>
              
              <FormField label="Permanent Address" id="permanentAddress">
                <Textarea
                  id="permanentAddress"
                  value={newEmployee.permanentAddress}
                  onChange={(e) => setNewEmployee({...newEmployee, permanentAddress: e.target.value})}
                  placeholder="Enter permanent address"
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Pin Code" id="permanentPincode">
                  <Input
                    id="permanentPincode"
                    value={newEmployee.permanentPincode}
                    onChange={(e) => setNewEmployee({...newEmployee, permanentPincode: e.target.value})}
                    placeholder="Enter pin code"
                  />
                </FormField>
              </div>
              
              <FormField label="Local Address" id="localAddress">
                <Textarea
                  id="localAddress"
                  value={newEmployee.localAddress}
                  onChange={(e) => setNewEmployee({...newEmployee, localAddress: e.target.value})}
                  placeholder="Enter local address"
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Pin Code" id="localPincode">
                  <Input
                    id="localPincode"
                    value={newEmployee.localPincode}
                    onChange={(e) => setNewEmployee({...newEmployee, localPincode: e.target.value})}
                    placeholder="Enter pin code"
                  />
                </FormField>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Bank Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Bank Name" id="bankName">
                  <Input
                    id="bankName"
                    value={newEmployee.bankName}
                    onChange={(e) => setNewEmployee({...newEmployee, bankName: e.target.value})}
                    placeholder="Enter bank name"
                  />
                </FormField>
                
                <FormField label="Account Number" id="accountNumber">
                  <Input
                    id="accountNumber"
                    value={newEmployee.accountNumber}
                    onChange={(e) => setNewEmployee({...newEmployee, accountNumber: e.target.value})}
                    placeholder="Enter account number"
                  />
                </FormField>
                
                <FormField label="IFSC Code" id="ifscCode">
                  <Input
                    id="ifscCode"
                    value={newEmployee.ifscCode}
                    onChange={(e) => setNewEmployee({...newEmployee, ifscCode: e.target.value})}
                    placeholder="Enter IFSC code"
                  />
                </FormField>
                
                <FormField label="Branch Name" id="branchName">
                  <Input
                    id="branchName"
                    value={newEmployee.branchName}
                    onChange={(e) => setNewEmployee({...newEmployee, branchName: e.target.value})}
                    placeholder="Enter branch name"
                  />
                </FormField>
              </div>
            </div>

            {/* Family Details for ESIC Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Family Details for ESIC</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Father's Name" id="fatherName">
                  <Input
                    id="fatherName"
                    value={newEmployee.fatherName}
                    onChange={(e) => setNewEmployee({...newEmployee, fatherName: e.target.value})}
                    placeholder="Enter father's name"
                  />
                </FormField>
                
                <FormField label="Mother's Name" id="motherName">
                  <Input
                    id="motherName"
                    value={newEmployee.motherName}
                    onChange={(e) => setNewEmployee({...newEmployee, motherName: e.target.value})}
                    placeholder="Enter mother's name"
                  />
                </FormField>
                
                <FormField label="Spouse Name" id="spouseName">
                  <Input
                    id="spouseName"
                    value={newEmployee.spouseName}
                    onChange={(e) => setNewEmployee({...newEmployee, spouseName: e.target.value})}
                    placeholder="Enter spouse name"
                  />
                </FormField>
                
                <FormField label="Number of Children" id="numberOfChildren">
                  <Input
                    id="numberOfChildren"
                    type="number"
                    value={newEmployee.numberOfChildren}
                    onChange={(e) => setNewEmployee({...newEmployee, numberOfChildren: e.target.value})}
                    placeholder="Enter number of children"
                  />
                </FormField>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Emergency Contact Name" id="emergencyContactName">
                  <Input
                    id="emergencyContactName"
                    value={newEmployee.emergencyContactName}
                    onChange={(e) => setNewEmployee({...newEmployee, emergencyContactName: e.target.value})}
                    placeholder="Enter emergency contact name"
                  />
                </FormField>
                
                <FormField label="Emergency Contact Phone" id="emergencyContactPhone">
                  <Input
                    id="emergencyContactPhone"
                    value={newEmployee.emergencyContactPhone}
                    onChange={(e) => setNewEmployee({...newEmployee, emergencyContactPhone: e.target.value})}
                    placeholder="Enter emergency contact phone"
                  />
                </FormField>
                
                <FormField label="Relation" id="emergencyContactRelation">
                  <Input
                    id="emergencyContactRelation"
                    value={newEmployee.emergencyContactRelation}
                    onChange={(e) => setNewEmployee({...newEmployee, emergencyContactRelation: e.target.value})}
                    placeholder="Enter relation"
                  />
                </FormField>
              </div>
            </div>

            {/* Nominee Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Nominee Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nominee Name" id="nomineeName">
                  <Input
                    id="nomineeName"
                    value={newEmployee.nomineeName}
                    onChange={(e) => setNewEmployee({...newEmployee, nomineeName: e.target.value})}
                    placeholder="Enter nominee name"
                  />
                </FormField>
                
                <FormField label="Nominee Relation" id="nomineeRelation">
                  <Input
                    id="nomineeRelation"
                    value={newEmployee.nomineeRelation}
                    onChange={(e) => setNewEmployee({...newEmployee, nomineeRelation: e.target.value})}
                    placeholder="Enter nominee relation"
                  />
                </FormField>
              </div>
            </div>

            {/* Uniform Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Uniform Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Pant Size" id="pantSize">
                  <Select value={newEmployee.pantSize} onValueChange={(value) => setNewEmployee({...newEmployee, pantSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pant size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28">28</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="34">34</SelectItem>
                      <SelectItem value="36">36</SelectItem>
                      <SelectItem value="38">38</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Shirt Size" id="shirtSize">
                  <Select value={newEmployee.shirtSize} onValueChange={(value) => setNewEmployee({...newEmployee, shirtSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shirt size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Cap Size" id="capSize">
                  <Select value={newEmployee.capSize} onValueChange={(value) => setNewEmployee({...newEmployee, capSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cap size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="idCardIssued"
                    checked={newEmployee.idCardIssued}
                    onChange={(e) => setNewEmployee({...newEmployee, idCardIssued: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="idCardIssued">ID Card Issued</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="westcoatIssued"
                    checked={newEmployee.westcoatIssued}
                    onChange={(e) => setNewEmployee({...newEmployee, westcoatIssued: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="westcoatIssued">Westcoat Issued</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="apronIssued"
                    checked={newEmployee.apronIssued}
                    onChange={(e) => setNewEmployee({...newEmployee, apronIssued: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="apronIssued">Apron Issued</Label>
                </div>
              </div>
            </div>

            {/* Employment Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Employment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Department" id="department">
                  <Select 
                    value={newEmployee.department} 
                    onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Position" id="position">
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    placeholder="Enter position"
                  />
                </FormField>
                
                <FormField label="Monthly Salary (₹)" id="salary">
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                    placeholder="Enter monthly salary"
                  />
                </FormField>
                
                <FormField label="Upload Photo" id="photo">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewEmployee({...newEmployee, photo: e.target.files?.[0] || null})}
                  />
                </FormField>
              </div>
            </div>

            {/* Signatures Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Signatures</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField label="Employee Signature" id="employeeSignature">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Upload employee signature
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload('employee', e)}
                        className="hidden"
                        id="employee-signature-upload"
                      />
                      <Label htmlFor="employee-signature-upload">
                        <Button variant="outline" className="mt-4" asChild>
                          <span>Upload Signature</span>
                        </Button>
                      </Label>
                      {newEmployee.employeeSignature && (
                        <p className="mt-2 text-sm text-green-600">
                          Signature uploaded
                        </p>
                      )}
                    </div>
                  </FormField>
                </div>
                
                <div className="space-y-4">
                  <FormField label="Authorized Signature" id="authorizedSignature">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Upload authorized signature
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload('authorized', e)}
                        className="hidden"
                        id="authorized-signature-upload"
                      />
                      <Label htmlFor="authorized-signature-upload">
                        <Button variant="outline" className="mt-4" asChild>
                          <span>Upload Signature</span>
                        </Button>
                      </Label>
                      {newEmployee.authorizedSignature && (
                        <p className="mt-2 text-sm text-green-600">
                          Signature uploaded
                        </p>
                      )}
                    </div>
                  </FormField>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Document Upload</h3>
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop documents here or click to browse
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                />
                <Label htmlFor="document-upload">
                  <Button variant="outline" className="mt-4" asChild>
                    <span>Browse Files</span>
                  </Button>
                </Label>
              </div>
              
              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents</Label>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveDocument(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Required Documents</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Aadhar Card</div>
                  <div>• PAN Card</div>
                  <div>• Educational Certificates</div>
                  <div>• Experience Letters</div>
                  <div>• Bank Details</div>
                  <div>• Passport Size Photo</div>
                  <div>• ESIC Family Details</div>
                </div>
              </div>
            </div>

            <Button onClick={handleAddEmployee} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTab;