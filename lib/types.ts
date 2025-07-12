export interface TripData {
  destination: string
  startDate: string
  endDate: string
  budget: number
  persona: string
  interests: {
    culture: boolean
    food: boolean
    nature: boolean
    shopping: boolean
    nightlife: boolean
  }
}

export interface ItineraryDay {
  day: number
  date: string
  activities: Activity[]
  estimatedCost: number
}

export interface Activity {
  time: string
  title: string
  description: string
  location: string
  cost: number
  category: string
  link?: string
  pricePerPerson: number
  currency: string
}

export const PERSONA_OPTIONS = [
  { value: 'budget-backpacker', label: 'Budget Backpacker', description: 'Minimal spending, hostels, local transport' },
  { value: 'luxury-traveler', label: 'Luxury Traveler', description: 'High-end hotels, fine dining, premium experiences' },
  { value: 'family-friendly', label: 'Family Traveler', description: 'Kid-friendly activities, family restaurants, safe areas' },
  { value: 'adventure-seeker', label: 'Adventure Seeker', description: 'Outdoor activities, sports, unique experiences' },
  { value: 'culture-enthusiast', label: 'Culture Enthusiast', description: 'Museums, historical sites, local traditions' },
  { value: 'foodie', label: 'Foodie', description: 'Local cuisine, cooking classes, food tours' },
  { value: 'business-traveler', label: 'Business Traveler', description: 'Convenient locations, quick access, professional venues' },
  { value: 'romantic-couple', label: 'Romantic Couple', description: 'Romantic dining, scenic views, couple activities' }
] 