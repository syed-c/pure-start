import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { HandHeart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EnquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId: string;
  agencyName: string;
}

const ENQUIRY_TYPES = [
  { value: "becoming_foster_carer", label: "Becoming a Foster Carer" },
  { value: "speak_to_agency", label: "Speaking to this Agency" },
  { value: "learning_about_fostering", label: "Learning about Fostering" },
  { value: "placement_referral", label: "Placement Referral" },
  { value: "general_enquiry", label: "General Enquiry" },
];

const FOSTERING_TYPES = [
  { value: "short_term", label: "Short-Term Fostering" },
  { value: "long_term", label: "Long-Term Fostering" },
  { value: "emergency", label: "Emergency Fostering" },
  { value: "parent_child", label: "Parent and Child Fostering" },
  { value: "therapeutic", label: "Therapeutic Fostering" },
  { value: "respite", label: "Respite Fostering" },
  { value: "not_sure", label: "Not Sure Yet" },
];

export function EnquiryModal({ open, onOpenChange, agencyId, agencyName }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    postcode: "",
    city: "",
    enquiry_type: "",
    fostering_type: "",
    message: "",
    consent: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("fostering_enquiries").insert({
        agency_id: agencyId,
        enquirer_name: data.full_name,
        enquirer_email: data.email,
        enquirer_phone: data.phone,
        postcode: data.postcode,
        city: data.city,
        interest_type: data.enquiry_type,
        child_age_group: data.fostering_type,
        message: data.message,
        status: "new",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry sent successfully!");
      onOpenChange(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        postcode: "",
        city: "",
        enquiry_type: "",
        fostering_type: "",
        message: "",
        consent: false,
      });
    },
    onError: () => {
      toast.error("Failed to send enquiry. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      toast.error("Please agree to the privacy policy");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-teal" />
            Send Enquiry to {agencyName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="Your postcode"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Your city"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="enquiry_type">I am interested in *</Label>
            <Select
              value={formData.enquiry_type}
              onValueChange={(value) => setFormData({ ...formData, enquiry_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {ENQUIRY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fostering_type">Fostering Type Interest</Label>
            <Select
              value={formData.fostering_type}
              onValueChange={(value) => setFormData({ ...formData, fostering_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {FOSTERING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us more about your enquiry..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
            />
            <Label htmlFor="consent" className="text-sm text-muted-foreground">
              I agree to the privacy policy and consent to being contacted about my enquiry.
            </Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-teal hover:bg-teal/90"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <HandHeart className="h-4 w-4 mr-2" />
                Send Enquiry
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}