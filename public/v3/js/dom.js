// DOM Rendering & Declarative Event Binder for V-3 Zero-Scroll Layout
import { generateSlots } from "./booking.js";
import { getSessionConfig, getTodayDateString, getBookings } from "./storage.js";

export function renderTopBar() {
  const config = getSessionConfig();
  const dateStr = getTodayDateString();
  const bookings = getBookings();
  const titleEl = document.getElementById("topBarTitle");
  const detailsEl = document.getElementById("topBarDetails");

  if (titleEl) {
    titleEl.textContent = `🩺 ${config.doctorName}`;
  }
  if (detailsEl) {
    detailsEl.innerHTML = `
      <span>📅 ${dateStr}</span>
      <span>⏰ ${config.startTime} – ${config.endTime}</span>
      <span>Booked: <strong>${bookings.length} / 30</strong></span>
    `;
  }
}

export function renderSlots(selectedSlotId) {
  const container = document.getElementById("slotsGrid");
  const banner = document.getElementById("selectedSlotIndicator");
  if (!container) return null;

  const slots = generateSlots();
  container.innerHTML = "";
  let activeId = selectedSlotId;

  // Auto-pick first available slot if none selected or if selected is full
  if (!activeId || slots.find((s) => s.id === activeId)?.isFull) {
    const firstOpen = slots.find((s) => !s.isFull);
    activeId = firstOpen ? firstOpen.id : (slots[0] ? slots[0].id : null);
  }

  slots.forEach((slot) => {
    const card = document.createElement("div");
    card.className = `slot-card ${slot.isFull ? "slot-full" : ""}`;
    card.setAttribute("data-slot-id", slot.id);

    if (slot.id === activeId) {
      card.classList.add("selected");
    }

    let chipsHtml = "";
    if (slot.patients.length > 0) {
      chipsHtml = slot.patients
        .map(
          (p) => `
          <div class="slot-chip-item">
            <span>#${p.tokenNumber} ${escapeHtml(p.patientName)}</span>
            <span>${escapeHtml(p.phoneNumber)}</span>
          </div>
        `
        )
        .join("");
    } else {
      chipsHtml = `<div style="font-style:italic;color:var(--text-dim)">Open (0 Booked)</div>`;
    }

    card.innerHTML = `
      <div class="slot-card-header">
        <span class="slot-card-time">${slot.label}</span>
        <span class="slot-badge">${slot.bookedCount} / ${slot.capacity} Booked</span>
      </div>
      <div class="slot-booked-chips">
        ${chipsHtml}
      </div>
    `;

    container.appendChild(card);
  });

  // Update selected slot banner on right panel
  const activeSlot = slots.find((s) => s.id === activeId);
  if (banner && activeSlot) {
    banner.textContent = activeSlot.label;
  }

  return activeId;
}

export function showConfirmation(booking) {
  const box = document.getElementById("confirmationBox");
  const tokenBadge = document.getElementById("confirmTokenBadge");
  const descEl = document.getElementById("confirmMsgDesc");

  if (!box) return;
  tokenBadge.textContent = booking.tokenNumber;
  descEl.textContent = `Token #${booking.tokenNumber} allocated to ${booking.patientName} (${booking.phoneNumber}) for ${booking.slotLabel}`;

  box.classList.add("active");
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
