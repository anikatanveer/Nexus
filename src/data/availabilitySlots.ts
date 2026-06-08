import { AvailabilitySlot } from '../types';

export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: 'avail1',
    userId: 'e1',
    date: '2024-06-10',
    startTime: '09:00',
    endTime: '10:00',
    createdAt: '2024-05-28T10:00:00Z'
  },
  {
    id: 'avail2',
    userId: 'i1',
    date: '2024-06-11',
    startTime: '14:00',
    endTime: '15:00',
    createdAt: '2024-05-29T11:30:00Z'
  }
];

export const getAvailabilitySlotsForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots
    .filter(slot => slot.userId === userId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
};

export const createAvailabilitySlot = (
  userId: string,
  date: string,
  startTime: string,
  endTime: string
): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = {
    id: `avail${availabilitySlots.length + 1}`,
    userId,
    date,
    startTime,
    endTime,
    createdAt: new Date().toISOString()
  };

  availabilitySlots.push(newSlot);
  return newSlot;
};

export const updateAvailabilitySlot = (
  slotId: string,
  date: string,
  startTime: string,
  endTime: string
): AvailabilitySlot | null => {
  const slotIndex = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (slotIndex === -1) return null;

  availabilitySlots[slotIndex] = {
    ...availabilitySlots[slotIndex],
    date,
    startTime,
    endTime
  };

  return availabilitySlots[slotIndex];
};

export const deleteAvailabilitySlot = (slotId: string): boolean => {
  const index = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (index === -1) return false;
  availabilitySlots.splice(index, 1);
  return true;
};
