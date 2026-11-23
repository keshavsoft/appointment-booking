# CareCall Appointment Booking — Architecture & Prototype Specification

> **Lightweight, flat-file friendly, phone-booking and token allocation system for clinics and hospitals.**  
> Designed to seamlessly complement the **CareCall Queue Notifier** (`appointment-notifier`).

---

## 1. Executive Summary & Vision

The existing **CareCall** engine excels at the **in-clinic execution phase**: when patients are already seated in the waiting area, the doctor presses a number or "+1 Next", and the waiting room TV speaks Telugu/English audio while displaying the active token.

The **CareCall Appointment Booking** system handles the **intake & scheduling phase**:
1. **The Phone Booking**: A patient calls the hospital front-desk; the receptionist records their name, assigns them to an open time slot (e.g., 10:30 AM – 11:00 AM), and issues a **Token Number** (e.g., Token #4).
2. **The Arrival & Check-In**: The patient arrives at 10:25 AM, informs reception: *"I am Token #4"*, and reception marks them as **Checked-In / Waiting**.
3. **The Cabin Call**: The doctor's queue screen shows who has arrived and who is next. When the doctor taps "Next", Token #4 is called, ringing the waiting room TV with the Telugu/English voice announcement.

---

## 2. Technical Philosophy: Lean, Flat-File & Frictionless

Following the CareCall core philosophy:
* **No Database Hassle**: No SQLite setup, no MySQL, no cloud dependencies.
* **Volume Reality**: At 20–30 patients/day, 1 month of clinic data is under 1,000 records (~100 KB).
* **Flat JSON Files (Phase 2)**: Stored as isolated daily files (e.g., `data/2026-11-23.json`). Easily inspected in Notepad or backed up with a simple file copy.
* **Prototype (Phase 1)**: Powered by browser `localStorage`. Zero server setup needed to validate the workflow with the doctor and receptionist.
* **Static Server**: Lightweight Node.js server powered by `sirv` running on port `3002`.

---

## 3. End-to-End Workflow

```
[ 📞 Phone Booking ]
  Patient calls front desk -> Reception records Name & Mobile
  System assigns next available Slot (e.g., 10:30 - 11:00 AM) & Token #
  Receptionist confirms: "Your slot is 10:30 - 11:00 AM, Token #4"
        │
        ▼
[ 🏥 Physical Arrival & Check-In ]
  Patient arrives at clinic -> Tells reception: "I am Token #4"
  Reception clicks [Check In] -> Status changes from BOOKED to WAITING
        │
        ▼
[ 🩺 Doctor Consultation Call ]
  Doctor sees Token #4 in Waiting Queue -> Taps "Call Token #4"
  CareCall TV Display announces Token #4 in Telugu & English
  Status updates to IN_CABIN -> COMPLETED
```

---

## 4. Time-Slot & Quota Management

For a typical morning session of **10:30 AM – 1:30 PM (3 hours)** with a target of **20–30 patients**:

| Slot | Time Range | Capacity | Assigned Tokens | Live Status |
|---|---|---|---|---|
| **Slot 1** | 10:30 AM – 11:00 AM | 5 | #1 to #5 | **FULL (5/5)** |
| **Slot 2** | 11:00 AM – 11:30 AM | 5 | #6 to #10 | **3 Booked, 2 Open** |
| **Slot 3** | 11:30 AM – 12:00 PM | 5 | #11 to #15 | **1 Booked, 4 Open** |
| **Slot 4** | 12:00 PM – 12:30 PM | 5 | #16 to #20 | **5 Open** |
| **Slot 5** | 12:30 PM – 01:00 PM | 5 | #21 to #25 | **5 Open** |
| **Slot 6** | 01:00 PM – 01:30 PM | 5 | #26 to #30 | **5 Open** |

* **Predictable Patient Arrival**: Patients in Slot 2 know they do not need to arrive at 10:15 AM; they arrive around 10:55 AM, avoiding overcrowded waiting rooms.
* **Walk-In Support**: Emergency or walk-in patients can either take an unfilled slot or be slotted in between without disrupting sequential token numbering.

---

## 5. Token Status Lifecycle

```
[ BOOKED ] ──(Patient arrives at clinic)──> [ WAITING ] 
                                                │
                                    (Doctor dials/clicks Next)
                                                ▼
[ COMPLETED ] <──(Consultation done)── [ IN CABIN ]
```

1. **`BOOKED`**: Reserved over phone. Patient has not yet reached the hospital.
2. **`WAITING`** *(Checked-in)*: Patient has arrived, confirmed at reception, and is seated in the waiting area.
3. **`IN CABIN`**: Doctor called this token; patient is inside the doctor's room.
4. **`COMPLETED`**: Consultation finished.
5. **`NO_SHOW`**: Slot expired without patient arrival (doctor can skip without stalling).

---

## 6. Data Model (Flat JSON Schema)

```json
{
  "date": "2026-11-23",
  "session": {
    "startTime": "10:30",
    "endTime": "13:30",
    "slotDuration": 30,
    "maxPerSlot": 5,
    "totalCapacity": 30
  },
  "slots": [
    {
      "id": "s1",
      "label": "10:30 AM - 11:00 AM",
      "start": "10:30",
      "end": "11:00",
      "capacity": 5,
      "booked": 4
    }
  ],
  "bookings": [
    {
      "id": "b-1795428800000",
      "tokenNumber": 4,
      "patientName": "Ramesh Kumar",
      "phoneNumber": "9876543210",
      "slotId": "s1",
      "slotLabel": "10:30 AM - 11:00 AM",
      "status": "WAITING",
      "bookingType": "PHONE",
      "bookedAt": "2026-11-23T09:15:00.000Z",
      "checkedInAt": "2026-11-23T10:25:00.000Z"
    }
  ]
}
```

---

## 7. Screen Architecture

1. **Reception Phone Desk (`/`)**:
   - Ultra-fast phone booking form (`Name`, `Phone`, `Slot Selector`).
   - Big visual confirmation card with assigned Token #.
   - Live roster table with instant search and one-touch green `[Check In]` button.
   - "Seed Sample Data" button for testing with 1 click.
2. **Doctor Live Queue View (`/queue.html`)**:
   - Live list of checked-in patients waiting to be called.
   - Highlights the next patient in line.
   - Direct button to trigger token call.

---

## 8. Phased Roadmap

* **Phase 1 (Active)**: Prototype with `localStorage`, pure HTML/CSS/JS, served via `sirv` on port `3002`.
* **Phase 2**: Add server file persistence using flat JSON files (`data/YYYY-MM-DD.json`).
* **Phase 3**: Bridge with `appointment-notifier` via WebSocket or HTTP webhook to sync token calls to the Waiting Room TV.
