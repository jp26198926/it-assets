"use client";

import { useState, useEffect, useCallback } from "react";
import { LocationDataTable } from "@/components/data-table/location-data-table";
import { createLocationColumns } from "@/components/data-table/location-data-table-columns";
import { LocationFormModal } from "@/components/modals/location-form-modal";
import { LocationViewModal } from "@/components/modals/location-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getLocations, createLocation, updateLocation, deleteLocation, restoreLocation } from "@/lib/actions/location-actions";
import type { Location, CreateLocationInput, LocationFilters } from "@/lib/types/location";
import { toast } from "sonner";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [viewLocation, setViewLocation] = useState<Location | null>(null);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [deleteLocationItem, setDeleteLocationItem] = useState<Location | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<LocationFilters>({});

  const loadData = useCallback(async (filters?: LocationFilters) => {
    try {
      const data = await getLocations(filters);
      setLocations(data);
    } catch {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleServerSearch = useCallback((filters: LocationFilters) => {
    setActiveFilters(filters);
    getLocations(filters).then((data) => setLocations(data)).catch(() => {
      toast.error("Failed to search locations");
    });
  }, []);

  const handleServerSearchClear = useCallback(() => {
    setActiveFilters({});
    getLocations().then((data) => setLocations(data)).catch(() => {
      toast.error("Failed to load locations");
    });
  }, []);

  const handleView = (location: Location) => {
    setViewLocation(location);
  };

  const handleEdit = (location: Location) => {
    setEditLocation(location);
    setFormOpen(true);
  };

  const handleDelete = (location: Location) => {
    setDeleteLocationItem(location);
  };

  const handleRestore = async (location: Location) => {
    try {
      await restoreLocation(location.id);
      toast.success(`${location.name} has been restored`);
      loadData(activeFilters);
    } catch {
      toast.error("Failed to restore location");
    }
  };

  const handleAdd = () => {
    setEditLocation(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateLocationInput) => {
    try {
      if (editLocation) {
        await updateLocation(editLocation.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createLocation(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save location");
      throw new Error("Failed to save location");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteLocationItem) {
      try {
        await deleteLocation(deleteLocationItem.id);
        toast.success(`${deleteLocationItem.name} has been deleted`);
        setDeleteLocationItem(null);
        loadData(activeFilters);
      } catch {
        toast.error("Failed to delete location");
      }
    }
  };

  const columns = createLocationColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Locations</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Manage and organize company locations
            </p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ScrollReveal>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Locations</h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Manage and organize company locations
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <LocationDataTable
          columns={columns}
          data={locations}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onAdd={handleAdd}
          onServerSearch={handleServerSearch}
          onServerSearchClear={handleServerSearchClear}
        />
      </ScrollReveal>

      <LocationFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        location={editLocation}
        onSubmit={handleFormSubmit}
      />

      <LocationViewModal
        open={!!viewLocation}
        onOpenChange={(open) => !open && setViewLocation(null)}
        location={viewLocation}
      />

      <DeleteConfirmModal
        open={!!deleteLocationItem}
        onOpenChange={(open) => !open && setDeleteLocationItem(null)}
        assetName={deleteLocationItem?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
