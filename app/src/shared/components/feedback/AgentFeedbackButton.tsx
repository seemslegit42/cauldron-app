import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAction } from 'wasp/client/operations';
import { submitFeedback } from 'wasp/client/operations';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert } from './Alert';

export interface AgentFeedbackButtonProps {
  agentId: string;
  sessionId?: string;
  category?: string;
  onFeedbackSubmitted?: (rating: number, feedback?: string) => void;
  className?: string;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  showFeedbackForm?: boolean;
}

/**
 * AgentFeedbackButton component for collecting thumbs up/down feedback for agents
 */
export const AgentFeedbackButton: React.FC<AgentFeedbackButtonProps> = ({
  agentId,
  sessionId,
  category,
  onFeedbackSubmitted,
  className,
  position = 'bottom-right',
  showFeedbackForm = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submitFeedbackAction = useAction(submitFeedback);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
  };

  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);
    
    if (!showFeedbackForm) {
      await handleSubmit(rating);
    } else {
      setShowForm(true);
    }
  };

  const handleSubmit = async (rating?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const finalRating = rating !== undefined ? rating : selectedRating;
      
      if (finalRating === null) {
        setError('Please select a rating');
        return;
      }

      await submitFeedbackAction({
        agentId,
        sessionId,
        rating: finalRating,
        feedback: feedbackText || undefined,
        category,
      });

      setSuccess('Thank you for your feedback!');
      setFeedbackText('');
      setShowForm(false);
      setIsExpanded(false);
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(finalRating, feedbackText || undefined);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFeedbackText('');
    setSelectedRating(null);
  };

  return (
    <div className={cn(
      'fixed z-50 flex flex-col items-end',
      positionClasses[position],
      className
    )}>
      {success && (
        <Alert 
          variant="success" 
          className="mb-2 animate-in fade-in slide-in-from-bottom-5 duration-300"
          dismissible
          onDismiss={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          variant="error" 
          className="mb-2 animate-in fade-in slide-in-from-bottom-5 duration-300"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {isExpanded ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Rate this interaction</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(false)}
              aria-label="Close feedback"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center space-x-6 mb-4">
            <Button
              variant={selectedRating === 1 ? "destructive" : "outline"}
              size="lg"
              className="flex flex-col items-center"
              onClick={() => handleRatingClick(1)}
              disabled={isSubmitting}
            >
              <ThumbsDown className="h-6 w-6 mb-1" />
              <span>Not helpful</span>
            </Button>
            
            <Button
              variant={selectedRating === 5 ? "success" : "outline"}
              size="lg"
              className="flex flex-col items-center"
              onClick={() => handleRatingClick(5)}
              disabled={isSubmitting}
            >
              <ThumbsUp className="h-6 w-6 mb-1" />
              <span>Helpful</span>
            </Button>
          </div>
          
          {showForm && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                  Additional feedback (optional)
                </label>
                <Textarea
                  id="feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg flex items-center space-x-2"
          onClick={() => setIsExpanded(true)}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Feedback</span>
        </Button>
      )}
    </div>
  );
};
