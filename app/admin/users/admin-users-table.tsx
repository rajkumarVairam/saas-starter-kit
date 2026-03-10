"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminBanUser, adminUnbanUser, adminDeleteUser } from "@/actions/admin";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: Date;
  themeCount: number;
};

type DialogState =
  | { type: "none" }
  | { type: "ban"; user: User }
  | { type: "unban"; user: User }
  | { type: "delete"; user: User };

export function AdminUsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [isPending, startTransition] = useTransition();

  function handleBan(u: User) {
    startTransition(async () => {
      try {
        await adminBanUser(u.id);
        toast.success(`${u.name} has been banned`);
        router.refresh();
      } catch {
        toast.error("Failed to ban user");
      }
      setDialog({ type: "none" });
    });
  }

  function handleUnban(u: User) {
    startTransition(async () => {
      try {
        await adminUnbanUser(u.id);
        toast.success(`${u.name} has been unbanned`);
        router.refresh();
      } catch {
        toast.error("Failed to unban user");
      }
      setDialog({ type: "none" });
    });
  }

  function handleDelete(u: User) {
    startTransition(async () => {
      try {
        await adminDeleteUser(u.id);
        toast.success(`${u.name} has been deleted`);
        router.refresh();
      } catch {
        toast.error("Failed to delete user");
      }
      setDialog({ type: "none" });
    });
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell text-right">Themes</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => {
              const initials = u.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <TableRow key={u.id} className={u.banned ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        {u.image && <AvatarImage src={u.image} alt={u.name} />}
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate sm:hidden">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">{u.themeCount}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {u.banned ? (
                      <Badge variant="destructive" className="text-xs">Banned</Badge>
                    ) : u.role === "admin" ? (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {u.banned ? (
                          <DropdownMenuItem onClick={() => setDialog({ type: "unban", user: u })}>
                            <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                            Unban user
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setDialog({ type: "ban", user: u })}>
                            <ShieldBan className="h-4 w-4 mr-2 text-yellow-600" />
                            Ban user
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDialog({ type: "delete", user: u })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Ban confirmation */}
      <AlertDialog
        open={dialog.type === "ban"}
        onOpenChange={(o) => !o && setDialog({ type: "none" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.type === "ban" && (
                <>
                  <strong>{dialog.user.name}</strong> ({dialog.user.email}) will be prevented from
                  signing in. You can unban them at any time.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => dialog.type === "ban" && handleBan(dialog.user)}
            >
              Ban user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban confirmation */}
      <AlertDialog
        open={dialog.type === "unban"}
        onOpenChange={(o) => !o && setDialog({ type: "none" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.type === "unban" && (
                <>
                  <strong>{dialog.user.name}</strong> will be able to sign in again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => dialog.type === "unban" && handleUnban(dialog.user)}
            >
              Unban user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={dialog.type === "delete"}
        onOpenChange={(o) => !o && setDialog({ type: "none" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.type === "delete" && (
                <>
                  This will permanently delete <strong>{dialog.user.name}</strong> and all their
                  data. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={() => dialog.type === "delete" && handleDelete(dialog.user)}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
