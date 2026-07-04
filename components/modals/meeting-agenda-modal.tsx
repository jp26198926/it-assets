"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addAgendaItem,
  updateAgendaItem,
  removeAgendaItem,
} from "@/lib/actions/meeting-actions";
import type { AgendaItem } from "@/lib/types/meeting";
import { toast } from "sonner";

interface MeetingAgendaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  agendaItems: AgendaItem[];
  onSaved: () => void;
}

export function MeetingAgendaModal({
  open,
  onOpenChange,
  meetingId,
  agendaItems,
  onSaved,
}: MeetingAgendaModalProps) {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ topic: "", description: "", presenter: "", duration_minutes: "", notes: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [newData, setNewData] = useState({ topic: "", description: "", presenter: "", duration_minutes: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setItems(agendaItems);
      setEditingId(null);
      setAddingNew(false);
    }
  }, [open, agendaItems]);

  const handleEdit = (item: AgendaItem) => {
    setEditingId(item.id);
    setEditData({
      topic: item.topic,
      description: item.description || "",
      presenter: item.presenter || "",
      duration_minutes: item.duration_minutes?.toString() || "",
      notes: item.notes || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateAgendaItem(meetingId, editingId, {
        topic: editData.topic,
        description: editData.description || null,
        presenter: editData.presenter || null,
        duration_minutes: editData.duration_minutes ? Number(editData.duration_minutes) : null,
        notes: editData.notes || null,
      });
      setEditingId(null);
      onSaved();
      toast.success("Agenda item updated");
    } catch {
      toast.error("Failed to update agenda item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setSaving(true);
    try {
      await removeAgendaItem(meetingId, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      onSaved();
      toast.success("Agenda item removed");
    } catch {
      toast.error("Failed to remove agenda item");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newData.topic.trim()) return;
    setSaving(true);
    try {
      await addAgendaItem(meetingId, {
        topic: newData.topic,
        description: newData.description || null,
        presenter: newData.presenter || null,
        duration_minutes: newData.duration_minutes ? Number(newData.duration_minutes) : null,
        notes: newData.notes || null,
      });
      setAddingNew(false);
      setNewData({ topic: "", description: "", presenter: "", duration_minutes: "", notes: "" });
      onSaved();
      toast.success("Agenda item added");
    } catch {
      toast.error("Failed to add agenda item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[85vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>Edit Agenda Items</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 space-y-2">
              {editingId === item.id ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Topic *</Label>
                    <Input
                      value={editData.topic}
                      onChange={(e) => setEditData({ ...editData, topic: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Presenter</Label>
                      <Input
                        value={editData.presenter}
                        onChange={(e) => setEditData({ ...editData, presenter: e.target.value })}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input
                        type="number"
                        value={editData.duration_minutes}
                        onChange={(e) => setEditData({ ...editData, duration_minutes: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} disabled={saving || !editData.topic.trim()}>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.topic}</p>
                    {item.presenter && (
                      <p className="text-xs text-muted-foreground">Presenter: {item.presenter}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {item.duration_minutes && (
                        <span className="text-xs text-muted-foreground">{item.duration_minutes} min</span>
                      )}
                      {item.notes && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(item)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingNew ? (
            <div className="rounded-lg border p-3 space-y-2 border-dashed">
              <div className="space-y-2">
                <Label className="text-xs">Topic *</Label>
                <Input
                  value={newData.topic}
                  onChange={(e) => setNewData({ ...newData, topic: e.target.value })}
                  placeholder="Agenda topic"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={newData.description}
                  onChange={(e) => setNewData({ ...newData, description: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Presenter</Label>
                  <Input
                    value={newData.presenter}
                    onChange={(e) => setNewData({ ...newData, presenter: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duration (min)</Label>
                  <Input
                    type="number"
                    value={newData.duration_minutes}
                    onChange={(e) => setNewData({ ...newData, duration_minutes: e.target.value })}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  value={newData.notes}
                  onChange={(e) => setNewData({ ...newData, notes: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setAddingNew(false)}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd} disabled={saving || !newData.topic.trim()}>
                  <Check className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setAddingNew(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Agenda Item
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
