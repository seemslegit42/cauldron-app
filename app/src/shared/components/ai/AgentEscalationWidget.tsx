import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { submitAgentEscalation } from '@src/api/routes/agents/submitAgentEscalation';
import { cn } from '@src/shared/utils/cn';
import { Button } from '@src/shared/components/ui/Button';
import { Textarea } from '@src/shared/components/ui/Textarea';
import { Label } from '@src/shared/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@src/shared/components/ui/Card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@src/shared/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@src/shared/components/ui/Select';
import { useToast } from '@src/shared/hooks/useToast';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export interface AgentEscalationWidgetProps {
  agentId: string;
  sessionId?: string;
  context?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'dialog';
  onEscalationSubmitted?: (reason: string, severity: string, details?: string) => void;
}

/**
 * Component for submitting escalations for an agent
 */
export const AgentEscalationWidget: React.FC<AgentEscalationWidgetProps> = ({
  agentId,
  sessionId,
  context,
  className,
  variant = 'default',
  onEscalationSubmitted,
}) => {
  // State
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Toast
  const { toast } = useToast();
  
  // Actions
  const submitEscalationAction = useAction(submitAgentEscalation);
  
  // Handle escalation submission
  const handleSubmit = async () => {
    if (isSubmitted || !reason.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await submitEscalationAction({
        agentId,
        reason: reason.trim(),
        severity,
        details: details.trim() || undefined,
        context: context || undefined,
      });
      
      // Set submitted state
      setIsSubmitted(true);
      
      // Close dialog if open
      if (variant === 'dialog') {
        setShowDialog(false);
      }
      
      // Call callback
      if (onEscalationSubmitted) {
        onEscalationSubmitted(
          reason.trim(),
          severity,
          details.trim() || undefined
        );
      }
      
      // Show toast
      toast({
        title: 'Escalation submitted',
        description: 'Your escalation has been submitted and will be reviewed.',
      });
    } catch (error) {
      console.error('Error submitting escalation:', error);
      toast({
        title: 'Error submitting escalation',
        description: error.message || 'An error occurred while submitting the escalation.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setReason('');
    setSeverity('medium');
    setDetails('');
    setIsSubmitted(false);
  };
  
  // Dialog variant
  if (variant === 'dialog') {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('flex items-center', className)}
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Escalate Issue
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Agent Issue</DialogTitle>
            <DialogDescription>
              Submit an escalation for review by our team. Please provide details about the issue.
            </DialogDescription>
          </DialogHeader>
          
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="text-green-500 mb-2">
                <CheckCircle className="h-8 w-8 mx-auto" />
              </div>
              <p className="font-medium">Escalation submitted!</p>
              <p className="text-sm text-muted-foreground">
                Our team will review your escalation and take appropriate action.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="escalation-reason">Reason for escalation *</Label>
                <Textarea
                  id="escalation-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the issue with this agent..."
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="escalation-severity">Severity *</Label>
                <Select
                  value={severity}
                  onValueChange={(value) => setSeverity(value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="escalation-severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="escalation-details">Additional details (optional)</Label>
                <Textarea
                  id="escalation-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context or details..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            {isSubmitted ? (
              <Button onClick={() => setShowDialog(false)}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Escalation'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('space-y-4', className)}>
        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="text-green-500 mb-2">
              <CheckCircle className="h-6 w-6 mx-auto" />
            </div>
            <p className="font-medium">Escalation submitted!</p>
            <p className="text-sm text-muted-foreground">
              Our team will review your escalation and take appropriate action.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={resetForm}
            >
              Submit Another
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-medium">Escalate Agent Issue</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="inline-reason" className="text-xs">Reason *</Label>
                <Textarea
                  id="inline-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={2}
                  className="text-sm"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="inline-severity" className="text-xs">Severity *</Label>
                  <Select
                    value={severity}
                    onValueChange={(value) => setSeverity(value as any)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="inline-severity" className="text-sm">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason.trim()}
                  className="self-end"
                  size="sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  
  // Default variant (full form)
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          Escalate Issue
        </CardTitle>
        <CardDescription>
          Submit an escalation for review by our team
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="text-green-500 mb-2">
              <CheckCircle className="h-8 w-8 mx-auto" />
            </div>
            <p className="font-medium">Escalation submitted!</p>
            <p className="text-sm text-muted-foreground">
              Our team will review your escalation and take appropriate action.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={resetForm}
            >
              Submit Another Escalation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for escalation *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue with this agent..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any additional context or details..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {!isSubmitted && (
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Escalation'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
