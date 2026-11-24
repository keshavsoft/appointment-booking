// Storage Adapter for V-5 Digital Register (Zero Friction)
const STORAGE_KEY_PREFIX = "carecall_booking_";

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSessionConfig() {
  return {
    doctorName: "Dr. Aditya (MBBS, MD)",
    clinicName: "CareCall Clinic",
    todayDate: getTodayDateString()
  };
}

export function getBookings(date = getTodayDateString()) {
  const key = `${STORAGE_KEY_PREFIX}bookings_${date}`;
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveAllBookings(bookings, date = getTodayDateString()) {
  const key = `${STORAGE_KEY_PREFIX}bookings_${date}`;
  localStorage.setItem(key, JSON.stringify(bookings));
}

export function getNextTokenNumber(date = getTodayDateString()) {
  const bookings = getBookings(date);
  if (bookings.length === 0) return 1;
  const maxToken = Math.max(...bookings.map((b) => Number(b.tokenNumber) || 0));
  return maxToken + 1;
}

export function addBooking(bookingData, date = getTodayDateString()) {
  const bookings = getBookings(date);
  const tokenNumber = getNextTokenNumber(date);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newBooking = {
    id: `b-${Date.now()}`,
    tokenNumber,
    patientName: (bookingData.patientName || "").trim(),
    phoneNumber: (bookingData.phoneNumber || "").trim(),
    notes: (bookingData.notes || "").trim() || "General",
    bookedAt: timeStr
  };

  bookings.push(newBooking);
  saveAllBookings(bookings, date);
  return newBooking;
}
