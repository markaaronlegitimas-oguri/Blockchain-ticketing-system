export enum TicketStatus {
  Unsold = 0,
  Sold = 1,
  Used = 2,
  Cancelled = 3,
  Refunded = 4,
}

export interface Ticket {
  id: number;
  status: TicketStatus;
  // Optional: filled in later from Supabase (sessions), not from the blockchain
  eventName?: string;
  sessionDate?: string;
}