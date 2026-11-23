# 📋 CareCall Booking & Token Allocation System

> **Lightweight, flat-file friendly, phone-booking and token allocation system for clinics and hospitals.**  
> Built as a companion to the **CareCall Queue Notifier** (`appointment-notifier`).

---

## ⚡ Quick Start

```powershell
# 1. Navigate to directory
cd d:\KeshavSoftRepos\nov\23\appointment\appointment-booking

# 2. Install dependencies (sirv)
npm install

# 3. Start the application
npm start
# -> CareCall Booking running on http://localhost:3002
```

Navigate to **[http://localhost:3002/](http://localhost:3002/)** in your browser.

---

## 🖥️ What You Get

| Screen | URL | Description |
|---|---|---|
| 📋 **Reception Desk** | `/` (`index.html`) | Fast telephone intake, slot picker, token assignment & 1-click arrival check-in |
| 🩺 **Doctor Queue View** | `/queue.html` | Live list of checked-in patients waiting to be called |
| 📚 **Architecture & Roadmap** | `docs/ROADMAP.md` | Full workflow, slot design, and lifecycle documentation |

---

## 💡 Key Features in this Prototype

1. **Sub-10-Second Phone Booking**:
   - Autofocus on patient name.
   - Enter Phone Number.
   - Pick available slot (e.g. 10:30–11:00 AM, max 5).
   - Press `Enter` to auto-allocate the next sequential Token #!
2. **One-Click Check-In**:
   - When the patient arrives at the clinic, reception searches their name or token and taps **`[Check In]`**.
   - Status updates from `BOOKED` to `WAITING`.
3. **Doctor Queue Screen**:
   - Doctor can see only patients who have physically arrived and are waiting in the lounge.
4. **Seed Sample Data**:
   - 1-click button to load realistic sample patients so you can demo immediately without typing.
5. **Zero Backend Hassle**:
   - Uses browser `localStorage` for the prototype.
   - Formatted in clean JSON, ready to transition to flat JSON files (`data/YYYY-MM-DD.json`).
