export type FaceitPlayerData = {
  player_id: string
  nickname: string
  avatar: string
  country: string
  cover_image: string
  platforms: Platforms
  games: Games
  settings: Settings
  friends_ids: string[]
  new_steam_id: string
  steam_id_64: string
  steam_nickname: string
  memberships: string[]
  faceit_url: string
  membership_type: string
  cover_featured_image: string
  verified: boolean
  activated_at: Date
}

export interface Games {
  cs2: Cs2
  csgo: Cs2
}

export interface Cs2 {
  region: string
  game_player_id: string
  skill_level: number
  faceit_elo: number
  game_player_name: string
  skill_level_label: string
  game_profile_id: string
}

export interface Platforms {
  steam: string
}

export interface Settings {
  language: string
}
