import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import LabelFormDialog from "../components/label-form-dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Label } from "@shared/schema";

export default function LabelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labels = [], isLoading } = useQuery<Label[]>({
    queryKey: ["/api/labels"],
    queryFn: async () => {
      const response = await fetch("/api/labels");
      if (!response.ok) throw new Error("Failed to fetch labels");
      return response.json();
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: async (labelId: number) => {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast({
        title: "Label Deleted",
        description: "Label has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
    },
    onError: () => {
      toast({
        title: "Delete Failed", 
        description: "Failed to delete label. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteLabel = (labelId: number) => {
    if (confirm("Are you sure you want to delete this label? This action cannot be undone.")) {
      deleteLabelMutation.mutate(labelId);
    }
  };

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-primary-800">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <main className="flex-1 overflow-auto p-6 bg-primary-900/50">
            <div className="gradient-card rounded-2xl p-6 animate-pulse">
              <div className="h-8 bg-primary-600/50 rounded mb-4 w-1/3"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-primary-600/30 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-primary-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-primary-900/50">
          {/* Page Header */}
          <div className="gradient-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Label Management</h1>
                <p className="text-purple-300">Create and organize custom labels for your financial documents</p>
              </div>
              
              <LabelFormDialog />
            </div>
          </div>

          {/* Labels Grid */}
          <div className="gradient-card rounded-2xl overflow-hidden">
            {filteredLabels.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-cyan-blue rounded-2xl flex items-center justify-center">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Labels Found</h3>
                <p className="text-purple-300 mb-6">
                  {searchQuery ? "No labels match your search criteria." : "Get started by creating your first label."}
                </p>
                <LabelFormDialog />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-600/30 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Label</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Color</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-600/20">
                    {filteredLabels.map((label) => (
                      <tr key={label.id} className="hover:bg-primary-600/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: label.color }}
                            />
                            <span className="text-white font-medium">{label.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-purple-300 font-mono">{label.color}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-purple-300">
                            {label.description || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-purple-300">
                            {new Date(label.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <LabelFormDialog editLabel={label}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-purple-300 hover:text-accent-pink action-btn"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </LabelFormDialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-purple-300 hover:text-red-400 action-btn"
                              onClick={() => handleDeleteLabel(label.id)}
                              disabled={deleteLabelMutation.isPending}
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}