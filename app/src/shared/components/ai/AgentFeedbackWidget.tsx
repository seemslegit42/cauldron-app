import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAgentTrust } from '../../hooks/useAgentTrust';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { ThumbsUp, ThumbsDown, MessageSquare, Star, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export interface AgentFeedbackWidgetProps {
  agentId: string;
  sessionId?: string;
  responseId?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  onFeedbackSubmitted?: (rating: number, comment?: string) => void;
}

/**
 * Component for collecting feedback on agent responses
 */
export const AgentFeedbackWidget: React.FC<AgentFeedbackWidgetProps> = ({
  agentId,
  sessionId,
  responseId,
  className,
  variant = 'default',
  onFeedbackSubmitted,
}) => {
  const { toast } = useToast();
  const { recordFeedback, isLoading } = useAgentTrust({ agentId, autoFetch: false });
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle rating selection
  const handleRatingSelect = (value: number) => {
    if (isSubmitted) return;
    setRating(value);
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) return;
    setComment(e.target.value);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (isSubmitted || !rating || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Record feedback in the trust system
      await recordFeedback({
        agentId,
        rating,
      });
      
      // Submit feedback to the API (if needed)
      // This would typically call the submitFeedback action
      
      // Set submitted state
      setIsSubmitted(true);
      
      // Call callback
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(rating, comment || undefined);
      }
      
      // Show toast
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error submitting feedback',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimal variant (just thumbs up/down)
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {isSubmitted ? (
          <div className="text-xs text-muted-foreground">
            Thanks for your feedback!
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-full p-2 h-auto',
                rating === 5 && 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
              )}
              onClick={() => handleRatingSelect(5)}
              disabled={isSubmitting}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-full p-2 h-auto',
                rating === 1 && 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
              )}
              onClick={() => handleRatingSelect(1)}
              disabled={isSubmitting}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            {rating !== null && !isSubmitted && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Submit'}
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  // Compact variant (stars only)
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {isSubmitted ? (
          <div className="text-sm text-muted-foreground">
            Thanks for your feedback!
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full p-2 h-auto',
                    rating === value && 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  )}
                  onClick={() => handleRatingSelect(value)}
                  disabled={isSubmitting}
                >
                  <Star
                    className={cn(
                      'h-5 w-5',
                      rating !== null && value <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'fill-none text-muted-foreground'
                    )}
                  />
                </Button>
              ))}
              {rating !== null && !isSubmitted && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs ml-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Submit'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant (full feedback form)
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle>Feedback</CardTitle>
        <CardDescription>How was this response?</CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="text-green-500 mb-2">
              <ThumbsUp className="h-8 w-8 mx-auto" />
            </div>
            <p className="font-medium">Thank you for your feedback!</p>
            <p className="text-sm text-muted-foreground">
              Your input helps improve the agent's performance.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full p-2 h-auto',
                    rating === value && 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  )}
                  onClick={() => handleRatingSelect(value)}
                  disabled={isSubmitting}
                >
                  <Star
                    className={cn(
                      'h-6 w-6',
                      rating !== null && value <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'fill-none text-muted-foreground'
                    )}
                  />
                </Button>
              ))}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Additional comments (optional)
              </label>
              <Textarea
                id="comment"
                placeholder="What did you like or dislike about this response?"
                value={comment}
                onChange={handleCommentChange}
                disabled={isSubmitting}
                className="resize-none"
                rows={3}
              />
            </div>
          </>
        )}
      </CardContent>
      
      {!isSubmitted && (
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={rating === null || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
