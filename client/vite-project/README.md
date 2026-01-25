# YatraMaker

YatraMaker is a budget-based travel discovery platform that helps users
find destinations and itineraries they can realistically afford within India.

Unlike traditional travel search tools, YatraMaker starts with a user’s
budget and computes where they can travel based on cost constraints,
origin, trip duration, and preferences.

---

## Architecture Overview

### Client
- React (Vite)
- Tailwind CSS
- Client-side rendered SPA

The client provides the interactive interface for entering budget,
preferences, and viewing computed travel results.

### Server
- Node.js
- Express
- MongoDB

The backend handles:
- Budget and itinerary computation
- Destination and cost modeling
- User accounts and saved itineraries

---

## Core Concepts

- **Budget-first planning**: Users start with how much they can spend.
- **Constraint-based computation**: Destinations and itineraries are
  evaluated against budget, duration, and preference constraints.
- **Indicative planning**: Outputs are guidance, not real-time bookings.

---

## Supporting Content

The blog at https://blog.yatramaker.com provides:
- Budget travel guides
- Planning explanations
- Examples derived from system logic

---

## Disclaimer

YatraMaker is not a booking platform or travel agency.
All prices are indicative and intended for planning purposes only.
