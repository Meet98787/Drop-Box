import { toggleUserStatus, getAllUsers, UserResponse } from "@/api/user";
import AlertDialogCustom from "@/components/AlertDialogCustom";
import CreateUser from "@/components/create-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditUserModal from "@/components/EditUserModal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { debounce } from "lodash";

const Users = () => {
  const [usersList, setUsersList] = useState<UserResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    status: "all",
    role: "all",
  });

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  // ✅ Function to fetch users with filters
  const getUsers = useCallback(async (page = 1) => {
    try {
      const response = await getAllUsers(page, limit, filters);
      setUsersList(response.users);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  }, [limit, filters]);

  // ✅ Toggle User Status (Activate/Deactivate)
  const handleToggleStatus = async (id: string) => {
    try {
      const updatedUser = await toggleUserStatus(id);
      setUsersList((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isDelete: updatedUser.isDelete } : user
        )
      );
      toast.success(`User ${updatedUser.isDelete ? "deactivated" : "activated"} successfully`);
    } catch (error) {
      console.log("Error toggling user status:", error);
      toast.error("Please Try Again");
    }
  };

  useEffect(() => {
    getUsers(1);
  }, [filters, getUsers]);

  const handleInputChange = debounce((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, 500);

  return (
    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">All Users</h1>
          <p className="text-muted-foreground">Manage and view all users.</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search Name..."
            defaultValue={filters.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <Input
            placeholder="Search Email..."
            defaultValue={filters.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select
            value={filters.role}
            onValueChange={(value) => setFilters({ ...filters, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* <Button onClick={() => getUsers(1)}>Apply Filters</Button> */}
          <CreateUser getUsers={() => getUsers(1)} />
        </div>
      </div>

      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.length > 0 ? (
              usersList.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <span className={user.isDelete ? "text-red-500" : "text-green-500"}>
                      {user.isDelete ? "Inactive" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="justify-end gap-4 flex">
                    <AlertDialogCustom onConfirm={() => handleToggleStatus(user._id)} onCancel={() => { }}>
                      <Button variant={user.isDelete ? "secondary" : "destructive"}>
                        {user.isDelete ? "Activate" : "Deactivate"}
                      </Button>
                    </AlertDialogCustom>
                    {/* ✅ Edit User Button */}
                    <Button variant="default" onClick={() => setEditingUser(user)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={1}>
                <Button
                  variant="link"
                  disabled={currentPage === 1}
                  onClick={() => getUsers(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
              </TableCell>
              <TableCell className="text-center" colSpan={2}>
                Page {currentPage} of {totalPages}
              </TableCell>
              <TableCell className="text-right" colSpan={2}>
                <Button
                  variant="link"
                  disabled={currentPage === totalPages}
                  onClick={() => getUsers(currentPage + 1)}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} getUsers={getUsers} />}
    </div>

  );
};

export default Users;
