import React, { useState } from 'react';
import { Button } from '@src/shared/components/ui/button';
import { Card } from '@src/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@src/shared/components/ui/dialog';
import { Textarea } from '@src/shared/components/ui/textarea';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';
import { useToast } from '@src/shared/hooks/useToast';
import { ShieldIcon, AlertTriangleIcon, MailIcon, PhoneIcon, FileTextIcon, LockIcon } from 'lucide-react';

export function ThreatResponseOptions() {
  const toast = useToast();
  const [isContactingLegal, setIsContactingLegal] = useState(false);
  const [isFilingDMCA, setIsFilingDMCA] = useState(false);
  const [isBlockingDomain, setIsBlockingDomain] = useState(false);
  const [isReportingPhishing, setIsReportingPhishing] = useState(false);
  
  const handleContactLegal = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Legal team has been notified');
    setIsContactingLegal(false);
  };
  
  const handleFileDMCA = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('DMCA takedown request submitted');
    setIsFilingDMCA(false);
  };
  
  const handleBlockDomain = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Domain has been blocked');
    setIsBlockingDomain(false);
  };
  
  const handleReportPhishing = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Phishing site reported to authorities');
    setIsReportingPhishing(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Contact Legal */}
        <Dialog open={isContactingLegal} onOpenChange={setIsContactingLegal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 text-sm">
              <MailIcon className="h-6 w-6" />
              Contact Legal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Legal Team</DialogTitle>
              <DialogDescription>
                Send details to your legal team for review and action.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleContactLegal}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Brand Infringement Alert" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea 
                    id="details" 
                    placeholder="Provide details about the threat..." 
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <select 
                    id="urgency" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue="medium"
                  >
                    <option value="low">Low - Review when convenient</option>
                    <option value="medium">Medium - Review within 24 hours</option>
                    <option value="high">High - Review within 4 hours</option>
                    <option value="critical">Critical - Immediate attention required</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsContactingLegal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send to Legal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* File DMCA */}
        <Dialog open={isFilingDMCA} onOpenChange={setIsFilingDMCA}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 text-sm">
              <FileTextIcon className="h-6 w-6" />
              File DMCA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File DMCA Takedown</DialogTitle>
              <DialogDescription>
                Submit a DMCA takedown request for copyright infringement.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFileDMCA}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="infringing-url">Infringing URL</Label>
                  <Input id="infringing-url" placeholder="https://example.com/infringing-content" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original-content">Original Content URL</Label>
                  <Input id="original-content" placeholder="https://your-site.com/original-content" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dmca-details">Infringement Details</Label>
                  <Textarea 
                    id="dmca-details" 
                    placeholder="Describe how your content is being infringed..." 
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFilingDMCA(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Takedown</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Block Domain */}
        <Dialog open={isBlockingDomain} onOpenChange={setIsBlockingDomain}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 text-sm">
              <LockIcon className="h-6 w-6" />
              Block Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block Malicious Domain</DialogTitle>
              <DialogDescription>
                Add a domain to your organization's blocklist.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBlockDomain}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain to Block</Label>
                  <Input id="domain" placeholder="malicious-site.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block-reason">Reason for Blocking</Label>
                  <select 
                    id="block-reason" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue="phishing"
                  >
                    <option value="phishing">Phishing Attempt</option>
                    <option value="malware">Malware Distribution</option>
                    <option value="brand-infringement">Brand Infringement</option>
                    <option value="impersonation">Impersonation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block-notes">Additional Notes</Label>
                  <Textarea 
                    id="block-notes" 
                    placeholder="Any additional details about this domain..." 
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBlockingDomain(false)}>
                  Cancel
                </Button>
                <Button type="submit">Block Domain</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Report Phishing */}
        <Dialog open={isReportingPhishing} onOpenChange={setIsReportingPhishing}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 text-sm">
              <AlertTriangleIcon className="h-6 w-6" />
              Report Phishing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Phishing Site</DialogTitle>
              <DialogDescription>
                Report a phishing site to relevant authorities and browser vendors.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReportPhishing}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phishing-url">Phishing URL</Label>
                  <Input id="phishing-url" placeholder="https://fake-login.example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-to">Report To</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-full">
                      Google Safe Browsing
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="rounded-full">
                      Microsoft
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="rounded-full">
                      Anti-Phishing Working Group
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="rounded-full">
                      US-CERT
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phishing-details">Phishing Details</Label>
                  <Textarea 
                    id="phishing-details" 
                    placeholder="Describe the phishing attempt..." 
                    className="min-h-[80px]"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReportingPhishing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Report</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <ShieldIcon className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium">Need more response options?</h4>
            <p className="text-sm text-muted-foreground">
              Contact your security team for custom response workflows or to escalate critical threats.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
