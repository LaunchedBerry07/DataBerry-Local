import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Label } from "@shared/schema";

const labelSchema = z.object({
  name: z.string().min(1, "Label name is required").max(100, "Name too long"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  description: z.string().max(500, "Description too long").optional(),
});

type LabelFormData = z.infer<typeof labelSchema>;

interface LabelFormDialogProps {
  editLabel?: Label;
  children?: React.ReactNode;
}

const colorPresets = [
  "#FF6B9D", "#FF8E53", "#FFBE0B", "#8FB339", "#06FFA5",
  "#54C6EB", "#A663CC", "#FF4081", "#E91E63", "#9C27B0",
  "#673AB7", "#3F51B5", "#2196F3", "#03DAC6", "#4CAF50"
];

export default function LabelFormDialog({ editLabel, children }: LabelFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: {
      name: editLabel?.name || "",
      color: editLabel?.color || "#FF6B9D",
      description: editLabel?.description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LabelFormData) => {
      const url = editLabel ? `/api/labels/${editLabel.id}` : "/api/labels";
      const method = editLabel ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editLabel ? 'update' : 'create'} label`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: editLabel ? "Label Updated" : "Label Created",
        description: `Label has been ${editLabel ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
      setIsOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editLabel ? 'update' : 'create'} label. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LabelFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gradient-pink-magenta text-white action-btn">
            <Plus className="w-4 h-4 mr-2" />
            Create Label
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-primary-800 border-primary-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editLabel ? "Edit Label" : "Create New Label"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-300">Label Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter label name"
                      className="bg-primary-600/50 border-primary-500/50 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-300">Color</FormLabel>
                  <div className="space-y-3">
                    {/* Color Presets */}
                    <div className="grid grid-cols-8 gap-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color 
                              ? "border-white scale-110" 
                              : "border-primary-500/50 hover:border-white/50"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    
                    {/* Custom Color Input */}
                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 h-10 rounded-lg border border-primary-500/50 bg-transparent cursor-pointer"
                        />
                        <Input
                          {...field}
                          placeholder="#FF6B9D"
                          className="flex-1 bg-primary-600/50 border-primary-500/50 text-white font-mono"
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-300">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Brief description of this label"
                      className="bg-primary-600/50 border-primary-500/50 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-primary-500/50 text-purple-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="gradient-cyan-blue text-white action-btn"
              >
                {mutation.isPending 
                  ? (editLabel ? "Updating..." : "Creating...") 
                  : (editLabel ? "Update Label" : "Create Label")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}