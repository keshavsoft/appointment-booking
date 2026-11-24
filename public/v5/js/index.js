import { bindEvents } from "../vendor/dom-primitive-bindings.v8.min.js";
import bindings from "./bindings.json" with { type: "json" };
import actions, { refreshTableUI } from "./actions.js";
import { renderIntakeForm } from "./form.js";
import { getSessionConfig } from "./storage.js";

const RIGHT_FORM_CONTAINER_ID = "right-form-content";

function init() {
  const config = getSessionConfig();
  const sessionDoctor = document.getElementById("sessionDoctorTitle");
  const sessionClinic = document.getElementById("sessionClinicTitle");
  const sessionDate = document.getElementById("sessionDateBadge");

  if (sessionDoctor) sessionDoctor.textContent = `🩺 ${config.doctorName}`;
  if (sessionClinic) sessionClinic.textContent = config.clinicName;
  if (sessionDate) sessionDate.textContent = `📅 ${config.todayDate}`;

  // 1. Render Left Register Table (pure read-only, zero buttons)
  refreshTableUI();

  // 2. Render Right Form
  renderIntakeForm(RIGHT_FORM_CONTAINER_ID);

  // 3. Attach Form Submit Event Delegation
  bindEvents(document.body, bindings, actions);
}

document.addEventListener("DOMContentLoaded", init);
