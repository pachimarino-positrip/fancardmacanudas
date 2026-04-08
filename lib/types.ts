export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  customer_code: string;
  role: 'customer' | 'cashier' | 'admin';
};

export type LoyaltyCard = {
  user_id: string;
  stamps_count: number;
  rewards_redeemed: number;
  updated_at: string;
};

export type QrToken = {
  user_id: string;
  qr_token: string;
};

export type ClientSearchRow = Profile & {
  loyalty_cards: LoyaltyCard[] | null;
};
