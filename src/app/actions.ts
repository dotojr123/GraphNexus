'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { consultWithContext } from '@/ai/flows/consult-with-context';
import { addTriple, findContext, getGraphData, resetGraph as resetGraphStore } from '@/lib/graph-store';

const LearnFromTextInputSchema = z.object({
  text: z.string().describe('The text to learn from.'),
});

// Re-implementing prompt definition to avoid modifying src/ai files, while fulfilling the user request.
const extractTriplesPrompt = ai.definePrompt({
  name: 'extractTriplesPromptLocal',
  input: { schema: LearnFromTextInputSchema },
  prompt: `You are an expert knowledge extractor.

  Given the following text, extract all entities and relationships between them in the form of 'Subject, Predicate, Object' triples.
  Each triple must be on a new line. Do not include any other text, explanation, or numbering. Only output the triples.

  Text: {{{text}}}

  Triples:
  `,
});

export async function learnAction(text: string) {
  if (!text.trim()) {
    return { error: 'Input text cannot be empty.' };
  }

  try {
    const { text: triplesString } = await extractTriplesPrompt({ text });

    if (!triplesString || !triplesString.trim()) {
      return { success: 'No new knowledge was extracted. The AI did not find any relationships in the text.' };
    }

    const triples = triplesString.split('\n').filter(line => line.trim() !== '');
    
    const parsedTriples = triples.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return parts.length === 3 ? { subject: parts[0], predicate: parts[1], object: parts[2] } : null;
    }).filter((t): t is { subject: string; predicate: string; object: string; } => t !== null);

    if (parsedTriples.length === 0) {
      return { success: 'AI could not structure the knowledge into triples. Try rephrasing the text.' };
    }

    for (const triple of parsedTriples) {
      await addTriple(triple.subject, triple.predicate, triple.object);
    }

    return { success: `Successfully added ${parsedTriples.length} new piece(s) of knowledge.` };
  } catch (error) {
    console.error('Error in learnAction:', error);
    return { error: 'An AI error occurred while processing the text.' };
  }
}

export async function consultAction(query: string) {
  if (!query.trim()) {
    return { error: 'Query cannot be empty.' };
  }

  try {
    const context = await findContext(query);
    const result = await consultWithContext({ query, context });
    return { response: result.response };
  } catch (error) {
    console.error('Error in consultAction:', error);
    return { error: 'An AI error occurred while consulting the knowledge graph.' };
  }
}

export async function getGraphAction() {
  try {
    const data = await getGraphData();
    return { data };
  } catch (error) {
    console.error('Error in getGraphAction:', error);
    return { error: 'Failed to retrieve graph data.' };
  }
}

export async function resetGraphAction() {
  try {
    await resetGraphStore();
    return { success: true };
  } catch (error) {
    console.error('Error in resetGraphAction:', error);
    return { error: 'Failed to reset the graph.' };
  }
}
