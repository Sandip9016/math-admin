import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  deleteUserbyAdmin,
  getAllUsers,
  blockUserByAdmin,
  unblockUserByAdmin,
} from "../../../api/auth.api.js";
import { useEffect, useState } from "react";
import ConfirmDelete from "../../common/ConfirmDelete.js";
import ConfirmBlock from "../../common/ConfirmBlock.js";
import { useToast } from "../../../context/ToastContext.js";

// User type
interface User {
  id: number | string;
  username?: string;
  email?: string;
  gender?: string;
  country?: string;
  status?: "active" | "blocked";
}

// Pagination size
const ROWS_PER_PAGE = 10;

export default function BasicTableOne() {
  // Table data
  const [users, setUsers] = useState<User[]>([]);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Current page
  const [currentPage, setCurrentPage] = useState(1);
  // Selected user for delete
  const [deleteUserId, setDeleteUserId] = useState<string | number | null>(
    null
  );
  // Selected user for block/unblock
  const [blockUserId, setBlockUserId] = useState<string | number | null>(null);
  const [blockAction, setBlockAction] = useState<"block" | "unblock">("block");
  // Tooltip state
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Use toast from context
  const { showToast } = useToast();

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const data: unknown = await getAllUsers();
      let list: unknown[] = [];
      if (Array.isArray(data)) list = data;
      else if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.users)) list = obj.users;
        else if (Array.isArray(obj.data)) list = obj.data;
      }

      setUsers(
        list.map((u, idx) => {
          const obj = u as {
            id?: string | number;
            _id?: string | number;
            username?: string;
            name?: string;
            email?: string;
            gender?: string;
            country?: string;
            accountStatus?: {
              state?: string;
            };
          };

          return {
            id: obj.id ?? obj._id ?? idx,
            username: String(obj.username ?? obj.name ?? "").trim(),
            email: String(obj.email ?? ""),
            gender: String(obj.gender ?? ""),
            country: obj.country ? String(obj.country) : "-",
            status:
              obj.accountStatus?.state === "blocked" ? "blocked" : "active",
          };
        })
      );
      setCurrentPage(1);
    } catch {
      setError("Failed to fetch users");
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination calculation
  const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ROWS_PER_PAGE);

  // Open block/unblock confirmation modal
  const openBlockModal = (
    userId: string | number,
    action: "block" | "unblock"
  ) => {
    setBlockUserId(userId);
    setBlockAction(action);
  };

  // Confirm block/unblock handler
  const confirmBlockAction = async () => {
    if (!blockUserId) return;

    try {
      if (blockAction === "block") {
        await blockUserByAdmin(blockUserId, "Blocked by admin");
      } else {
        await unblockUserByAdmin(blockUserId);
      }

      // Update local state
      const newStatus = blockAction === "block" ? "blocked" : "active";
      setUsers((prev) =>
        prev.map((u) =>
          u.id === blockUserId ? { ...u, status: newStatus } : u
        )
      );

      showToast(
        `User ${
          blockAction === "block" ? "blocked" : "unblocked"
        } successfully`,
        "success"
      );
    } catch (error) {
      console.error("Status update error:", error);
      showToast("Failed to update user status", "error");
    } finally {
      setBlockUserId(null);
    }
  };

  // Confirm delete handler
  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUserbyAdmin(deleteUserId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      showToast("User deleted successfully", "success");
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setDeleteUserId(null);
    }
  };

  // Tooltip component
  const Tooltip = ({
    text,
    children,
    id,
  }: {
    text: string;
    children: React.ReactNode;
    id: string;
  }) => (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHoveredButton(id)}
      onMouseLeave={() => setHoveredButton(null)}
    >
      {children}
      {hoveredButton === id && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const currentBlockUser = users.find((u) => u.id === blockUserId);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Username
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Gender
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Country
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  ID
                </TableCell>
                <TableCell className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-4 text-start text-sm text-gray-500"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-4 text-start text-sm text-red-500"
                  >
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-5 py-4 text-start text-sm text-gray-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">
                      {user.username}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                      {user.gender}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                      {user.country}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.status === "blocked" ? "Blocked" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                      {user.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-2">
                        {/* Block/Unblock Button */}
                        <Tooltip
                          text={
                            user.status === "active"
                              ? "Block User"
                              : "Unblock User"
                          }
                          id={`block-${user.id}`}
                        >
                          <button
                            onClick={() =>
                              openBlockModal(
                                user.id,
                                user.status === "active" ? "block" : "unblock"
                              )
                            }
                            className={`text-base transition-colors ${
                              user.status === "active"
                                ? "text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
                                : "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                            }`}
                          >
                            {user.status === "active" ? "🔓" : "🔒"}
                          </button>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip text="Delete User" id={`delete-${user.id}`}>
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            🗑
                          </button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {users.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="
                  rounded-md border px-3 py-1 text-sm disabled:opacity-50
                  border-gray-800 text-gray-800
                  dark:border-white dark:text-white
                  hover:bg-gray-100 dark:hover:bg-white/10
                  transition-colors
                "
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="
                  rounded-md border px-3 py-1 text-sm disabled:opacity-50
                  border-gray-800 text-gray-800
                  dark:border-white dark:text-white
                  hover:bg-gray-100 dark:hover:bg-white/10
                  transition-colors
                "
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDelete
          open={deleteUserId !== null}
          onCancel={() => setDeleteUserId(null)}
          onConfirm={confirmDelete}
          message="Are you sure you want to delete this user? This action cannot be undone."
        />
        {/* Block/Unblock Confirmation Modal */}
        <ConfirmBlock
          open={blockUserId !== null}
          onCancel={() => setBlockUserId(null)}
          onConfirm={confirmBlockAction}
          action={blockAction}
        />
      </div>
    </div>
  );
}
