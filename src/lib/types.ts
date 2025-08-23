
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
  tournament_time: string;
  max_teams: number;
  status: 'upcoming' | 'completed' | 'ongoing';
  created_at: Timestamp;
  banner_url: string;
  upi_id: string;
  organizer_name: string;
  allow_whatsapp: boolean;
  whatsapp_number: string;
}

export interface Registration {
  id: string;
  user_id: string;
  username: string;
  user_email: string;
  tournament_id: string;
  squad_name: string;
  contact_number: string;
  players: {
      game_id: string;
  }[];
  user_upi_id?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: Timestamp;
  slot?: string;
}


export interface MatchResult {
    match_id: string;
    tournament_id: string;
    registration_id: string;
    squad_name: string;
    match_number: number;
    placement: number;
    kills: number;
    placement_points: number;
    kill_points: number;
    total_points: number;
    created_at: Date;
}


export interface LeaderboardEntry {
    id: string;
    tournament_id: string;
    squad_name: string;
    total_kills: number;
    matches_played: number;
    points: number;
    rank: number;
}
