"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getItemSelectOptions,
  uploadItemImage,
} from "@/lib/actions/item-actions";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import type { Item, CreateItemInput } from "@/lib/types/item";

interface ItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  onSubmit: (data: CreateItemInput) => Promise<void>;
}

const defaultFormData: CreateItemInput = {
  name: "",
  category_id: undefined,
  brand: "",
  model: "",
  description: "",
  uom_id: undefined,
  minimum_stock: 0,
  image_url: "",
};

export function ItemFormModal({
  open,
  onOpenChange,
  item,
  onSubmit,
}: ItemFormModalProps) {
  const [formData, setFormData] = useState<CreateItemInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [uoms, setUoms] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setOptionsLoading(true);
      getItemSelectOptions()
        .then((options) => {
          setCategories(options.categories);
          setUoms(options.uoms);
        })
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category_id: item.category_id || undefined,
        brand: item.brand || "",
        model: item.model || "",
        description: item.description || "",
        uom_id: item.uom_id || undefined,
        minimum_stock: item.minimum_stock,
        image_url: item.image_url || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [item, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadItemImage(base64, file.name);
      if (result.success && result.url) {
        setFormData({ ...formData, image_url: result.url });
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
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
          category_id: formData.category_id || undefined,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          description: formData.description || undefined,
          uom_id: formData.uom_id || undefined,
          image_url: formData.image_url || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save item" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Update the item information below."
              : "Fill in the details to add a new item."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="item-form"
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto min-h-0"
        >
          {item && (
            <div className="space-y-2">
              <Label htmlFor="item_code">
                Item Code: {item.item_code || ""}
              </Label>
              {/* <Input
                id="item_code"
                value={item.item_code || ""}
                disabled
                className="font-mono bg-muted"
              /> */}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Laptop, Mouse, Monitor"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category_id: value === "none" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      optionsLoading ? "Loading..." : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uom">Unit of Measurement</Label>
              <Select
                value={formData.uom_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    uom_id: value === "none" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={optionsLoading ? "Loading..." : "Select UOM"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No UOM</SelectItem>
                  {uoms.map((uom) => (
                    <SelectItem key={uom.id} value={uom.id}>
                      {uom.code} - {uom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g., Dell, Logitech"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model || ""}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="e.g., Latitude 5520, M185"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Minimum Stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum_stock: Number(e.target.value),
                  })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image_url"
                value={formData.image_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.png"
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description..."
              rows={3}
              className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          <Button type="submit" form="item-form" disabled={loading}>
            {loading ? "Saving..." : item ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
