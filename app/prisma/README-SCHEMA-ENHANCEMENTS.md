# Schema Enhancements

This document describes the schema enhancements implemented in the `20240620_enhance_schema.prisma` migration file.

## Overview

The schema enhancements focus on several key areas:

1. **Agent Sessions**: Enhanced tracking of session context, metrics, and hierarchies
2. **Module States**: Improved state management with history tracking and transitions
3. **Agent Versioning**: Tracking agent versions and performance over time
4. **Memory Management**: Enhanced memory tracking with access patterns and annotations
5. **Performance Metrics**: Detailed metrics for agents and sessions

## Enhanced Models

### AgentSession

The `AgentSession` model has been enhanced with:

- `sessionPurpose`: Purpose of this session
- `businessContext`: Business context for this session
- `sessionTags`: Tags for categorizing sessions
- `qualityScore`: Overall quality score for the session
- `userSatisfaction`: User satisfaction score
- `learningOutcomes`: What was learned from this session
- `sessionSource`: Source that initiated the session (user, webhook, scheduled job, etc.)
- `parentSessionId`: For tracking session hierarchies
- Relations to new models: `childSessions`, `parentSession`, `moduleState`, `sessionMetrics`, `sessionEvents`

### ModuleState

The `ModuleState` model has been enhanced with:

- `sessionId`: Link to the session that created/modified this state
- `previousStateId`: For tracking state history
- `stateType`: Type of state (e.g., "user_preferences", "workflow_progress")
- `stateHash`: Hash of the state for quick comparison
- `isSnapshot`: Whether this is a point-in-time snapshot
- `snapshotReason`: Reason for creating this snapshot
- `expiresAt`: When this state expires (for temporary states)
- Relations to new models: `session`, `previousState`, `nextStates`, `stateTransitions`

### AI_Agent

The `AI_Agent` model has been enhanced with:

- `lastActiveAt`: When the agent was last active
- `totalSessions`: Total number of sessions
- `successRate`: Success rate of the agent (0-1)
- `specializations`: Areas the agent specializes in
- `learningMode`: Current learning mode (e.g., "active", "passive", "supervised")
- `trainingStatus`: Status of agent training (e.g., "initial", "trained", "fine-tuned")
- `versionHistory`: History of agent versions
- Relations to new models: `agentMetrics`, `agentVersions`

### InteractionMemory

The `InteractionMemory` model has been enhanced with:

- `memoryType`: More specific type of memory (e.g., "fact", "preference", "interaction")
- `confidence`: Confidence in this memory (0-1)
- `lastAccessedAt`: When this memory was last accessed
- `accessCount`: How many times this memory has been accessed
- `sourceType`: Source of this memory (e.g., "user_input", "agent_inference", "external")
- `verificationStatus`: Status of verification (e.g., "unverified", "verified", "disputed")
- `relatedMemories`: IDs of related memories
- Relations to new models: `memoryAccesses`, `memoryAnnotations`

## New Models

### SessionMetric

Tracks detailed metrics for agent sessions:

- `metricType`: Type of metric (e.g., "response_time", "token_usage", "user_engagement")
- `metricValue`: Value of the metric
- `timestamp`: When the metric was recorded
- `metadata`: Additional metadata about the metric

### SessionEvent

Tracks events within a session:

- `eventType`: Type of event (e.g., "user_input", "agent_response", "error", "checkpoint")
- `eventData`: Data associated with the event
- `timestamp`: When the event occurred
- `sequence`: Sequence number within the session
- `duration`: Duration of the event in milliseconds (if applicable)

### StateTransition

Tracks changes to module states:

- `stateId`: The state being transitioned from
- `triggerId`: What triggered this transition (e.g., user action, agent decision)
- `triggerType`: Type of trigger (e.g., "user_action", "agent_decision", "scheduled")
- `transitionData`: Data about what changed
- `previousValues`: Previous values before the transition
- `newValues`: New values after the transition

### AgentMetric

Tracks performance metrics for agents:

- `metricType`: Type of metric (e.g., "response_time", "accuracy", "user_satisfaction")
- `metricValue`: Value of the metric
- `timestamp`: When the metric was recorded
- `timeframe`: Timeframe for this metric (e.g., "daily", "weekly", "monthly")
- `metadata`: Additional metadata about the metric

### AgentVersion

Tracks versions of agents:

- `versionNumber`: Version number (e.g., "1.0.0")
- `changes`: What changed in this version
- `createdById`: Who created this version
- `isActive`: Whether this is the active version
- `activatedAt`: When this version was activated
- `deactivatedAt`: When this version was deactivated
- `performance`: Performance metrics for this version

### MemoryAccess

Tracks memory access patterns:

- `accessType`: Type of access (e.g., "read", "update", "reference")
- `accessedBy`: ID of agent or user who accessed the memory
- `accessorType`: Type of accessor (e.g., "agent", "user", "system")
- `context`: Context in which the memory was accessed
- `usefulness`: How useful the memory was (0-1)

### MemoryAnnotation

Allows for annotating memories:

- `annotationType`: Type of annotation (e.g., "correction", "enhancement", "verification")
- `content`: Content of the annotation
- `createdById`: Who created this annotation
- `isApplied`: Whether this annotation has been applied
- `appliedAt`: When this annotation was applied

## Benefits

These schema enhancements provide several benefits:

1. **Improved Tracking**: Better tracking of agent sessions, states, and memory usage
2. **Performance Monitoring**: Detailed metrics for agent and session performance
3. **Version Control**: Tracking agent versions and changes over time
4. **Memory Management**: Enhanced memory tracking with access patterns and annotations
5. **Auditability**: Comprehensive audit trail of state changes and session events
6. **Learning**: Better tracking of what agents learn from interactions

## Integration

To integrate these schema enhancements:

1. Apply the migration in `prisma/migrations/20240620_enhance_schema.prisma`
2. Update services to use the enhanced schema
3. Implement UI components for visualizing the new data
4. Set up automated metrics collection and analysis

## Usage Examples

### Tracking Session Hierarchies

```typescript
// Create a parent session
const parentSession = await prisma.agentSession.create({
  data: {
    sessionId: 'parent-session-id',
    userId: 'user-id',
    agentId: 'agent-id',
    status: 'active',
    sessionPurpose: 'Parent task',
    sessionTags: ['important', 'complex']
  }
});

// Create a child session
const childSession = await prisma.agentSession.create({
  data: {
    sessionId: 'child-session-id',
    userId: 'user-id',
    agentId: 'agent-id',
    status: 'active',
    sessionPurpose: 'Subtask',
    parentSessionId: parentSession.id
  }
});
```

### Tracking State Transitions

```typescript
// Create a module state
const moduleState = await prisma.moduleState.create({
  data: {
    moduleId: 'module-id',
    state: { /* initial state */ },
    version: '1.0.0',
    stateType: 'workflow_progress'
  }
});

// Record a state transition
await prisma.stateTransition.create({
  data: {
    stateId: moduleState.id,
    triggerType: 'user_action',
    transitionData: { /* what changed */ },
    previousValues: { /* old values */ },
    newValues: { /* new values */ }
  }
});
```

### Tracking Agent Versions

```typescript
// Create a new agent version
await prisma.agentVersion.create({
  data: {
    agentId: 'agent-id',
    versionNumber: '1.1.0',
    changes: {
      systemPrompt: 'Updated for better response quality',
      configuration: 'Adjusted temperature parameter'
    },
    createdById: 'user-id',
    isActive: true,
    activatedAt: new Date()
  }
});
```
