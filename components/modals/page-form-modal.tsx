"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Settings,
  FileText,
  Users,
  Shield,
  Server,
  Database,
  LayoutDashboard,
  BarChart3,
  Package,
  MapPin,
  Bell,
  Mail,
  Calendar,
  Clock,
  Search,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Key,
  User,
  UserPlus,
  Building,
  Briefcase,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Wifi,
  Printer,
  Monitor,
  Laptop,
  HardDrive,
  type LucideIcon,
} from "lucide-react";
import type { Page, CreatePageInput } from "@/lib/types/page";

interface PageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: Page | null;
  pages: Page[];
  onSubmit: (data: CreatePageInput) => Promise<void>;
}

const iconOptions: { name: string; icon: LucideIcon }[] = [
  { name: "Home", icon: Home },
  { name: "Settings", icon: Settings },
  { name: "FileText", icon: FileText },
  { name: "Users", icon: Users },
  { name: "Shield", icon: Shield },
  { name: "Server", icon: Server },
  { name: "Database", icon: Database },
  { name: "LayoutDashboard", icon: LayoutDashboard },
  { name: "BarChart3", icon: BarChart3 },
  { name: "Package", icon: Package },
  { name: "MapPin", icon: MapPin },
  { name: "Bell", icon: Bell },
  { name: "Mail", icon: Mail },
  { name: "Calendar", icon: Calendar },
  { name: "Clock", icon: Clock },
  { name: "Search", icon: Search },
  { name: "Folder", icon: Folder },
  { name: "FolderOpen", icon: FolderOpen },
  { name: "File", icon: File },
  { name: "FileImage", icon: FileImage },
  { name: "FileVideo", icon: FileVideo },
  { name: "FileAudio", icon: FileAudio },
  { name: "Archive", icon: Archive },
  { name: "Download", icon: Download },
  { name: "Upload", icon: Upload },
  { name: "RefreshCw", icon: RefreshCw },
  { name: "Plus", icon: Plus },
  { name: "Edit", icon: Edit },
  { name: "Trash2", icon: Trash2 },
  { name: "Eye", icon: Eye },
  { name: "Lock", icon: Lock },
  { name: "Unlock", icon: Unlock },
  { name: "Key", icon: Key },
  { name: "User", icon: User },
  { name: "UserPlus", icon: UserPlus },
  { name: "Building", icon: Building },
  { name: "Briefcase", icon: Briefcase },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "CreditCard", icon: CreditCard },
  { name: "DollarSign", icon: DollarSign },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "TrendingDown", icon: TrendingDown },
  { name: "Activity", icon: Activity },
  { name: "Zap", icon: Zap },
  { name: "Wifi", icon: Wifi },
  { name: "Printer", icon: Printer },
  { name: "Monitor", icon: Monitor },
  { name: "Laptop", icon: Laptop },
  { name: "HardDrive", icon: HardDrive },
];

const defaultFormData: CreatePageInput = {
  name: "",
  description: "",
  path: "",
  icon: "Home",
  parent_id: "",
  section: "",
  order: 0,
};

export function PageFormModal({
  open,
  onOpenChange,
  page,
  pages,
  onSubmit,
}: PageFormModalProps) {
  const [formData, setFormData] = useState<CreatePageInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({
        name: page.name,
        description: page.description || "",
        path: page.path,
        icon: page.icon,
        parent_id: page.parent_id || "",
        section: page.section || "",
        order: page.order ?? 0,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [page, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.path) newErrors.path = "Path is required";
    if (!formData.icon) newErrors.icon = "Icon is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          ...formData,
          description: formData.description || undefined,
          parent_id: formData.parent_id || undefined,
          section: formData.section || undefined,
          order: formData.order ?? 0,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save page" });
      } finally {
        setLoading(false);
      }
    }
  };

  const getIcon = (iconName: string) => {
    const option = iconOptions.find((o) => o.name === iconName);
    return option ? option.icon : Home;
  };

  const SelectedIcon = getIcon(formData.icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{page ? "Edit Page" : "Add New Page"}</DialogTitle>
          <DialogDescription>
            {page
              ? "Update the page information below."
              : "Fill in the details to add a new page."}
          </DialogDescription>
        </DialogHeader>
        <form id="page-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Dashboard"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">Path *</Label>
              <Input
                id="path"
                value={formData.path}
                onChange={(e) =>
                  setFormData({ ...formData, path: e.target.value })
                }
                placeholder="e.g., /dashboard"
                className={errors.path ? "border-red-500" : ""}
              />
              {errors.path && (
                <p className="text-xs text-red-500">{errors.path}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon *</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) =>
                setFormData({ ...formData, icon: value })
              }
            >
              <SelectTrigger className={errors.icon ? "border-red-500" : ""}>
                <div className="flex items-center gap-2">
                  <SelectedIcon className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.name} value={option.name}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.icon && (
              <p className="text-xs text-red-500">{errors.icon}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first in sidebar</p>
            </div>
            <div className="space-y-2">
              <Label>Parent Page</Label>
              <Select
                value={formData.parent_id || "__none__"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parent_id: value === "__none__" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No parent (root level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No parent (root level)</SelectItem>
                  {pages
                    .filter((p) => p.id !== page?.id)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                id="section"
                value={formData.section || ""}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                placeholder="e.g., Administration"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this page..."
              rows={3}
            />
          </div>
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="page-form" disabled={loading}>
            {loading ? "Saving..." : page ? "Save Changes" : "Add Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
