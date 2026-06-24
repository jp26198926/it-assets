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
import type { TicketFilters } from "@/lib/types/ticket";

interface TicketAdvancedSearchDialogProps {
  onSearch: (filters: TicketFilters) => void;
  onClear: () => void;
}

export function TicketAdvancedSearchDialog({
  onSearch,
  onClear,
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
      <DialogContent className="max-w-lg">
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-priority">Priority</Label>
              <select
                id="search-priority"
                value={searchPriority}
                onChange={(e) => setSearchPriority(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-category">Category ID</Label>
              <Input
                id="search-category"
                placeholder="Category ID..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-status">Status</Label>
              <select
                id="search-status"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-department">Department ID</Label>
              <Input
                id="search-department"
                placeholder="Department ID..."
                value={searchDepartment}
                onChange={(e) => setSearchDepartment(e.target.value)}
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
