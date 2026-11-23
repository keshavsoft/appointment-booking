// Slot Calculations for V-2
import { getSessionConfig, getBookings } from "./storage.js";

function timeToMinutes(timeStr) {
  const [hours, mins] = timeStr.split(":").map(Number);
  return hours * 60 + mins;
}

function minutesToTime(totalMins) {
  const hours24 = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const padMins = String(mins).padStart(2, "0");
  return `${hours12}:${padMins} ${period}`;
}

export function generateSlots() {
  const config = getSessionConfig();
  const startMins = timeToMinutes(config.startTime);
  const endMins = timeToMinutes(config.endTime);
  const duration = config.slotDurationMinutes || 30;
  const maxPerSlot = config.maxPerSlot || 5;

  const bookings = getBookings();
  const slots = [];
  let currentStart = startMins;
  let slotIndex = 0;

  while (currentStart + duration <= endMins) {
    const currentEnd = currentStart + duration;
    const slotId = `slot-${slotIndex}`;
    const label = `${minutesToTime(currentStart)} - ${minutesToTime(currentEnd)}`;

    const slotBookings = bookings.filter((b) => b.slotId === slotId);
    const bookedCount = slotBookings.length;
    const isFull = bookedCount >= maxPerSlot;

    slots.push({
      id: slotId,
      index: slotIndex,
      label,
      startMinutes: currentStart,
      endMinutes: currentEnd,
      capacity: maxPerSlot,
      bookedCount,
      isFull
    });

    currentStart += duration;
    slotIndex++;
  }

  return slots;
}
