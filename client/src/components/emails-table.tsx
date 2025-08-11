import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Edit, Trash2, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { EmailWithLabels } from "@shared/schema";

interface EmailsTableProps {
  searchQuery: string;
  selectedCategory: string;
  dateRange: string;
}

export default function EmailsTable({ searchQuery, selectedCategory, dateRange }: EmailsTableProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery<EmailWithLabels[]>({
    queryKey: ["/api/emails", searchQuery, selectedCategory, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'All Categories') params.append('category', selectedCategory);
      const response = await fetch(`/api/emails?${params}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
      return response.json();
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await fetch(`/api/emails/${emailId}/export`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Successful",
        description: "Email has been saved to Google Drive!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to save email to Google Drive. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
    },
    onSuccess: () => {
      toast({
        title: "Email Deleted",
        description: "Email has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExportEmail = (emailId: string) => {
    exportMutation.mutate(emailId);
  };

  const handleDeleteEmail = (emailId: string) => {
    if (confirm("Are you sure you want to delete this email?")) {
      deleteEmailMutation.mutate(emailId);
    }
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(emails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "invoice":
        return "bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 text-accent-cyan border-accent-cyan/30";
      case "receipt":
        return "bg-gradient-to-r from-accent-pink/20 to-accent-magenta/20 text-accent-pink border-accent-pink/30";
      case "tax document":
        return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-300 border-primary-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "exported":
        return "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-primary-500/20 text-primary-300 border-primary-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="gradient-card rounded-2xl overflow-hidden">
        <div className="animate-pulse">
          <div className="h-16 bg-primary-600/30 border-b border-primary-600/20"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-primary-600/10 border-b border-primary-600/20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-600/30 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                <Checkbox
                  checked={selectedEmails.length === emails.length && emails.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Email Info</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-600/20">
            {emails.map((email) => (
              <tr key={email.id} className="hover:bg-primary-600/10 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox
                    checked={selectedEmails.includes(email.id)}
                    onCheckedChange={(checked) => handleSelectEmail(email.id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 gradient-cyan-blue rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{email.subject}</p>
                      <p className="text-purple-300 text-sm">{email.snippet}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {email.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{email.senderName}</p>
                      <p className="text-purple-300 text-sm">{email.senderEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(email.category)}`}>
                    {email.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-semibold">
                    {email.amount ? `$${email.amount}` : "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-purple-300">
                    {new Date(email.receivedAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(email.status)}`}>
                    {email.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {email.status === "exported" && email.driveFileUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-accent-cyan hover:text-accent-blue action-btn"
                        onClick={() => window.open(email.driveFileUrl!, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-purple-300 hover:text-accent-cyan action-btn"
                        onClick={() => handleExportEmail(email.id)}
                        disabled={exportMutation.isPending}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-purple-300 hover:text-accent-pink action-btn"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-purple-300 hover:text-red-400 action-btn"
                      onClick={() => handleDeleteEmail(email.id)}
                      disabled={deleteEmailMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-primary-600/20 backdrop-blur-sm px-6 py-4 border-t border-primary-600/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-purple-300">
            Showing <span className="font-medium text-white">1</span> to{" "}
            <span className="font-medium text-white">{Math.min(10, emails.length)}</span> of{" "}
            <span className="font-medium text-white">{emails.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm bg-primary-600/50 text-purple-300 border-primary-500/50 hover:bg-primary-500/50 hover:text-white"
            >
              Previous
            </Button>
            <Button
              size="sm"
              className="px-3 py-1 text-sm gradient-pink-magenta text-white"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm bg-primary-600/50 text-purple-300 border-primary-500/50 hover:bg-primary-500/50 hover:text-white"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm bg-primary-600/50 text-purple-300 border-primary-500/50 hover:bg-primary-500/50 hover:text-white"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm bg-primary-600/50 text-purple-300 border-primary-500/50 hover:bg-primary-500/50 hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
