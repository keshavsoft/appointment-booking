// Entry point for V-3 Simple Reception Booking
import bindings from "./bindings.json" with { type: "json" };
import actions, { state } from "./actions.js";
import { renderHeader, renderSlots, bindEvents } from "./dom.js";

function init() {
  renderHeader();
  state.selectedSlotId = renderSlots(null);
  bindEvents(document.body, bindings, actions);

  const nameInput = document.getElementById("patientName");
  if (nameInput) nameInput.focus();
}

document.addEventListener("DOMContentLoaded", init);
