import { adminGetUsers } from "@/actions/admin";
import { AdminUsersTable } from "./admin-users-table";

export default async function AdminUsersPage() {
  const users = await adminGetUsers();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>
      <AdminUsersTable users={users} />
    </div>
  );
}
