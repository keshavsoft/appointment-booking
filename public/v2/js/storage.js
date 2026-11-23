// Storage Adapter for V-2
// Pure data operations on localStorage, designed for seamless flat-JSON server migration

const STORAGE_KEY_PREFIX = "carecall_booking_";

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultSessionConfig() {
  return {
    startTime: "10:30",
    endTime: "13:30",
    slotDurationMinutes: 30,
    maxPerSlot: 5,
    doctorName: "Dr. Sharma (General OP)"
  };
}

export function getSessionConfig() {
  const key = `${STORAGE_KEY_PREFIX}config`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const defaultConfig = getDefaultSessionConfig();
    localStorage.setItem(key, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return getDefaultSessionConfig();
  }
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

  const newBooking = {
    id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tokenNumber,
    patientName: bookingData.patientName.trim(),
    phoneNumber: bookingData.phoneNumber.trim(),
    slotId: bookingData.slotId,
    slotLabel: bookingData.slotLabel,
    status: "BOOKED", // BOOKED | WAITING | IN_CABIN | COMPLETED
    bookingType: bookingData.bookingType || "PHONE",
    bookedAt: new Date().toISOString(),
    checkedInAt: null,
    calledAt: null
  };

  bookings.push(newBooking);
  saveAllBookings(bookings, date);
  return newBooking;
}

export function updateBookingStatus(id, newStatus, date = getTodayDateString()) {
  const bookings = getBookings(date);
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  bookings[index].status = newStatus;
  const now = new Date().toISOString();

  if (newStatus === "WAITING" && !bookings[index].checkedInAt) {
    bookings[index].checkedInAt = now;
  } else if (newStatus === "IN_CABIN") {
    bookings[index].calledAt = now;
  }

  saveAllBookings(bookings, date);
  return bookings[index];
}

export function seedDemoData(date = getTodayDateString()) {
  const sampleData = [
    {
      id: "demo-1",
      tokenNumber: 1,
      patientName: "Lakshmi Narayana",
      phoneNumber: "9848022338",
      slotId: "slot-0",
      slotLabel: "10:30 AM - 11:00 AM",
      status: "COMPLETED",
      bookingType: "PHONE",
      bookedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      checkedInAt: new Date(Date.now() - 3600000).toISOString(),
      calledAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "demo-2",
      tokenNumber: 2,
      patientName: "Srinivas Rao",
      phoneNumber: "9849112233",
      slotId: "slot-0",
      slotLabel: "10:30 AM - 11:00 AM",
      status: "IN_CABIN",
      bookingType: "PHONE",
      bookedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      checkedInAt: new Date(Date.now() - 1200000).toISOString(),
      calledAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: "demo-3",
      tokenNumber: 3,
      patientName: "K. Venkata Raman",
      phoneNumber: "9988776655",
      slotId: "slot-0",
      slotLabel: "10:30 AM - 11:00 AM",
      status: "WAITING",
      bookingType: "PHONE",
      bookedAt: new Date(Date.now() - 3600000).toISOString(),
      checkedInAt: new Date(Date.now() - 600000).toISOString(),
      calledAt: null
    },
    {
      id: "demo-4",
      tokenNumber: 4,
      patientName: "Ramesh Babu",
      phoneNumber: "9876543210",
      slotId: "slot-0",
      slotLabel: "10:30 AM - 11:00 AM",
      status: "WAITING",
      bookingType: "PHONE",
      bookedAt: new Date(Date.now() - 1800000).toISOString(),
      checkedInAt: new Date(Date.now() - 300000).toISOString(),
      calledAt: null
    },
    {
      id: "demo-5",
      tokenNumber: 5,
      patientName: "P. Sunitha",
      phoneNumber: "9123456780",
      slotId: "slot-1",
      slotLabel: "11:00 AM - 11:30 AM",
      status: "BOOKED",
      bookingType: "PHONE",
      bookedAt: new Date(Date.now() - 900000).toISOString(),
      checkedInAt: null,
      calledAt: null
    },
    {
      id: "demo-6",
      tokenNumber: 6,
      patientName: "Mohd. Khaleel",
      phoneNumber: "9440112233",
      slotId: "slot-1",
      slotLabel: "11:00 AM - 11:30 AM",
      status: "BOOKED",
      bookingType: "PHONE",
      bookedAt: new Date(Date.now() - 600000).toISOString(),
      checkedInAt: null,
      calledAt: null
    }
  ];

  saveAllBookings(sampleData, date);
  return sampleData;
}

export function clearDayData(date = getTodayDateString()) {
  const key = `${STORAGE_KEY_PREFIX}bookings_${date}`;
  localStorage.removeItem(key);
}
