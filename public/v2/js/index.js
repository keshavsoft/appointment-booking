// Entry Point for V-2 Reception Application
import bindings from "./bindings.json" with { type: "json" };
import actions, { state } from "./actions.js";
import { renderHeaderInfo, renderSlots, renderRoster, bindEvents } from "./dom.js";

function init() {
  renderHeaderInfo();
  state.selectedSlotId = renderSlots(null);
  renderRoster(state.currentFilter, state.searchTerm);
  bindEvents(document.body, bindings, actions);

  const patientNameInput = document.getElementById("patientName");
  if (patientNameInput) patientNameInput.focus();
}

document.addEventListener("DOMContentLoaded", init);
