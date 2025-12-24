import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { ReactNode } from "react";

export const FormField = ({ label, id, children, required = false }: {
  label: string;
  id: string;
  children: ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export const SearchBar = ({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="mb-4">
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
);