export interface Tier {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  venueName: string;
  venueAddress?: string | null;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  organiserName: string;
  organiserContact?: string | null;
  status: string;
  tiers: Tier[];
}

export interface Order {
  id: string;
  eventId: string;
  tierId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  quantity: number;
  amountCents: number;
  status: "pending" | "paid" | "failed" | "expired";
  hitpayReference: string;     // your reference_number, unique
  hitpayPaymentRequestId?: string;
  createdAt: string;
  paidAt?: string;
}