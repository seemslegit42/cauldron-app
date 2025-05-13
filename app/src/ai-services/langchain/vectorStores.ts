/**
 * LangChain Vector Store Integration
 * 
 * This file provides vector store implementations for LangChain that integrate with
 * CauldronOS's existing systems.
 */

import { LoggingService } from '@src/shared/services/logging';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Embeddings } from 'langchain/embeddings/base';

/**
 * Creates a memory vector store with the given documents
 */
export async function createMemoryVectorStore(
  documents: Document[] = [],
  embeddings?: Embeddings
): Promise<MemoryVectorStore> {
  try {
    // Use provided embeddings or create default
    const embeddingsModel = embeddings || new OpenAIEmbeddings();
    
    // Create vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      embeddingsModel
    );
    
    LoggingService.info({
      message: 'Created LangChain memory vector store',
      module: 'ai-services',
      category: 'LANGCHAIN',
      metadata: {
        documentCount: documents.length,
      },
    });
    
    return vectorStore;
  } catch (error) {
    LoggingService.error({
      message: 'Error creating LangChain memory vector store',
      module: 'ai-services',
      category: 'LANGCHAIN',
      error,
      metadata: {
        documentCount: documents.length,
      },
    });
    
    throw error;
  }
}

/**
 * Creates a document from text
 */
export function createDocument(
  text: string,
  metadata: Record<string, any> = {}
): Document {
  return new Document({
    pageContent: text,
    metadata,
  });
}

/**
 * Creates documents from texts
 */
export function createDocuments(
  texts: string[],
  metadatas: Record<string, any>[] = []
): Document[] {
  return texts.map((text, i) => {
    const metadata = metadatas[i] || {};
    return createDocument(text, metadata);
  });
}

/**
 * Performs a similarity search on a vector store
 */
export async function performSimilaritySearch(
  vectorStore: MemoryVectorStore,
  query: string,
  k: number = 5
): Promise<Document[]> {
  try {
    const results = await vectorStore.similaritySearch(query, k);
    
    LoggingService.info({
      message: 'Performed LangChain similarity search',
      module: 'ai-services',
      category: 'LANGCHAIN',
      metadata: {
        query,
        k,
        resultCount: results.length,
      },
    });
    
    return results;
  } catch (error) {
    LoggingService.error({
      message: 'Error performing LangChain similarity search',
      module: 'ai-services',
      category: 'LANGCHAIN',
      error,
      metadata: {
        query,
        k,
      },
    });
    
    throw error;
  }
}