"use client";

import { useState } from "react";
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
import type { TicketFilters } from "@/lib/types/ticket";

interface TicketAdvancedSearchDialogProps {
  onSearch: (filters: TicketFilters) => void;
  onClear: () => void;
  selectOptions?: {
    categories: { id: string; name: string }[];
    departments: { id: string; name: string }[];
  };
  buttonLabel?: string;
}

export function TicketAdvancedSearchDialog({
  onSearch,
  onClear,
  selectOptions,
  buttonLabel,
}: TicketAdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTicketNo, setSearchTicketNo] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPriority, setSearchPriority] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");

  const handleSearch = () => {
    const filters: TicketFilters = {};
    if (searchTicketNo) filters.ticket_no = searchTicketNo;
    if (searchTitle) filters.search = searchTitle;
    if (searchName) filters.name = searchName;
    if (searchEmail) filters.email = searchEmail;
    if (searchPriority) filters.priority = searchPriority;
    if (searchCategory) filters.category_id = searchCategory;
    if (searchStatus) filters.status = searchStatus;
    if (searchDepartment) filters.department_id = searchDepartment;
    if (searchDateFrom) filters.date_from = searchDateFrom;
    if (searchDateTo) filters.date_to = searchDateTo;

    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setSearchTicketNo("");
    setSearchTitle("");
    setSearchName("");
    setSearchEmail("");
    setSearchPriority("");
    setSearchCategory("");
    setSearchStatus("");
    setSearchDepartment("");
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
          {buttonLabel || "Advanced Search"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search across multiple fields directly in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-ticket-no">Ticket No</Label>
              <Input
                id="search-ticket-no"
                placeholder="TK-000001"
                value={searchTicketNo}
                onChange={(e) => setSearchTicketNo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-title">Title</Label>
              <Input
                id="search-title"
                placeholder="Ticket title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Name</Label>
              <Input
                id="search-name"
                placeholder="Requestor name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-email">Email</Label>
              <Input
                id="search-email"
                placeholder="Requestor email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-priority">Priority</Label>
              <SearchableSelect
                value={searchPriority}
                onValueChange={setSearchPriority}
                options={[
                  { id: "Low", name: "Low" },
                  { id: "Medium", name: "Medium" },
                  { id: "High", name: "High" },
                  { id: "Critical", name: "Critical" },
                ]}
                placeholder="All"
                searchPlaceholder="Search priorities..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-status">Status</Label>
              <SearchableSelect
                value={searchStatus}
                onValueChange={setSearchStatus}
                options={[
                  { id: "Open", name: "Open" },
                  { id: "In Progress", name: "In Progress" },
                  { id: "Resolved", name: "Resolved" },
                  { id: "Closed", name: "Closed" },
                ]}
                placeholder="All"
                searchPlaceholder="Search statuses..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-category">Category</Label>
              <SearchableSelect
                value={searchCategory}
                onValueChange={setSearchCategory}
                options={selectOptions?.categories || []}
                placeholder="All"
                searchPlaceholder="Search categories..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-department">Department</Label>
              <SearchableSelect
                value={searchDepartment}
                onValueChange={setSearchDepartment}
                options={selectOptions?.departments || []}
                placeholder="All"
                searchPlaceholder="Search departments..."
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
