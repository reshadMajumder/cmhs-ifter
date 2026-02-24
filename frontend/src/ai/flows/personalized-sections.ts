
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate personalized sections for the reunion landing page.
 *
 * The flow uses user activity data and school information to determine which sections (e.g., Gifts, Food, Cultural) are most relevant to the user.
 *
 * @param {string} userActivity - A string containing the user's recent activities on the landing page.
 * @returns {Promise<string[]>} - A promise that resolves to an array of section names to display.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedSectionsInputSchema = z.object({
  userActivity: z
    .string()
    .describe("A string describing the user's recent activities on the landing page."),
  schoolInfo: z
    .string()
    .optional()
    .describe('General information about Ranir Bazar High School.'),
});

export type PersonalizedSectionsInput = z.infer<
  typeof PersonalizedSectionsInputSchema
>;

const PersonalizedSectionsOutputSchema = z.array(z.string());

export type PersonalizedSectionsOutput = z.infer<
  typeof PersonalizedSectionsOutputSchema
>;

export async function getPersonalizedSections(
  input: PersonalizedSectionsInput
): Promise<PersonalizedSectionsOutput> {
  return personalizedSectionsFlow(input);
}

const personalizedSectionsPrompt = ai.definePrompt({
  name: 'personalizedSectionsPrompt',
  input: {schema: PersonalizedSectionsInputSchema},
  output: {schema: PersonalizedSectionsOutputSchema},
  prompt: `Based on the user's activity and school information, suggest which of the following sections would be most relevant to display to the user to increase engagement and registration for the Ranir Bazar High School reunion. Available sections include: Gifts, Food, Cultural.

User Activity: {{{userActivity}}}
School Information: {{{schoolInfo}}}

Return a JSON array of strings representing the section names to display. For example: ["Gifts", "Food"]`,
});

const personalizedSectionsFlow = ai.defineFlow(
  {
    name: 'personalizedSectionsFlow',
    inputSchema: PersonalizedSectionsInputSchema,
    outputSchema: PersonalizedSectionsOutputSchema,
  },
  async input => {
    const {output} = await personalizedSectionsPrompt(input);
    return output!;
  }
);
