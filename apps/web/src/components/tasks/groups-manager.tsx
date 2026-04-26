import { format } from "date-fns";
import {
  ArchiveRestoreIcon,
  ArrowRightLeftIcon,
  CheckIcon,
  FolderIcon,
  FolderXIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGroupContext, type Group } from "@/contexts/group-context";
import { useTaskContext } from "@/contexts/task-context";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewGroupDialog } from "./new-group-dialog";

type GroupTab = "active" | "archived";

export function GroupsManager() {
  const { groups, deleteGroup, restoreGroup, renameGroup, permanentlyDeleteGroup } =
    useGroupContext();
  const { tasks, migrateTasksGroup } = useTaskContext();
  const [tab, setTab] = useState<GroupTab>("active");
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Archive confirmation
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  // Restore confirmation
  const [restoringGroup, setRestoringGroup] = useState<Group | null>(null);

  // Permanent delete confirmation
  const [permanentlyDeletingGroup, setPermanentlyDeletingGroup] =
    useState<Group | null>(null);

  // Migrate (standalone dialog)
  const [migratingGroup, setMigratingGroup] = useState<Group | null>(null);
  const [migrateTargetId, setMigrateTargetId] = useState("");

  // Transfer target inside permanent delete dialog
  const [permanentDeleteTransferTargetId, setPermanentDeleteTransferTargetId] =
    useState("");

  const taskCountByGroup = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      map.set(task.group, (map.get(task.group) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const activeGroups = groups
    .filter((g) => !g.deletedAt)
    .sort((a, b) => a.name.localeCompare(b.name));

  const archivedGroups = groups
    .filter((g) => g.deletedAt !== null)
    .sort((a, b) => b.deletedAt!.getTime() - a.deletedAt!.getTime());

  const visibleGroups = tab === "active" ? activeGroups : archivedGroups;

  function startEdit(group: Group) {
    setEditingId(group.id);
    setEditName(group.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function checkDuplicate(group: Group) {
    const trimmed = editName.trim().toLowerCase();
    return groups.some(
      (g) =>
        g.id !== group.id && g.name.toLowerCase() === trimmed && !g.deletedAt,
    );
  }

  function saveEdit(group: Group) {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === group.name || checkDuplicate(group)) return;
    renameGroup(group.id, trimmed);
    cancelEdit();
  }

  function confirmRestore() {
    if (!restoringGroup) return;
    restoreGroup(restoringGroup.id);
    setRestoringGroup(null);
  }

  function confirmDelete() {
    if (!deletingGroup) return;
    deleteGroup(deletingGroup.id);
    setDeletingGroup(null);
  }

  function confirmPermanentDelete() {
    if (!permanentlyDeletingGroup) return;
    if (permanentDeleteTransferTargetId) {
      const target = activeGroups.find(
        (g) => g.id === permanentDeleteTransferTargetId,
      );
      if (target) migrateTasksGroup(permanentlyDeletingGroup.name, target.name);
    }
    permanentlyDeleteGroup(permanentlyDeletingGroup.id);
    setPermanentlyDeletingGroup(null);
    setPermanentDeleteTransferTargetId("");
  }

  function confirmMigrate() {
    if (!migratingGroup || !migrateTargetId) return;
    const target = activeGroups.find((g) => g.id === migrateTargetId);
    if (!target) return;
    migrateTasksGroup(migratingGroup.name, target.name);
    setMigratingGroup(null);
    setMigrateTargetId("");
  }

  const permanentlyDeletingTaskCount = permanentlyDeletingGroup
    ? (taskCountByGroup.get(permanentlyDeletingGroup.name) ?? 0)
    : 0;

  const migratingTaskCount = migratingGroup
    ? (taskCountByGroup.get(migratingGroup.name) ?? 0)
    : 0;

  const migrateTargetOptions = activeGroups.filter(
    (g) => g.id !== migratingGroup?.id,
  );

  const tabs: { value: GroupTab; label: string; count: number }[] = [
    { value: "active", label: "Active", count: activeGroups.length },
    { value: "archived", label: "Archived", count: archivedGroups.length },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as GroupTab);
              cancelEdit();
            }}
          >
            <TabsList className="h-8">
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="h-7 text-xs gap-1.5 px-3"
                >
                  {t.label}
                  <span
                    className={[
                      "tabular-nums text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      t.value === "active"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400",
                    ].join(" ")}
                  >
                    {t.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button size="sm" onClick={() => setNewGroupOpen(true)}>
            <PlusIcon size={14} />
            New Group
          </Button>
        </div>

        {visibleGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <FolderIcon size={18} className="text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                {tab === "active" ? "No groups yet" : "No archived groups"}
              </p>
              <p className="text-xs text-muted-foreground">
                {tab === "active"
                  ? "Create a group to organize your tasks"
                  : "Archived groups will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <GroupSection
              groups={visibleGroups}
              taskCountByGroup={taskCountByGroup}
              archived={tab === "archived"}
              editingId={editingId}
              editName={editName}
              onEditNameChange={setEditName}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              checkDuplicate={checkDuplicate}
              onDeleteClick={setDeletingGroup}
              onRestoreClick={setRestoringGroup}
              onMigrateClick={setMigratingGroup}
              onPermanentDeleteClick={setPermanentlyDeletingGroup}
            />
          </div>
        )}
      </div>

      {/* Archive confirmation */}
      <Dialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive group?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              "{deletingGroup?.name}"
            </span>{" "}
            will be archived. You can restore it at any time.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingGroup(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation */}
      <Dialog
        open={!!restoringGroup}
        onOpenChange={(open) => !open && setRestoringGroup(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restore group?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              "{restoringGroup?.name}"
            </span>{" "}
            will be restored and become active again.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoringGroup(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRestore}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent delete confirmation */}
      <Dialog
        open={!!permanentlyDeletingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setPermanentlyDeletingGroup(null);
            setPermanentDeleteTransferTargetId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete permanently?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently deleting{" "}
              <span className="font-medium text-foreground">
                "{permanentlyDeletingGroup?.name}"
              </span>{" "}
              cannot be undone.
            </p>

            {permanentlyDeletingTaskCount > 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
                <p className="text-xs text-muted-foreground">
                  This group has{" "}
                  <span className="font-semibold text-foreground">
                    {permanentlyDeletingTaskCount}{" "}
                    {permanentlyDeletingTaskCount === 1 ? "task" : "tasks"}
                  </span>
                  . Transfer them to another group or they will be deleted too.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Transfer tasks to (optional)</Label>
                  {activeGroups.filter((g) => g.id !== permanentlyDeletingGroup?.id).length === 0 ? (
                    <p className="text-xs text-muted-foreground/70">
                      No active groups available.
                    </p>
                  ) : (
                    <Select
                      value={permanentDeleteTransferTargetId}
                      onValueChange={setPermanentDeleteTransferTargetId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Delete tasks too" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeGroups
                          .filter((g) => g.id !== permanentlyDeletingGroup?.id)
                          .map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs font-semibold text-destructive">
              This action is irreversible.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPermanentlyDeletingGroup(null);
                setPermanentDeleteTransferTargetId("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmPermanentDelete}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Migrate tasks */}
      <Dialog
        open={!!migratingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setMigratingGroup(null);
            setMigrateTargetId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Migrate tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Move all tasks from{" "}
              <span className="font-medium text-foreground">
                "{migratingGroup?.name}"
              </span>{" "}
              to another group.
              {migratingTaskCount > 0 ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {migratingTaskCount}{" "}
                    {migratingTaskCount === 1 ? "task" : "tasks"}
                  </span>{" "}
                  will be moved.
                </>
              ) : (
                <> This group has no tasks.</>
              )}
            </p>
            <div className="space-y-1.5">
              <Label>Target group</Label>
              {migrateTargetOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No active groups available to migrate to.
                </p>
              ) : (
                <Select
                  value={migrateTargetId}
                  onValueChange={setMigrateTargetId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {migrateTargetOptions.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMigratingGroup(null);
                setMigrateTargetId("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !migrateTargetId ||
                migratingTaskCount === 0 ||
                migrateTargetOptions.length === 0
              }
              onClick={confirmMigrate}
            >
              Migrate tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
    </>
  );
}

type GroupSectionProps = {
  groups: Group[];
  taskCountByGroup: Map<string, number>;
  archived: boolean;
  editingId: string | null;
  editName: string;
  onEditNameChange: (name: string) => void;
  onStartEdit: (group: Group) => void;
  onSaveEdit: (group: Group) => void;
  onCancelEdit: () => void;
  checkDuplicate: (group: Group) => boolean;
  onDeleteClick: (group: Group) => void;
  onRestoreClick: (group: Group) => void;
  onMigrateClick: (group: Group) => void;
  onPermanentDeleteClick: (group: Group) => void;
};

function GroupSection({
  groups,
  taskCountByGroup,
  archived,
  editingId,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  checkDuplicate,
  onDeleteClick,
  onRestoreClick,
  onMigrateClick,
  onPermanentDeleteClick,
}: GroupSectionProps) {
  return (
    <>
      {groups.map((group, i) => {
        const count = taskCountByGroup.get(group.name) ?? 0;
        const isEditing = editingId === group.id;
        const isDuplicate = isEditing && checkDuplicate(group);
        const canSave =
          isEditing &&
          editName.trim() !== "" &&
          editName.trim() !== group.name &&
          !isDuplicate;

        return (
          <div key={group.id}>
            {i > 0 && <div className="border-t border-border/40" />}
            <div
              className={[
                "flex items-center justify-between px-4 py-3 transition-colors",
                archived
                  ? "opacity-60"
                  : isEditing
                    ? "bg-muted/20"
                    : "hover:bg-muted/30",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {archived ? (
                    <FolderXIcon size={13} className="text-muted-foreground" />
                  ) : (
                    <FolderIcon size={13} className="text-muted-foreground" />
                  )}
                </div>

                {isEditing ? (
                  <div className="flex-1 min-w-0">
                    <Input
                      value={editName}
                      onChange={(e) => onEditNameChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSaveEdit(group);
                        if (e.key === "Escape") onCancelEdit();
                      }}
                      className={[
                        "h-7 text-sm py-0 px-2",
                        isDuplicate
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : "",
                      ].join(" ")}
                      autoFocus
                    />
                    {isDuplicate && (
                      <p className="text-[11px] text-destructive mt-1">
                        A group with this name already exists.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="min-w-0">
                    <p
                      className={[
                        "text-sm font-medium truncate",
                        archived
                          ? "line-through text-muted-foreground"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      {group.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? "task" : "tasks"} ·{" "}
                      {archived && group.deletedAt
                        ? `Archived ${format(group.deletedAt, "MMM d, yyyy")}`
                        : `Created ${format(group.createdAt, "MMM d, yyyy")}`}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {archived ? (
                  <>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => onMigrateClick(group)}
                      aria-label="Migrate tasks"
                      title="Migrate tasks to another group"
                    >
                      <ArrowRightLeftIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => onRestoreClick(group)}
                      aria-label="Restore group"
                      title="Restore"
                    >
                      <ArchiveRestoreIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => onPermanentDeleteClick(group)}
                      aria-label="Delete permanently"
                      title="Delete permanently"
                    >
                      <Trash2Icon size={13} />
                    </button>
                  </>
                ) : isEditing ? (
                  <>
                    <button
                      type="button"
                      disabled={!canSave}
                      className="p-1.5 rounded text-muted-foreground hover:text-green-600 hover:bg-green-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                      onClick={() => onSaveEdit(group)}
                      aria-label="Save"
                    >
                      <CheckIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={onCancelEdit}
                      aria-label="Cancel"
                    >
                      <XIcon size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => onStartEdit(group)}
                      aria-label="Rename group"
                      title="Rename"
                    >
                      <PencilIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => onMigrateClick(group)}
                      aria-label="Migrate tasks"
                      title="Migrate tasks to another group"
                    >
                      <ArrowRightLeftIcon size={13} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => onDeleteClick(group)}
                      aria-label="Archive group"
                      title="Archive"
                    >
                      <Trash2Icon size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
