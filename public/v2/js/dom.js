// DOM Rendering & Declarative Event Binder for V-2
import { getBookings, getSessionConfig, getTodayDateString } from "./storage.js";
import { generateSlots } from "./booking.js";

export function renderHeaderInfo() {
  const config = getSessionConfig();
  const dateStr = getTodayDateString();
  const todayDateEl = document.getElementById("todayDate");
  const doctorInfoEl = document.getElementById("doctorInfo");

  if (todayDateEl) todayDateEl.textContent = `📅 ${dateStr}`;
  if (doctorInfoEl) doctorInfoEl.textContent = `🩺 ${config.doctorName} (${config.startTime} – ${config.endTime})`;
}

export function renderSlots(selectedSlotId) {
  const slotsContainer = document.getElementById("slotsContainer");
  if (!slotsContainer) return null;

  const slots = generateSlots();
  slotsContainer.innerHTML = "";
  let activeSlotId = selectedSlotId;

  let firstAvailableSlotId = null;

  slots.forEach((slot) => {
    const slotEl = document.createElement("div");
    slotEl.className = `slot-option ${slot.isFull ? "slot-full" : ""}`;
    slotEl.setAttribute("data-slot-id", slot.id);

    if (slot.id === activeSlotId) {
      slotEl.classList.add("selected");
    }

    slotEl.innerHTML = `
      <span class="slot-time">🕒 ${slot.label}</span>
      <span class="slot-badge">${slot.bookedCount} / ${slot.capacity} Booked</span>
    `;

    if (!slot.isFull && !firstAvailableSlotId) {
      firstAvailableSlotId = slot.id;
    }

    slotsContainer.appendChild(slotEl);
  });

  if (!activeSlotId || slots.find((s) => s.id === activeSlotId)?.isFull) {
    activeSlotId = firstAvailableSlotId;
    if (activeSlotId) {
      const el = slotsContainer.querySelector(`[data-slot-id="${activeSlotId}"]`);
      if (el) el.classList.add("selected");
    }
  }

  return activeSlotId;
}

export function renderRoster(currentFilter = "ALL", searchTerm = "") {
  const rosterTbody = document.getElementById("rosterTbody");
  const totalBookedCountEl = document.getElementById("totalBookedCount");
  const checkedInCountEl = document.getElementById("checkedInCount");
  if (!rosterTbody) return;

  const bookings = getBookings();
  const cleanSearch = searchTerm.toLowerCase().trim();

  if (totalBookedCountEl) totalBookedCountEl.textContent = bookings.length;
  const waitingCount = bookings.filter((b) => b.status === "WAITING" || b.status === "IN_CABIN").length;
  if (checkedInCountEl) checkedInCountEl.textContent = waitingCount;

  let filtered = bookings.filter((b) => {
    const matchesSearch =
      b.patientName.toLowerCase().includes(cleanSearch) ||
      b.phoneNumber.includes(cleanSearch) ||
      String(b.tokenNumber) === cleanSearch;

    if (!matchesSearch) return false;

    if (currentFilter === "ALL") return true;
    if (currentFilter === "WAITING") return b.status === "WAITING" || b.status === "IN_CABIN";
    if (currentFilter === "BOOKED") return b.status === "BOOKED";
    if (currentFilter === "COMPLETED") return b.status === "COMPLETED";
    return true;
  });

  filtered.sort((a, b) => a.tokenNumber - b.tokenNumber);

  if (filtered.length === 0) {
    rosterTbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No appointments found for this filter.</td>
      </tr>
    `;
    return;
  }

  rosterTbody.innerHTML = filtered
    .map((b) => {
      let actionHtml = "";
      if (b.status === "BOOKED") {
        actionHtml = `<button class="btn-action btn-checkin" data-id="${b.id}">✓ Check In</button>`;
      } else if (b.status === "WAITING") {
        actionHtml = `<button class="btn-action btn-call" data-id="${b.id}">📞 Call In</button>`;
      } else if (b.status === "IN_CABIN") {
        actionHtml = `<button class="btn-action btn-done" data-id="${b.id}">Done ✓</button>`;
      } else {
        actionHtml = `<span style="color:var(--text-dim);font-size:0.8rem">Finished</span>`;
      }

      return `
      <tr>
        <td>
          <div class="token-pill">${b.tokenNumber}</div>
        </td>
        <td>
          <div class="patient-info">
            <span class="patient-name">${escapeHtml(b.patientName)}</span>
            <span class="patient-phone">📞 ${escapeHtml(b.phoneNumber)}</span>
          </div>
        </td>
        <td>
          <span style="font-weight:600;font-size:0.85rem">${b.slotLabel}</span>
        </td>
        <td>
          <span class="status-badge status-${b.status}">${formatStatus(b.status)}</span>
        </td>
        <td>${actionHtml}</td>
      </tr>
    `;
    })
    .join("");
}

export function showSuccessModal(booking) {
  const modal = document.getElementById("successModal");
  if (!modal) return;
  document.getElementById("modalTokenNumber").textContent = booking.tokenNumber;
  document.getElementById("modalPatientName").textContent = booking.patientName;
  document.getElementById("modalPhoneNumber").textContent = booking.phoneNumber;
  document.getElementById("modalSlotTime").textContent = booking.slotLabel;
  modal.classList.add("active");
}

export function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  if (modal) modal.classList.remove("active");
}

function formatStatus(status) {
  if (status === "BOOKED") return "Booked (Phone)";
  if (status === "WAITING") return "Waiting in Lounge";
  if (status === "IN_CABIN") return "Inside Cabin";
  if (status === "COMPLETED") return "Completed";
  return status;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// Declarative Event Binder: Binds JSON bindings to matching actions
export function bindEvents(rootElement, bindings, actions) {
  bindings.forEach(({ event, selector, action }) => {
    const handler = actions[action];
    if (typeof handler !== "function") return;

    rootElement.addEventListener(event, (e) => {
      const match = e.target.closest(selector);
      if (match && rootElement.contains(match)) {
        handler(e, match);
      }
    });
  });
}
