export type Role = 'GUEST' | 'OWNER' | 'ADMIN'
export type BoatStatus = 'ACTIVE' | 'INACTIVE'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type RefundStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  phone?: string | null
  createdAt: Date
  // Платёжные реквизиты судовладельца (заполняются в ЛК для выплат)
  payoutLegalName?: string | null
  payoutInn?: string | null
  payoutOgrn?: string | null
  payoutBankName?: string | null
  payoutBik?: string | null
  payoutAccount?: string | null
  payoutCorrAccount?: string | null
  payoutUpdatedAt?: Date | null
}

export type Boat = {
  id: string
  ownerId: string
  title: string
  description: string
  capacity: number
  pricePerDay: number
  location: string
  routes: string[]
  images: string[]
  status: BoatStatus
  createdAt: Date
  owner?: { name: string }
  reviews?: Review[]
  _count?: { reviews: number }
  avgRating?: number
}

export type Booking = {
  id: string
  boatId: string
  guestId: string
  startDate: Date
  endDate: Date
  totalPrice: number
  commission: number
  status: BookingStatus
  createdAt: Date
  boat?: Boat
  guest?: Pick<User, 'id' | 'name' | 'email'>
  review?: Review | null
  refundStatus?: RefundStatus
  refundReason?: string | null
  refundRequestedAt?: Date | null
  refundDecidedAt?: Date | null
}

export type Review = {
  id: string
  bookingId: string
  boatId: string
  guestId: string
  rating: number
  comment: string
  createdAt: Date
  guest?: Pick<User, 'id' | 'name'>
}

export type SearchParams = {
  location?: string
  startDate?: string
  time?: string
  capacity?: string
}
