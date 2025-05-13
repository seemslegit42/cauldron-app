/**
 * AIIntercept Component
 * 
 * An AI-powered interface for guided decision-making when responding to security threats.
 * Integrates with the Sentient Loop system to provide context-aware recommendations.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@src/shared/components/ui/card';
import { Button } from '@src/shared/components/ui/button';
import { Input } from '@src/shared/components/ui/input';
import { Textarea } from '@src/shared/components/ui/textarea';
import { Badge } from '@src/shared/components/ui/badge';
import { Spinner } from '@src/shared/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@src/shared/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lightbulb,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ChevronRight,
  ChevronDown,
  Zap,
  Brain
} from 'lucide-react';
import { useToast } from '@src/shared/hooks/useToast';
import { cn } from '@src/shared/utils/cn';
import { useSentientLoop } from '@src/shared/hooks/ai/useSentientLoop';
import { useSecurityAssistant } from '../agentHooks';
import { ThreatSeverity, ThreatStatus, ThreatType } from '../types';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@src/shared/components/ui/accordion';

// Types
interface AIInterceptProps {
  className?: string;
  threat?: any;
  onDecisionMade?: (decision: any) => void;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  steps: string[];
  automatable: boolean;
}

export function AIIntercept({ 
  className = '', 
  threat, 
  onDecisionMade,
  onClose
}: AIInterceptProps) {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { toast } = useToast();
  const { 
    processQuery, 
    isProcessing, 
    lastResponse, 
    error,
    analyzeThreat
  } = useSecurityAssistant();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize with system message and threat analysis when threat changes
  useEffect(() => {
    if (threat) {
      // Reset state
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: 'I am your AI security analyst. I will help you analyze and respond to this security threat.',
          timestamp: new Date()
        }
      ]);
      setDecisions([]);
      setSelectedDecision(null);
      setFeedback(null);
      setFeedbackComment('');
      setShowFeedbackForm(false);
      
      // Analyze the threat
      handleThreatAnalysis();
    }
  }, [threat]);
  
  // Handle threat analysis
  const handleThreatAnalysis = useCallback(async () => {
    if (!threat) return;
    
    try {
      setIsTyping(true);
      
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `Please analyze this ${threat.type} threat: ${threat.title}. ${threat.description || ''}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process with Sentient Loop
      const response = await analyzeThreat(
        threat.id || 'unknown',
        threat.description || threat.title
      );
      
      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response || 'I have analyzed the threat but could not generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate mock decisions
      generateMockDecisions();
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error analyzing threat:', error);
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing the threat. Please try again.',
        variant: 'destructive',
      });
      setIsTyping(false);
    }
  }, [threat, analyzeThreat, toast]);
  
  // Generate mock decisions for demo purposes
  const generateMockDecisions = () => {
    if (!threat) return;
    
    const mockDecisions: Decision[] = [
      {
        id: crypto.randomUUID(),
        title: 'Isolate Affected Systems',
        description: 'Temporarily isolate the affected systems from the network to prevent lateral movement.',
        impact: 'medium',
        confidence: 0.89,
        steps: [
          'Identify all affected systems',
          'Disable network interfaces',
          'Implement firewall rules to block traffic',
          'Monitor for any connection attempts'
        ],
        automatable: true
      },
      {
        id: crypto.randomUUID(),
        title: 'Collect Forensic Evidence',
        description: 'Gather forensic data from affected systems before any remediation steps.',
        impact: 'low',
        confidence: 0.95,
        steps: [
          'Create memory dumps of affected systems',
          'Capture network traffic logs',
          'Preserve system logs',
          'Document the incident timeline'
        ],
        automatable: false
      },
      {
        id: crypto.randomUUID(),
        title: 'Deploy Countermeasures',
        description: 'Implement specific countermeasures to mitigate the threat.',
        impact: 'high',
        confidence: 0.78,
        steps: [
          'Update firewall rules',
          'Deploy IOC-based detection rules',
          'Update antivirus signatures',
          'Implement additional monitoring'
        ],
        automatable: true
      }
    ];
    
    // Add a critical decision for high severity threats
    if (threat.severity === 'critical' || threat.severity === 'high') {
      mockDecisions.push({
        id: crypto.randomUUID(),
        title: 'Activate Incident Response Team',
        description: 'Escalate to the full incident response team for coordinated response.',
        impact: 'critical',
        confidence: 0.92,
        steps: [
          'Notify incident response team lead',
          'Establish communication channel',
          'Assign roles and responsibilities',
          'Begin formal incident documentation',
          'Prepare for potential business impact'
        ],
        automatable: false
      });
    }
    
    setDecisions(mockDecisions);
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    try {
      setIsTyping(true);
      
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Process with Sentient Loop
      const response = await processQuery(input, {
        threatId: threat?.id || 'unknown',
        threatType: threat?.type || 'unknown',
        threatSeverity: threat?.severity || 'medium',
        context: 'threat-response'
      });
      
      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response || 'I processed your request but could not generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message Failed',
        description: 'There was an error processing your message. Please try again.',
        variant: 'destructive',
      });
      setIsTyping(false);
    }
  };
  
  // Handle selecting a decision
  const handleSelectDecision = (decision: Decision) => {
    setSelectedDecision(decision);
    setActiveTab('decisions');
  };
  
  // Handle implementing a decision
  const handleImplementDecision = async () => {
    if (!selectedDecision) return;
    
    try {
      // In a real implementation, this would call an API to implement the decision
      toast({
        title: 'Decision Implemented',
        description: `Successfully implemented: ${selectedDecision.title}`,
        variant: 'default',
      });
      
      if (onDecisionMade) {
        onDecisionMade(selectedDecision);
      }
      
      // Show feedback form
      setShowFeedbackForm(true);
    } catch (error) {
      console.error('Error implementing decision:', error);
      toast({
        title: 'Implementation Failed',
        description: 'There was an error implementing the decision. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle submitting feedback
  const handleSubmitFeedback = () => {
    if (!feedback) return;
    
    // In a real implementation, this would call an API to submit feedback
    toast({
      title: 'Feedback Submitted',
      description: 'Thank you for your feedback. It helps improve our AI recommendations.',
      variant: 'default',
    });
    
    setShowFeedbackForm(false);
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-500" />
              AI Security Analyst
            </CardTitle>
            <CardDescription>
              Guided decision-making for security threats
            </CardDescription>
          </div>
          {threat && (
            <Badge 
              variant="default"
              className={cn(
                threat.severity === 'critical' ? 'bg-red-500' :
                threat.severity === 'high' ? 'bg-orange-500' :
                threat.severity === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              )}
            >
              {threat.severity} severity
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!threat ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a threat to begin analysis
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="decisions">
                Decisions
                {decisions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {decisions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto border rounded-md p-4 space-y-4">
                {messages.filter(m => m.role !== 'system').map((message) => (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex flex-col max-w-[80%] rounded-lg p-3",
                      message.role === 'user' 
                        ? "ml-auto bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div 
                      className={cn(
                        "text-xs mt-1",
                        message.role === 'user' 
                          ? "text-primary-foreground/70 text-right" 
                          : "text-muted-foreground"
                      )}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center space-x-2 bg-muted max-w-[80%] rounded-lg p-3">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-current rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-current rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-current rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about this threat or request guidance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="decisions" className="space-y-4">
              {decisions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isTyping ? (
                    <div className="flex flex-col items-center">
                      <Spinner size="md" className="mb-2" />
                      <span>Analyzing threat and generating recommendations...</span>
                    </div>
                  ) : (
                    <span>No decisions available yet. Chat with the AI to generate recommendations.</span>
                  )}
                </div>
              ) : selectedDecision ? (
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedDecision(null)}
                    className="mb-2"
                  >
                    ← Back to all decisions
                  </Button>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{selectedDecision.title}</h3>
                      <Badge 
                        variant="default"
                        className={cn(
                          selectedDecision.impact === 'critical' ? 'bg-red-500' :
                          selectedDecision.impact === 'high' ? 'bg-orange-500' :
                          selectedDecision.impact === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        )}
                      >
                        {selectedDecision.impact} impact
                      </Badge>
                    </div>
                    
                    <p className="mb-4">{selectedDecision.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">AI Confidence</span>
                        <span className="text-sm">{Math.round(selectedDecision.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${selectedDecision.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <h4 className="font-medium">Implementation Steps</h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        {selectedDecision.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {selectedDecision.automatable && (
                      <Alert className="mb-4">
                        <Zap className="h-4 w-4" />
                        <AlertTitle>Automation Available</AlertTitle>
                        <AlertDescription>
                          This decision can be automatically implemented by the system.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {showFeedbackForm ? (
                      <div className="space-y-4 border-t pt-4 mt-4">
                        <h4 className="font-medium">Provide Feedback</h4>
                        <div className="flex space-x-4">
                          <Button
                            variant={feedback === 'positive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFeedback('positive')}
                            className="flex-1"
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Helpful
                          </Button>
                          <Button
                            variant={feedback === 'negative' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFeedback('negative')}
                            className="flex-1"
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Not Helpful
                          </Button>
                        </div>
                        
                        {feedback && (
                          <>
                            <Textarea
                              placeholder="Additional comments (optional)"
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              className="h-20"
                            />
                            
                            <Button 
                              onClick={handleSubmitFeedback}
                              className="w-full"
                            >
                              Submit Feedback
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline"
                          onClick={onClose}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleImplementDecision}
                          className="flex-1"
                        >
                          Implement Decision
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Recommended Actions</h3>
                    <Badge variant="outline">
                      {decisions.length} options
                    </Badge>
                  </div>
                  
                  {decisions.map((decision) => (
                    <div 
                      key={decision.id}
                      className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
                      onClick={() => handleSelectDecision(decision)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{decision.title}</h4>
                        <Badge 
                          variant="default"
                          className={cn(
                            decision.impact === 'critical' ? 'bg-red-500' :
                            decision.impact === 'high' ? 'bg-orange-500' :
                            decision.impact === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          )}
                        >
                          {decision.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-2">
                        {decision.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          <span>{Math.round(decision.confidence * 100)}% confidence</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
