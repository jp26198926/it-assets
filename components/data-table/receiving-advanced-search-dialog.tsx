"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { ReceivingFilters } from "@/lib/types/receiving";

interface ReceivingAdvancedSearchDialogProps {
  onSearch: (filters: ReceivingFilters) => void;
  onClear: () => void;
}

export function ReceivingAdvancedSearchDialog({
  onSearch,
  onClear,
}: ReceivingAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchPoNumber, setSearchPoNumber] = useState("");
  const [searchInvoiceNumber, setSearchInvoiceNumber] = useState("");
  const [searchSupplierId, setSearchSupplierId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && suppliers.length === 0) {
      import("@/lib/actions/supplier-actions").then(({ getSuppliers }) => {
        getSuppliers().then((data) => {
          setSuppliers(data.map((s) => ({ id: s.id, name: s.name })).sort((a, b) => a.name.localeCompare(b.name)));
        });
      }).catch(() => {});
    }
  }, [open, suppliers.length]);

  const handleSearch = () => {
    const filters: ReceivingFilters = {};
    if (searchCode) filters.code = searchCode;
    if (searchPoNumber) filters.po_number = searchPoNumber;
    if (searchInvoiceNumber) filters.invoice_number = searchInvoiceNumber;
    if (searchSupplierId) filters.supplier_id = searchSupplierId;
    if (searchStatus) filters.status = searchStatus;
    if (searchDateFrom) filters.date_from = searchDateFrom;
    if (searchDateTo) filters.date_to = searchDateTo;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchCode("");
    setSearchPoNumber("");
    setSearchInvoiceNumber("");
    setSearchSupplierId("");
    setSearchStatus("");
    setSearchDateFrom("");
    setSearchDateTo("");
    onClear();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Search className="mr-1 h-4 w-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search across multiple fields directly in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-code">Code</Label>
              <Input
                id="search-code"
                placeholder="e.g., RCV00001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-po">PO Number</Label>
              <Input
                id="search-po"
                placeholder="e.g., PO-001"
                value={searchPoNumber}
                onChange={(e) => setSearchPoNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-invoice">Invoice No</Label>
              <Input
                id="search-invoice"
                placeholder="e.g., INV-001"
                value={searchInvoiceNumber}
                onChange={(e) => setSearchInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <SearchableSelect
                value={searchSupplierId}
                onValueChange={setSearchSupplierId}
                options={suppliers}
                placeholder="All Suppliers"
                searchPlaceholder="Search suppliers..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-date-from">Date From</Label>
              <Input
                id="search-date-from"
                type="date"
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-date-to">Date To</Label>
              <Input
                id="search-date-to"
                type="date"
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-status">Status</Label>
            <SearchableSelect
              value={searchStatus}
              onValueChange={setSearchStatus}
              options={[
                { id: "Active", name: "Active" },
                { id: "Completed", name: "Completed" },
                { id: "Cancelled", name: "Cancelled" },
              ]}
              placeholder="All Statuses"
              searchPlaceholder="Search statuses..."
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSearch}>
            <Search className="mr-1 h-4 w-4" />
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
