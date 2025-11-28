import React, { useState } from "react";
import type { Vocab } from "../types";
import { Chip } from "../../../components/Chip";
import { formatDistanceToNow } from "../../../lib/dates";
import { MoreVertical, Edit, Pause, Trash2, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditVocabDialog } from "./EditVocabDialog";
import { DeleteVocabDialog } from "./DeleteVocabDialog";

interface VocabCardProps {
  vocab: Vocab;
  onSuspend?: (vocab: Vocab) => void;
}

export const VocabCard = React.memo<VocabCardProps>(({ vocab, onSuspend }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleSuspend = () => {
    onSuspend?.(vocab);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div
        className={`
          bg-card border rounded-lg p-4 transition-all duration-200
          ${vocab.isSuspended
            ? "border-muted bg-muted/30 opacity-60 hover:opacity-80"
            : "border-border hover:shadow-md hover:border-primary/20"
          }
        `}
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3
                className={`text-lg font-semibold ${vocab.isSuspended ? "text-muted-foreground line-through" : "text-card-foreground"}`}
              >
                {vocab.word}
              </h3>
              {vocab.isSuspended && (
                <Chip variant="default" size="sm">
                  Suspended
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <time
                className="text-xs text-muted-foreground"
                dateTime={vocab.addedAt.toISOString()}
                title={new Date(vocab.addedAt).toLocaleString()}
              >
                {formatDistanceToNow(vocab.addedAt.toISOString())}
              </time>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSuspend} className="cursor-pointer">
                    {vocab.isSuspended ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Suspend
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p
            className={`text-sm font-medium ${vocab.isSuspended ? "text-muted-foreground" : "text-primary"}`}
          >
            {vocab.meaningVi}
          </p>

          <p className="text-sm text-muted-foreground line-clamp-2">{vocab.explanationEn}</p>

          {vocab.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {vocab.tags.map((tag) => (
                <Chip key={tag} variant={vocab.isSuspended ? "default" : "secondary"} size="sm">
                  {tag}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditVocabDialog vocab={vocab} open={editDialogOpen} onOpenChange={setEditDialogOpen} />

      <DeleteVocabDialog vocab={vocab} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </>
  );
});

VocabCard.displayName = "VocabCard";
