import { getMessages, MessageResponse, resolveMessage } from "@/api/message";
import ConfirmResolveModal from "@/components/ConfirmResolveModal";
import MessageModal from "@/components/MessageModal"; // ✅ Import Modal Component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { CheckCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
// import { debounce } from "lodash";

const Dashboard = () => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [messageToResolve, setMessageToResolve] = useState<string | null>(null);


  const limit = 5; // Number of messages per page

  // Function to fetch messages with pagination & filters
  const getMessagesData = useCallback(async () => {
    try {
      const response = await getMessages(currentPage, limit, {
        title: searchTitle || undefined,
        type: selectedType !== "all" ? selectedType : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });

      setMessages(response.messages);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.log(error);
    }
  }, [currentPage, searchTitle, selectedType, selectedStatus]);

  useEffect(() => {
    getMessagesData();
  }, [getMessagesData]);

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1); // ✅ Reset to first page
    if (key === "title") setSearchTitle(value);
    if (key === "type") setSelectedType(value);
    if (key === "status") setSelectedStatus(value);
  };
  // Function to open modal with selected message
  const openModal = (message: MessageResponse) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };


  // Open Confirmation Modal
  const openConfirmModal = (messageId: string) => {
    setMessageToResolve(messageId);
    setIsConfirmOpen(true);
  };

  // Handle Resolve Message
  const handleResolveMessage = async () => {
    if (!messageToResolve) return;

    try {
      const updatedMessage = await resolveMessage(messageToResolve);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? { ...msg, status: "resolved" } : msg
        )
      );

      // Force page reload to update UI
      window.location.reload();

      // Reset state
      setMessageToResolve(null);
      setIsConfirmOpen(false);
    } catch (error) {
      console.log("Error resolving message:", error);
    } finally {
      setIsConfirmOpen(false);
      setMessageToResolve(null);
    }
  };


  return (
    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">All Messages</h1>
          <p className="text-muted-foreground">Manage and view all messages.</p>
        </div>

        {/* Filters Section */}
        <div className="flex gap-4">
          <Input
            placeholder="Search title..."
            value={searchTitle}
            onChange={(e) => handleFilterChange("title", e.target.value)}
          />

          <Select value={selectedType} onValueChange={(value) => handleFilterChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* <Button onClick={() => getMessagesData()}>Apply Filters</Button> */}
        </div>
      </div>

      {/* Messages Table */}
      <div className="mt-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <TableRow key={msg._id}>
                  <TableCell className="font-medium">{msg.title}</TableCell>
                  <TableCell className="truncate max-w-[300px]">{msg.description}</TableCell>
                  <TableCell>{msg.type}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        msg.status === "resolved"
                          ? "text-black bg-green-300 p-1 rounded-md"
                          : "bg-yellow-200 text-black p-1 rounded-md",
                        "font-semibold"
                      )}
                    >
                      {msg.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="justify-end gap-4 flex">
                    {/* ✅ Open Modal When Clicked */}
                    <Button onClick={() => openModal(msg)}>
                      <Eye className="w-4 h-4" /> View
                    </Button>

                    {msg.status !== "resolved" && (
                      <Button onClick={() => openConfirmModal(msg._id)} className="bg-green-500 text-white">
                        <CheckCircle className="w-4 h-4" /> Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No messages found.
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
                  onClick={() => setCurrentPage((prev) => prev - 1)}
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
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* ✅ Include Modal */}
      <MessageModal message={selectedMessage} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmResolveModal isOpen={isConfirmOpen} onConfirm={handleResolveMessage} onClose={() => setIsConfirmOpen(false)} />
    </div>
  );
};

export default Dashboard;
