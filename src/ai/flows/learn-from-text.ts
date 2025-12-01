'use server';

/**
 * @fileOverview Flow for extracting entities and relationships from text and storing them in a graph database.
 *
 * - learnFromText - A function that takes text input and updates the graph database.
 * - LearnFromTextInput - The input type for the learnFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearnFromTextInputSchema = z.object({
  text: z.string().describe('The text to learn from.'),
});
export type LearnFromTextInput = z.infer<typeof LearnFromTextInputSchema>;


export async function learnFromText(input: LearnFromTextInput): Promise<void> {
  await learnFromTextFlow(input);
}

const extractTriplesPrompt = ai.definePrompt({
  name: 'extractTriplesPrompt',
  input: {schema: LearnFromTextInputSchema},
  prompt: `You are an expert knowledge extractor.

  Given the following text, extract all entities and relationships between them in the form of subject, predicate, object triples.
  Each triple should be on a new line.

  Text: {{{text}}}

  Triples:
  `,
});

const learnFromTextFlow = ai.defineFlow(
  {
    name: 'learnFromTextFlow',
    inputSchema: LearnFromTextInputSchema,
    outputSchema: z.void(),
  },
  async input => {
    const {text} = await extractTriplesPrompt(input);
    if (!text) {
      console.warn('No triples extracted.');
      return;
    }

    // TODO: Implement graph database storage here.  This is just a stub.

    console.log(`Extracted triples from text: ${text}`);
  }
);
