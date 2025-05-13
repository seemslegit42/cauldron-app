import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAction } from 'wasp/client/operations';
import { submitFeedback, submitEscalation } from 'wasp/client/operations';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from './Alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Label } from '../ui/Label';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';

export interface AgentFeedbackFormProps {
  agentId: string;
  sessionId?: string;
  category?: string;
  onFeedbackSubmitted?: (rating: number, feedback?: string) => void;
  onEscalationSubmitted?: (reason: string, priority: string) => void;
  className?: string;
  showEscalationOption?: boolean;
}

/**
 * AgentFeedbackForm component for collecting detailed feedback for agents
 */
export const AgentFeedbackForm: React.FC<AgentFeedbackFormProps> = ({
  agentId,
  sessionId,
  category,
  onFeedbackSubmitted,
  onEscalationSubmitted,
  className,
  showEscalationOption = true,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isEscalation, setIsEscalation] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationPriority, setEscalationPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submitFeedbackAction = useAction(submitFeedback);
  const submitEscalationAction = useAction(submitEscalation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isEscalation) {
        if (!escalationReason) {
          setError('Please provide a reason for the escalation');
          return;
        }
        
        await submitEscalationAction({
          agentId,
          sessionId,
          reason: escalationReason,
          priority: escalationPriority,
          metadata: { category },
        });
        
        setSuccess('Your escalation has been submitted. Our team will review it shortly.');
        
        if (onEscalationSubmitted) {
          onEscalationSubmitted(escalationReason, escalationPriority);
        }
      } else {
        if (rating === null) {
          setError('Please select a rating');
          return;
        }
        
        await submitFeedbackAction({
          agentId,
          sessionId,
          rating,
          feedback: feedback || undefined,
          category,
        });
        
        setSuccess('Thank you for your feedback!');
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(rating, feedback || undefined);
        }
      }
      
      // Reset form
      setRating(null);
      setFeedback('');
      setIsEscalation(false);
      setEscalationReason('');
      setEscalationPriority('medium');
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-lg', className)}>
      <CardHeader>
        <CardTitle>{isEscalation ? 'Submit an Escalation' : 'Provide Feedback'}</CardTitle>
        <CardDescription>
          {isEscalation 
            ? 'Let us know about any issues or concerns with this agent interaction' 
            : 'Your feedback helps us improve our AI agents'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert 
              variant="error" 
              className="mb-4"
              dismissible
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              variant="success" 
              className="mb-4"
              dismissible
              onDismiss={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
          
          {showEscalationOption && (
            <div className="mb-4">
              <RadioGroup 
                value={isEscalation ? 'escalation' : 'feedback'} 
                onValueChange={(value) => setIsEscalation(value === 'escalation')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feedback" id="feedback-type" />
                  <Label htmlFor="feedback-type">Feedback</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="escalation" id="escalation-type" />
                  <Label htmlFor="escalation-type">Escalation</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {isEscalation ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="escalation-reason">Reason for Escalation</Label>
                <Textarea
                  id="escalation-reason"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="escalation-priority">Priority</Label>
                <Select
                  id="escalation-priority"
                  value={escalationPriority}
                  onValueChange={(value: any) => setEscalationPriority(value)}
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={rating === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRating(value)}
                      disabled={isSubmitting}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Not helpful</span>
                  <span>Very helpful</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="feedback-text">Comments (optional)</Label>
                <Textarea
                  id="feedback-text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isEscalation ? 'Submit Escalation' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
