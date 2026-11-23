// DOM Rendering and Event Binder for V-3
import { generateSlots } from "./booking.js";
import { getSessionConfig, getTodayDateString } from "./storage.js";

export function renderHeader() {
  const config = getSessionConfig();
  const dateStr = getTodayDateString();
  const dateEl = document.getElementById("todayDate");
  const subEl = document.getElementById("headerSubtitle");

  if (dateEl) dateEl.textContent = dateStr;
  if (subEl) subEl.textContent = `${config.doctorName} • Today's Hours: ${config.startTime} AM – ${config.endTime} PM`;
}

export function renderSlots(selectedSlotId) {
  const container = document.getElementById("slotsGrid");
  const banner = document.getElementById("selectedSlotName");
  if (!container) return null;

  const slots = generateSlots();
  container.innerHTML = "";
  let activeId = selectedSlotId;

  // If active slot is not set or is full, pick first open slot
  if (!activeId || slots.find((s) => s.id === activeId)?.isFull) {
    const firstOpen = slots.find((s) => !s.isFull);
    activeId = firstOpen ? firstOpen.id : null;
  }

  slots.forEach((slot) => {
    const card = document.createElement("div");
    card.className = `slot-card ${slot.isFull ? "slot-full" : ""}`;
    card.setAttribute("data-slot-id", slot.id);

    if (slot.id === activeId) {
      card.classList.add("selected");
    }

    let patientsHtml = "";
    if (slot.patients.length > 0) {
      patientsHtml = slot.patients
        .map(
          (p) => `
          <div class="slot-patient-item">
            <span>#${p.tokenNumber} ${escapeHtml(p.patientName)}</span>
            <span>${escapeHtml(p.phoneNumber)}</span>
          </div>
        `
        )
        .join("");
    } else {
      patientsHtml = `<div class="slot-empty-notice">No bookings yet</div>`;
    }

    card.innerHTML = `
      <div class="slot-header">
        <span class="slot-time">${slot.label}</span>
        <span class="slot-count-badge">${slot.bookedCount} / ${slot.capacity} Booked</span>
      </div>
      <div class="slot-patients-list">
        ${patientsHtml}
      </div>
    `;

    container.appendChild(card);
  });

  // Update selected slot banner
  const activeSlot = slots.find((s) => s.id === activeId);
  if (banner && activeSlot) {
    banner.textContent = activeSlot.label;
  }

  return activeId;
}

export function showConfirmation(booking) {
  const banner = document.getElementById("confirmationBanner");
  const tokenEl = document.getElementById("confirmToken");
  const textEl = document.getElementById("confirmDetails");

  if (!banner) return;
  tokenEl.textContent = booking.tokenNumber;
  textEl.textContent = `Token #${booking.tokenNumber} confirmed for ${booking.patientName} (${booking.phoneNumber}) in Slot ${booking.slotLabel}`;

  banner.classList.add("active");
  banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

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
