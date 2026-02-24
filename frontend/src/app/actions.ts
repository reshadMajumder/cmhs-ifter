
'use server';

import { getPersonalizedSections, PersonalizedSectionsInput } from '@/ai/flows/personalized-sections';

export async function getPersonalizedSectionsAction(input: PersonalizedSectionsInput): Promise<string[]> {
  try {
    const sections = await getPersonalizedSections(input);
    // Ensure we only return valid sections
    const validSections = ['Gifts', 'Food', 'Cultural'];
    const filteredSections = sections.filter(section => validSections.includes(section));
    return filteredSections.length > 0 ? filteredSections : validSections;
  } catch (error) {
    console.error("Error fetching personalized sections:", error);
    // Return a default set of sections in case of an error to ensure content is always shown.
    return ['Gifts', 'Food', 'Cultural'];
  }
}
