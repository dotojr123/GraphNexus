'use server';

/**
 * @fileOverview An AI agent that consults a graph database for context before generating a response.
 *
 * - consultWithContext - A function that handles the consultation process.
 * - ConsultWithContextInput - The input type for the consultWithContext function.
 * - ConsultWithContextOutput - The return type for the consultWithContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConsultWithContextInputSchema = z.object({
  query: z.string().describe('The user query.'),
  context: z.string().describe('Relevant context retrieved from the graph database.'),
});
export type ConsultWithContextInput = z.infer<typeof ConsultWithContextInputSchema>;

const ConsultWithContextOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user query, informed by the context.'),
});
export type ConsultWithContextOutput = z.infer<typeof ConsultWithContextOutputSchema>;

export async function consultWithContext(input: ConsultWithContextInput): Promise<ConsultWithContextOutput> {
  return consultWithContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'consultWithContextPrompt',
  input: {schema: ConsultWithContextInputSchema},
  output: {schema: ConsultWithContextOutputSchema},
  prompt: `You are an AI assistant that answers user queries based on the provided context.\n\nContext:\n{{{context}}}\n\nQuery:\n{{{query}}}\n\nResponse:`,
});

const consultWithContextFlow = ai.defineFlow(
  {
    name: 'consultWithContextFlow',
    inputSchema: ConsultWithContextInputSchema,
    outputSchema: ConsultWithContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
