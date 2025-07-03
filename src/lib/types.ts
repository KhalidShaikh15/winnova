import type { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  name: string;
  max_players: number;
  platform: string;
  active: boolean;
  imageUrl: string;
  aiHint: string;
}

export interface Tournament {
  id:string;
  game_name: string;
  title: string;
  entry_fee: number;
  prize_pool: number;
  match_type: 'Solo' | 'Duo' | 'Squad';
  tournament_date: Timestamp;
  max_teams: number;
  status: 'upcoming' | 'completed' | 'ongoing';
  created_at: Timestamp;
  gameImage?: string; // Populated after fetch
  gameAiHint?: string; // Populated after fetch
  upi_id: string;
  organizer_name: string;
  allow_whatsapp: boolean;
  whatsapp_number: string;
}

export interface Registration {
  id: string;
  user_id: string;
  tournament_id: string;
  tournament_title?: string;
  game_name: string;
  squad_name: string;
  player1_id: string;
  player2_id?: string;
  player3_id?: string;
  player4_id?: string;
  contact_number: string;
  match_slot: string;
  user_upi_id: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: Timestamp;
  payment_screenshot_url?: string;
}
