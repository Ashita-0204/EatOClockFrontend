export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  ownerId: string;
  isApproved: boolean;
  isActive: boolean;
  phoneNumber?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
}
