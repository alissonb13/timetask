import { useEffect, useState } from "react";
import { useGroupContext, type Group } from "@/contexts/group-context";
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

interface EditGroupDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
}: EditGroupDialogProps) {
  const { groups, renameGroup } = useGroupContext();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open && group) setName(group.name);
  }, [open, group]);

  const isDuplicate =
    name.trim().toLowerCase() !== group?.name.toLowerCase() &&
    groups.some(
      (g) =>
        g.id !== group?.id &&
        g.name.toLowerCase() === name.trim().toLowerCase() &&
        !g.deletedAt,
    );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!group || !name.trim() || isDuplicate) return;
    renameGroup(group.id, name.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-group-name">Name</Label>
            <Input
              id="edit-group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {isDuplicate && (
              <p className="text-xs text-destructive">
                A group with this name already exists.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() ||
                name.trim() === group?.name ||
                isDuplicate
              }
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
