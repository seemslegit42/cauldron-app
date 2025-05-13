/**
 * Hook for managing agent feedback
 */
import { useState, useCallback } from 'react';
import { useAction } from 'wasp/client/operations';
import { submitFeedback, submitEscalation } from 'wasp/client/operations';

interface UseAgentFeedbackProps {
  agentId: string;
  sessionId?: string;
  category?: string;
  onFeedbackSubmitted?: (rating: number, feedback?: string) => void;
  onEscalationSubmitted?: (reason: string, priority: string) => void;
}

interface UseAgentFeedbackReturn {
  submitRating: (rating: number, feedback?: string) => Promise<void>;
  submitEscalationRequest: (reason: string, priority: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
  success: string | null;
  clearMessages: () => void;
}

export const useAgentFeedback = ({
  agentId,
  sessionId,
  category,
  onFeedbackSubmitted,
  onEscalationSubmitted,
}: UseAgentFeedbackProps): UseAgentFeedbackReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submitFeedbackAction = useAction(submitFeedback);
  const submitEscalationAction = useAction(submitEscalation);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const submitRating = useCallback(
    async (rating: number, feedback?: string) => {
      try {
        setIsSubmitting(true);
        clearMessages();

        await submitFeedbackAction({
          agentId,
          sessionId,
          rating,
          feedback,
          category,
        });

        setSuccess('Thank you for your feedback!');
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(rating, feedback);
        }
      } catch (err) {
        console.error('Error submitting feedback:', err);
        setError(err as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [agentId, sessionId, category, submitFeedbackAction, clearMessages, onFeedbackSubmitted]
  );

  const submitEscalationRequest = useCallback(
    async (reason: string, priority: 'low' | 'medium' | 'high' | 'critical') => {
      try {
        setIsSubmitting(true);
        clearMessages();

        await submitEscalationAction({
          agentId,
          sessionId,
          reason,
          priority,
          metadata: { category },
        });

        setSuccess('Your escalation has been submitted. Our team will review it shortly.');
        
        if (onEscalationSubmitted) {
          onEscalationSubmitted(reason, priority);
        }
      } catch (err) {
        console.error('Error submitting escalation:', err);
        setError(err as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [agentId, sessionId, category, submitEscalationAction, clearMessages, onEscalationSubmitted]
  );

  return {
    submitRating,
    submitEscalationRequest,
    isSubmitting,
    error,
    success,
    clearMessages,
  };
};
