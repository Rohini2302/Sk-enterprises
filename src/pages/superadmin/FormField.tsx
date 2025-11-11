// src/components/hrms/shared/FormField.tsx
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
  required?: boolean;
}

const FormField = ({ label, id, children, required = false }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export default FormField;