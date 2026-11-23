// Entry point for V-3
import bindings from "./bindings.json" with { type: "json" };
import actions, { state } from "./actions.js";
import { renderTopBar, renderSlots, bindEvents } from "./dom.js";

function init() {
  renderTopBar();
  state.selectedSlotId = renderSlots(null);
  bindEvents(document.body, bindings, actions);

  const nameInput = document.getElementById("patientName");
  if (nameInput) nameInput.focus();
}

document.addEventListener("DOMContentLoaded", init);
