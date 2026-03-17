
export type VerificationType = 'entrance' | 'food';

export interface TicketUser {
  id: number;
  profile_image: string | null;
  name: string;
  phone: string;
  batch: string;
  profession: string;
  subject: string;
  religion: string;
  gender: string;
  is_active: boolean;
}

export interface TicketData {
  id: string;
  user: TicketUser;
  food_received: boolean;
  has_donation: boolean;
  ticket_code: string;
}

export interface ApiResponse {
  status: 'valid' | 'invalid' | string;
  message: string;
  ticket?: TicketData;
}

export interface TicketResult {
  id: string;
  guestName: string;
  phone: string;
  status: 'valid' | 'invalid' | 'used';
  ticketType: string;
  details: {
    batch: string;
    profession: string;
    subject: string;
    profileImage: string | null;
  };
  foodReceived: boolean;
  timestamp?: string;
}
