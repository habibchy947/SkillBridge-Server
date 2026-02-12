export interface CreateTutorProfileInput {
  bio: string;
  hourlyRate: number;
  categoryIds: string[];
}

export interface UpdateTutorProfileInput {
  bio?: string;
  hourlyRate?: number;
  categoryIds?: string[];
}

export interface AvailabilitySlotInput {
  day: string;
  startTime: string;
  endTime: string;
}