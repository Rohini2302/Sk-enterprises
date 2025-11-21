// src/components/hrms/tabs/OnboardingTab.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Upload, Trash2, Camera, Download, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { Employee, SalaryStructure, NewEmployeeForm } from "./types";
import FormField from "./FormField";

interface OnboardingTabProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  salaryStructures: SalaryStructure[];
  setSalaryStructures: React.Dispatch<React.SetStateAction<SalaryStructure[]>>;
  newJoinees: Employee[];
  setNewJoinees: React.Dispatch<React.SetStateAction<Employee[]>>;
  leftEmployees: Employee[];
  setLeftEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
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
  setSalaryStructures,
  newJoinees,
  setNewJoinees,
  leftEmployees,
  setLeftEmployees
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
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      }
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Cannot access camera. Please check permissions and try again.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 with compression
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const useCapturedPhoto = () => {
    if (capturedImage) {
      // Convert base64 to file
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'employee-photo.jpg', { type: 'image/jpeg' });
          setNewEmployee({...newEmployee, photo: file});
          toast.success("Photo captured successfully!");
        })
        .catch(error => {
          console.error("Error converting photo:", error);
          toast.error("Error processing photo. Please try again.");
        });
    }
    stopCamera();
    setShowCamera(false);
    setCapturedImage(null);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Compress image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Set max dimensions
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let { width, height } = img;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { 
                  type: 'image/jpeg', 
                  lastModified: Date.now() 
                });
                setNewEmployee({...newEmployee, photo: compressedFile});
                toast.success("Photo uploaded and compressed successfully!");
              }
            }, 'image/jpeg', 0.8);
          }
        };
        img.onerror = () => {
          toast.error("Error loading image. Please try another file.");
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        toast.error("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

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
      photo: newEmployee.photo,
      documents: uploadedDocuments.map((doc, index) => ({
        id: index + 1,
        type: doc.name.split('.')[0],
        name: doc.name,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: "2025-12-31",
        status: "valid" as const
      })),
      // Additional fields for forms
      siteName: newEmployee.siteName,
      dateOfBirth: newEmployee.dateOfBirth,
      bloodGroup: newEmployee.bloodGroup,
      permanentAddress: newEmployee.permanentAddress,
      bankName: newEmployee.bankName,
      accountNumber: newEmployee.accountNumber,
      ifscCode: newEmployee.ifscCode,
      fatherName: newEmployee.fatherName,
      motherName: newEmployee.motherName,
      spouseName: newEmployee.spouseName,
      emergencyContactName: newEmployee.emergencyContactName,
      emergencyContactPhone: newEmployee.emergencyContactPhone,
      nomineeName: newEmployee.nomineeName,
      nomineeRelation: newEmployee.nomineeRelation,
      pantSize: newEmployee.pantSize,
      shirtSize: newEmployee.shirtSize,
      capSize: newEmployee.capSize
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
    setNewJoinees([...newJoinees, employee]);
    
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

  const handleMarkAsLeft = (employee: Employee) => {
    const updatedEmployees = employees.filter(emp => emp.id !== employee.id);
    const updatedNewJoinees = newJoinees.filter(emp => emp.id !== employee.id);
    const leftEmployee = { ...employee, status: "left" as const, exitDate: new Date().toISOString().split('T')[0] };
    
    setEmployees(updatedEmployees);
    setNewJoinees(updatedNewJoinees);
    setLeftEmployees([...leftEmployees, leftEmployee]);
    toast.success("Employee marked as left");
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      const updatedEmployees = employees.filter(emp => emp.id !== employee.id);
      const updatedNewJoinees = newJoinees.filter(emp => emp.id !== employee.id);
      const updatedLeftEmployees = leftEmployees.filter(emp => emp.id !== employee.id);
      
      setEmployees(updatedEmployees);
      setNewJoinees(updatedNewJoinees);
      setLeftEmployees(updatedLeftEmployees);
      toast.success("Employee deleted successfully");
    }
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

  // Form generation functions
  const generateIDCard = (employee: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to generate ID card");
      return;
    }

    const photoUrl = employee.photo ? URL.createObjectURL(employee.photo) : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Card - ${employee.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .id-card {
              width: 350px;
              background: white;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              overflow: hidden;
              border: 2px solid #e11d48;
            }
            .header {
              background: linear-gradient(135deg, #e11d48, #be123c);
              color: white;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header .subtitle {
              font-size: 12px;
              opacity: 0.9;
            }
            .photo-section {
              padding: 20px;
              text-align: center;
              background: white;
            }
            .employee-photo {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              border: 3px solid #e11d48;
              object-fit: cover;
              margin: 0 auto;
            }
            .details {
              padding: 20px;
              background: white;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 4px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
            }
            .value {
              color: #333;
              font-size: 12px;
            }
            .footer {
              background: #f8f9fa;
              padding: 15px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .signature {
              margin-top: 10px;
              border-top: 1px solid #ccc;
              padding-top: 5px;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { background: white; }
              .id-card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <h1>SK ENTERPRISES</h1>
              <div class="subtitle">ID CARD</div>
            </div>
            <div class="photo-section">
              ${photoUrl ? `<img src="${photoUrl}" alt="Employee Photo" class="employee-photo" />` : '<div class="employee-photo" style="background: #ccc; display: flex; align-items: center; justify-content: center; color: #666;">No Photo</div>'}
            </div>
            <div class="details">
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${employee.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Employee ID:</span>
                <span class="value">${employee.employeeId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Department:</span>
                <span class="value">${employee.department}</span>
              </div>
              <div class="detail-row">
                <span class="label">Position:</span>
                <span class="value">${employee.position}</span>
              </div>
              <div class="detail-row">
                <span class="label">Blood Group:</span>
                <span class="value">${employee.bloodGroup || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Join Date:</span>
                <span class="value">${employee.joinDate}</span>
              </div>
            </div>
            <div class="footer">
              <div>Authorized Signature</div>
              <div class="signature">This card is property of SK Enterprises</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadIDCard = (employee: Employee) => {
    generateIDCard(employee);
    toast.success(`ID Card downloaded for ${employee.name}`);
  };

  const downloadNomineeForm = (employee: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to generate forms");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nominee Form - ${employee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .form-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { background: #f0f0f0; padding: 10px; font-weight: bold; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; display: inline-block; width: 200px; }
            .signature-area { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="form-container">
            <div class="header">
              <h2>SK ENTERPRISES</h2>
              <h3>Nomination Form for Provident Fund</h3>
            </div>
            
            <div class="section">
              <div class="section-title">Employee Details</div>
              <div class="field"><span class="label">Name:</span> ${employee.name}</div>
              <div class="field"><span class="label">Employee ID:</span> ${employee.employeeId}</div>
              <div class="field"><span class="label">UAN Number:</span> ${employee.uan}</div>
              <div class="field"><span class="label">Department:</span> ${employee.department}</div>
            </div>

            <div class="section">
              <div class="section-title">Nominee Details</div>
              <div class="field"><span class="label">Nominee Name:</span> ${employee.nomineeName || '________________'}</div>
              <div class="field"><span class="label">Relationship:</span> ${employee.nomineeRelation || '________________'}</div>
              <div class="field"><span class="label">Date of Birth:</span> ________________</div>
              <div class="field"><span class="label">Address:</span> ________________</div>
              <div class="field"><span class="label">Share Percentage:</span> ________________</div>
            </div>

            <div class="section">
              <div class="section-title">Guardian Details (if nominee is minor)</div>
              <div class="field"><span class="label">Guardian Name:</span> ________________</div>
              <div class="field"><span class="label">Relationship:</span> ________________</div>
              <div class="field"><span class="label">Address:</span> ________________</div>
            </div>

            <div class="signature-area">
              <div class="field">
                <span class="label">Employee Signature:</span> ________________
              </div>
              <div class="field">
                <span class="label">Date:</span> ________________
              </div>
              <div class="field">
                <span class="label">Employer Signature:</span> ________________
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(`Nominee Form generated for ${employee.name}`);
  };

  const downloadPFForm = (employee: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to generate forms");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PF Declaration Form - ${employee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .form-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { background: #f0f0f0; padding: 10px; font-weight: bold; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; display: inline-block; width: 250px; }
            .signature-area { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; }
            .declaration { margin: 20px 0; padding: 15px; border: 1px solid #000; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="form-container">
            <div class="header">
              <h2>SK ENTERPRISES</h2>
              <h3>Provident Fund Declaration Form</h3>
            </div>
            
            <div class="section">
              <div class="section-title">Employee Information</div>
              <div class="field"><span class="label">Full Name:</span> ${employee.name}</div>
              <div class="field"><span class="label">Employee ID:</span> ${employee.employeeId}</div>
              <div class="field"><span class="label">UAN Number:</span> ${employee.uan}</div>
              <div class="field"><span class="label">Date of Joining:</span> ${employee.joinDate}</div>
              <div class="field"><span class="label">Department:</span> ${employee.department}</div>
              <div class="field"><span class="label">Designation:</span> ${employee.position}</div>
              <div class="field"><span class="label">Basic Salary:</span> ₹${employee.salary}</div>
            </div>

            <div class="section">
              <div class="section-title">Previous PF Details (if any)</div>
              <div class="field"><span class="label">Previous UAN:</span> ________________</div>
              <div class="field"><span class="label">Previous Employer:</span> ________________</div>
              <div class="field"><span class="label">PF Account Number:</span> ________________</div>
            </div>

            <div class="section">
              <div class="section-title">Bank Account Details</div>
              <div class="field"><span class="label">Bank Name:</span> ${employee.bankName || '________________'}</div>
              <div class="field"><span class="label">Account Number:</span> ${employee.accountNumber || '________________'}</div>
              <div class="field"><span class="label">IFSC Code:</span> ${employee.ifscCode || '________________'}</div>
            </div>

            <div class="declaration">
              <p><strong>Declaration:</strong></p>
              <p>I hereby declare that the information provided above is true and correct to the best of my knowledge. I agree to contribute to the Provident Fund as per the rules and regulations.</p>
            </div>

            <div class="signature-area">
              <div class="field">
                <span class="label">Employee Signature:</span> ________________
              </div>
              <div class="field">
                <span class="label">Date:</span> ________________
              </div>
              <div class="field">
                <span class="label">Witness Signature:</span> ________________
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(`PF Form generated for ${employee.name}`);
  };

  const downloadESICForm = (employee: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to generate forms");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ESIC Form - ${employee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .form-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { background: #f0f0f0; padding: 10px; font-weight: bold; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; display: inline-block; width: 250px; }
            .signature-area { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; }
            .family-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .family-table th, .family-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="form-container">
            <div class="header">
              <h2>SK ENTERPRISES</h2>
              <h3>ESIC Family Declaration Form</h3>
            </div>
            
            <div class="section">
              <div class="section-title">Employee Details</div>
              <div class="field"><span class="label">Name:</span> ${employee.name}</div>
              <div class="field"><span class="label">ESIC Number:</span> ${employee.esicNumber}</div>
              <div class="field"><span class="label">Employee ID:</span> ${employee.employeeId}</div>
              <div class="field"><span class="label">Date of Birth:</span> ${employee.dateOfBirth || '________________'}</div>
              <div class="field"><span class="label">Gender:</span> ________________</div>
              <div class="field"><span class="label">Marital Status:</span> ________________</div>
            </div>

            <div class="section">
              <div class="section-title">Family Details</div>
              <table class="family-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Relationship</th>
                    <th>Date of Birth</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  ${employee.fatherName ? `<tr><td>${employee.fatherName}</td><td>Father</td><td>________________</td><td>________________</td></tr>` : ''}
                  ${employee.motherName ? `<tr><td>${employee.motherName}</td><td>Mother</td><td>________________</td><td>________________</td></tr>` : ''}
                  ${employee.spouseName ? `<tr><td>${employee.spouseName}</td><td>Spouse</td><td>________________</td><td>________________</td></tr>` : ''}
                  ${employee.numberOfChildren ? Array(parseInt(employee.numberOfChildren) || 0).fill(0).map((_, i) => 
                    `<tr><td>________________</td><td>Child ${i + 1}</td><td>________________</td><td>________________</td></tr>`
                  ).join('') : ''}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Nominee for Dependants Benefit</div>
              <div class="field"><span class="label">Nominee Name:</span> ${employee.nomineeName || '________________'}</div>
              <div class="field"><span class="label">Relationship:</span> ${employee.nomineeRelation || '________________'}</div>
              <div class="field"><span class="label">Address:</span> ________________</div>
            </div>

            <div class="signature-area">
              <div class="field">
                <span class="label">Employee Signature:</span> ________________
              </div>
              <div class="field">
                <span class="label">Date:</span> ________________
              </div>
              <div class="field">
                <span class="label">Employer Signature:</span> ________________
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(`ESIC Form generated for ${employee.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Capture Photo</h3>
              <Button variant="ghost" size="sm" onClick={() => { setShowCamera(false); stopCamera(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              {!capturedImage ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-64 bg-gray-100 rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={() => { setShowCamera(false); stopCamera(); }}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={useCapturedPhoto} className="flex-1">
                      Use This Photo
                    </Button>
                    <Button variant="outline" onClick={retakePhoto}>
                      Retake Photo
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Digital Onboarding & Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header Section */}
          <div className="border-2 border-gray-300 p-4 md:p-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-center mb-4">
                  <div className="text-xl md:text-2xl font-bold">SK ENTERPRISES</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Housekeeping • Parking • Waste Management</div>
                  <div className="text-lg font-semibold mt-2">Employee Joining Form</div>
                </div>
                
                <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                  <div className="border-2 border-dashed border-gray-400 w-20 h-24 md:w-24 md:h-32 flex items-center justify-center text-xs text-muted-foreground text-center p-2 mx-auto md:mx-0">
                    {newEmployee.photo ? (
                      <img 
                        src={URL.createObjectURL(newEmployee.photo)} 
                        alt="Employee" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "Photo"
                    )}
                  </div>
                  
                  <div className="text-center md:text-right space-y-2 w-full md:w-auto">
                    <div className="text-sm font-semibold">New Joining</div>
                    <div className="text-sm">
                      Code No. / Ref No.: <span className="border-b border-gray-400 inline-block min-w-[100px]">SK-___________</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:gap-8">
            {/* Employee Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Employee Details</h3>
              
              {/* Photo Upload Section */}
              <div className="space-y-4">
                <Label>Employee Photo</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={startCamera}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {newEmployee.photo && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-green-600">Photo selected</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewEmployee({...newEmployee, photo: null})}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                  rows={3}
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                  rows={3}
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              </div>
            </div>

            {/* Signatures Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Signatures</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <FormField label="Employee Signature" id="employeeSignature">
                    <div className="border-2 border-dashed rounded-lg p-4 md:p-6 text-center">
                      <FileText className="mx-auto h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
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
                    <div className="border-2 border-dashed rounded-lg p-4 md:p-6 text-center">
                      <FileText className="mx-auto h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
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
              
              <div className="border-2 border-dashed rounded-lg p-4 md:p-6 text-center">
                <Upload className="mx-auto h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
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
                <div className="text-sm text-muted-foreground space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1">
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

            <Button onClick={handleAddEmployee} className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {employee.photo ? (
                      <img 
                        src={URL.createObjectURL(employee.photo)} 
                        alt={employee.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{employee.name}</h4>
                        {employee.status === "left" && (
                          <Badge variant="destructive">Left</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{employee.employeeId} • {employee.department}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateIDCard(employee)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View ID
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadIDCard(employee)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      ID Card
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadNomineeForm(employee)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Nominee Form
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPFForm(employee)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PF Form
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadESICForm(employee)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      ESIC Form
                    </Button>
                    
                    {employee.status !== "left" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsLeft(employee)}
                      >
                        Mark as Left
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteEmployee(employee)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {employees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No employees found. Add your first employee above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTab;