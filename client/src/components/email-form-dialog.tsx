import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Valid email required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  amount: z.string().optional(),
  receivedAt: z.string().min(1, "Date is required"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function EmailFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      senderName: "",
      senderEmail: "",
      subject: "",
      body: "",
      category: "",
      amount: "",
      receivedAt: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EmailFormData) => {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          receivedAt: new Date(data.receivedAt).toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create email");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Created",
        description: "Financial email has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setIsOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailFormData) => {
    mutation.mutate(data);
  };

  const categories = [
    "Invoice",
    "Receipt", 
    "Bill",
    "Tax Document",
    "Bank Statement",
    "Insurance",
    "Subscription",
    "Refund",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-pink-magenta text-white action-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Email
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-primary-800 border-primary-600/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Financial Email
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300">Sender Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Company or person name"
                        className="bg-primary-600/50 border-primary-500/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300">Sender Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="sender@company.com"
                        className="bg-primary-600/50 border-primary-500/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-300">Subject</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email subject line"
                      className="bg-primary-600/50 border-primary-500/50 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-primary-600/50 border-primary-500/50 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-primary-800 border-primary-600/30">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300">Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="$0.00"
                        className="bg-primary-600/50 border-primary-500/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="receivedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-300">Date Received</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="bg-primary-600/50 border-primary-500/50 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-300">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about this email..."
                      className="bg-primary-600/50 border-primary-500/50 text-white resize-none"
                      rows={3}
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
                {mutation.isPending ? "Adding..." : "Add Email"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}