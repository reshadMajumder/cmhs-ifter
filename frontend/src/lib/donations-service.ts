
import { API_BASE_URL } from "./constants";

// Define the types based on the API response
export interface Donation {
  name: string;
  batch: string;
  image: string | null;
  amount: string; // The API returns amount as a string like "4450.0"
  transaction_id: string;
  method: string;
  isFeatured?: boolean; // This will be added client-side
}

export interface DonationStats {
  total_donation_amount: string;
  donations: Donation[];
}

let cachedDonations: DonationStats | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches donation stats from the API, with caching.
 * It also determines which donors are "featured" based on their donation amount.
 */
export async function getDonations(): Promise<DonationStats> {
  const now = Date.now();
  if (cachedDonations && now - lastFetchTime < CACHE_DURATION) {
    return cachedDonations;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/donation-stats/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch donation stats: ${response.statusText}`);
    }
    const data: DonationStats = await response.json();

    // The API returns a list of donations, process them.
    const donations = Array.isArray(data) ? data : data.donations || [];

    // Determine top donors to mark them as featured
    const sortedDonations = [...donations].sort((a, b) => Number(b.amount) - Number(a.amount));
    const topDonationAmount = sortedDonations.length > 0 ? Number(sortedDonations[0].amount) : 0;
    
    // Feature donors who have donated 80% or more of the top donation amount
    // or any donation over a certain threshold, e.g., 10000
    const featuredThreshold = Math.max(topDonationAmount * 0.8, 10000);

    const processedDonations = donations.map(donation => ({
      ...donation,
      isFeatured: Number(donation.amount) >= featuredThreshold
    }));

    const processedData = {
        total_donation_amount: Array.isArray(data) ? "0" : data.total_donation_amount || "0",
        donations: processedDonations.sort((a, b) => Number(b.amount) - Number(a.amount))
    };

    // Cache the processed data
    cachedDonations = processedData;
    lastFetchTime = now;
    
    return processedData;
  } catch (error) {
    console.error("Error in getDonations:", error);
    // In case of an error, return empty state to prevent app crash
    return {
      total_donation_amount: "0",
      donations: [],
    };
  }
}
