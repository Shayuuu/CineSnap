// Mock data for showcase/portfolio mode (no database needed)

export const MOCK_MOVIES = [
  {
    id: '550',
    title: 'Fight Club',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    rating: 8.4,
    releaseDate: '1999-10-15',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    genres: ['Drama'],
    runtime: 139,
    language: 'EN',
  },
  {
    id: '238',
    title: 'The Godfather',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    rating: 9.2,
    releaseDate: '1972-03-24',
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    genres: ['Crime', 'Drama'],
    runtime: 175,
    language: 'EN',
  },
  {
    id: '155',
    title: 'The Dark Knight',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 9.0,
    releaseDate: '2008-07-18',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 152,
    language: 'EN',
  },
  {
    id: '27205',
    title: 'Inception',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    rating: 8.8,
    releaseDate: '2010-07-16',
    overview: 'A skilled thief is given a chance at redemption if he can pull off an impossible heist.',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    runtime: 148,
    language: 'EN',
  },
  {
    id: '424',
    title: 'Schindler\'s List',
    posterUrl: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pM9IQ1pZ9.jpg',
    rating: 8.9,
    releaseDate: '1993-12-15',
    overview: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.',
    genres: ['Drama', 'History'],
    runtime: 195,
    language: 'EN',
  },
  {
    id: '129',
    title: 'Spirited Away',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    rating: 8.6,
    releaseDate: '2001-07-20',
    overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
    genres: ['Animation', 'Family', 'Fantasy'],
    runtime: 125,
    language: 'JA',
  },
]

export const MOCK_THEATERS = [
  {
    id: 'theater-1',
    name: 'PVR Cinemas',
    location: 'Mumbai',
    screens: [
      {
        id: 'screen-1',
        name: 'Screen 1',
        seats: generateSeats('screen-1', 8, 12), // 8 rows, 12 seats per row
      },
      {
        id: 'screen-2',
        name: 'Screen 2',
        seats: generateSeats('screen-2', 6, 10),
      },
    ],
  },
  {
    id: 'theater-2',
    name: 'INOX',
    location: 'Mumbai',
    screens: [
      {
        id: 'screen-3',
        name: 'Screen 1',
        seats: generateSeats('screen-3', 7, 11),
      },
      {
        id: 'screen-4',
        name: 'Screen 2',
        seats: generateSeats('screen-4', 8, 12),
      },
    ],
  },
]

function generateSeats(screenId: string, rows: number, seatsPerRow: number) {
  const seats: any[] = []
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
  
  for (let r = 0; r < rows; r++) {
    const row = rowLetters[r]
    for (let num = 1; num <= seatsPerRow; num++) {
      let type: 'STANDARD' | 'PREMIUM' | 'VIP' = 'STANDARD'
      if (r < 2) type = 'VIP'
      else if (r < rows / 2) type = 'PREMIUM'
      
      seats.push({
        id: `${screenId}-${row}-${num}`,
        screenId,
        row,
        number: num,
        type,
      })
    }
  }
  return seats
}

// Use a mutable array so we can push to it
export const MOCK_SHOWTIMES: Array<{
  id: string
  movieId: string
  screenId: string
  startTime: string
  price: number
}> = [
  {
    id: 'showtime-1',
    movieId: '550',
    screenId: 'screen-1',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    price: 50000, // ₹500
  },
  {
    id: 'showtime-2',
    movieId: '550',
    screenId: 'screen-1',
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    price: 50000,
  },
  {
    id: 'showtime-3',
    movieId: '238',
    screenId: 'screen-2',
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    price: 60000,
  },
  {
    id: 'showtime-4',
    movieId: '155',
    screenId: 'screen-3',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    price: 55000,
  },
  {
    id: 'showtime-5',
    movieId: '27205',
    screenId: 'screen-4',
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    price: 55000,
  },
]

export const MOCK_BOOKINGS: any[] = [] // Will be populated when bookings are made

export const MOCK_USERS = [
  {
    id: 'user-1',
    email: 'demo@cinesnap.com',
    name: 'Demo User',
    password: 'demo123', // In real app, this would be hashed
    role: 'USER',
  },
  {
    id: 'user-2',
    email: 'test@cinesnap.com',
    name: 'Test User',
    password: 'test123',
    role: 'USER',
  },
]

// Store bookings with seat associations
export const MOCK_BOOKING_SEATS: Record<string, string[]> = {}

// Mock groups for group booking feature
export const MOCK_GROUPS: Array<{
  id: string
  name: string
  createdBy: string
  showtimeId: string
  joinToken: string | null
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}> = []

export const MOCK_GROUP_MEMBERS: Array<{
  id: string
  groupId: string
  userId: string
  joinedAt: string
}> = []

// Helper to get theater by screen ID
export function getTheaterByScreenId(screenId: string | number | undefined | null) {
  if (!screenId) return null
  
  const screenIdStr = String(screenId)
  
  for (const theater of MOCK_THEATERS) {
    const screen = theater.screens.find(s => String(s.id) === screenIdStr)
    if (screen) {
      return { 
        theater: {
          id: theater.id,
          name: theater.name,
          location: theater.location,
        },
        screen: {
          id: screen.id,
          name: screen.name,
          seats: screen.seats,
        }
      }
    }
  }
  return null
}

// Helper to get showtimes for a movie
export function getShowtimesForMovie(movieId: string) {
  return MOCK_SHOWTIMES.filter(st => st.movieId === movieId)
}

// Helper to get seats for a screen
export function getSeatsForScreen(screenId: string) {
  const result = getTheaterByScreenId(screenId)
  return result?.screen.seats || []
}

