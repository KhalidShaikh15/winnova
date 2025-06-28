export const keyStats = [
  { label: 'Matches Conducted', value: '10,000+' },
  { label: 'Prize Money Distributed', value: '$2.5M+' },
  { label: 'Registered Teams', value: '5,000+' },
];

export const featuredGames = [
  { name: 'Valorant', imageUrl: 'https://placehold.co/400x300.png', aiHint: 'tactical shooter' },
  { name: 'Apex Legends', imageUrl: 'https://placehold.co/400x300.png', aiHint: 'battle royale' },
  { name: 'League of Legends', imageUrl: 'https://placehold.co/400x300.png', aiHint: 'moba game' },
  { name: 'Counter-Strike 2', imageUrl: 'https://placehold.co/400x300.png', aiHint: 'first person shooter' },
];

export const tournaments = [
  {
    id: '1',
    slug: 'valorant-challengers-south-asia',
    title: 'Valorant Challengers South Asia',
    game: featuredGames[0],
    date: '2024-08-15',
    prizePool: '$10,000',
    entryFee: '$25',
    matchType: 'Squad',
    description: 'The premier Valorant tournament in the South Asia region. Compete against the best to claim the title of champion.',
    rules: [
      'All players must be 16 years or older.',
      'Teams must consist of 5 players.',
      'Use of third-party software is strictly prohibited.',
      'Matches will be played on the Mumbai server.',
    ]
  },
  {
    id: '2',
    slug: 'apex-legends-global-series',
    title: 'Apex Legends Global Series',
    game: featuredGames[1],
    date: '2024-09-01',
    prizePool: '$50,000',
    entryFee: 'Free',
    matchType: 'Squad',
    description: 'The official ALGS circuit. Squad up and battle it out for a massive prize pool and glory.',
    rules: [
      'All players must be 18 years or older.',
      'Teams must consist of 3 players.',
      'All legends are allowed.',
      'Matches will be played across NA and EU servers.',
    ]
  },
  {
    id: '3',
    slug: 'solo-showdown-lol',
    title: 'Solo Showdown - League of Legends',
    game: featuredGames[2],
    date: '2024-08-20',
    prizePool: '$1,000',
    entryFee: '$5',
    matchType: 'Solo',
    description: 'Test your individual skill in the Summoner\'s Rift. A 1v1 tournament to find the ultimate duelist.',
    rules: [
      '1v1, Howling Abyss map.',
      'First to 2 kills, 100 CS, or first tower.',
      'Blind pick.',
      'All champions unlocked for the tournament.',
    ]
  },
  {
    id: '4',
    slug: 'cs2-wingman-cup',
    title: 'CS2 Wingman Cup',
    game: featuredGames[3],
    date: '2024-09-10',
    prizePool: '$2,500',
    entryFee: '$10 per duo',
    matchType: 'Duo',
    description: 'Grab a partner and enter the Wingman Cup. Fast-paced 2v2 action on compact maps.',
    rules: [
      '2v2 Wingman mode.',
      'Standard competitive ruleset.',
      'Single elimination bracket.',
      'All matches are Best of 1 until the final (Best of 3).',
    ]
  },
];

export const upcomingTournaments = tournaments.slice(0, 3);

export const leaderboardData = [
    { rank: 1, squadName: 'Dragon Force', totalKills: 152, matchesPlayed: 10, points: 240 },
    { rank: 2, squadName: 'Cyber Warriors', totalKills: 140, matchesPlayed: 10, points: 225 },
    { rank: 3, squadName: 'Team Phantom', totalKills: 135, matchesPlayed: 10, points: 210 },
    { rank: 4, squadName: 'Viper Strike', totalKills: 128, matchesPlayed: 10, points: 200 },
    { rank: 5, squadName: 'Goliath Gaming', totalKills: 120, matchesPlayed: 10, points: 195 },
    { rank: 6, squadName: 'Reaper Squad', totalKills: 115, matchesPlayed: 10, points: 180 },
    { rank: 7, squadName: 'Nemesis', totalKills: 110, matchesPlayed: 10, points: 170 },
    { rank: 8, squadName: 'Arctic Wolves', totalKills: 105, matchesPlayed: 10, points: 160 },
];

export type Tournament = typeof tournaments[0];
