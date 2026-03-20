# 🏎️ PitWall — F1 Race Intelligence

> *"To finish first, first you must finish."* — Unless you're Ferrari, in which case you'll find a creative new way to not finish even when you're leading.

**[pitwall-f1.com](https://pitwall-f1.com)** — The F1 data tool fans actually want. Built by one obsessed CS student who has spent more time debugging lap time data than sleeping.

---

## 🔴 Why I Built This

I'm a Ferrari fan. Yes, I know. I've already suffered enough — I don't need your pity.

After watching Ferrari snatch defeat from the jaws of victory for the 47th time, I wanted to go back and *prove* with data that the strategy call was wrong. Every time. Without exception.

Turns out no free tool existed that let you do this properly. So I built one.

PitWall is what happens when a CS student with too much passion for F1 and not enough sleep decides that "just use the official F1 app" is not an acceptable answer.

---

## 🚀 Features

### 🏁 Race Replay
Relive any race from **2018 to live 2026** with real telemetry data:
- Position changes every single lap
- Lap time comparisons between drivers
- Tire strategy breakdown — see exactly when Ferrari pitted too early
- Gap to race leader — watch the gap close and then inexplicably open again
- Sector times — find out which sector Leclerc was losing time in

### ⚔️ Head to Head
Settle every argument with actual data:
- Compare any two drivers across a full season
- Points, wins, podiums, poles, average finish, DNFs
- Race by race visual breakdown
- Works for any season 2018-2026
- Yes you can compare Leclerc vs Sainz and yes it will hurt

### 🏆 Championship Standings
- Driver standings for every season back to 2018
- Constructor standings too
- Watch Ferrari finish P2 in the constructors in glorious detail

### 🤖 AI Race Analyst
Ask anything about any race and get real answers backed by actual lap data:
- "Who was P3 on lap 6?" — It knows. Exactly.
- "Was Ferrari's strategy correct?" — Spoiler: No. The answer is always no.
- "Why did Leclerc lose the lead?" — Grab a coffee, this might take a while.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| F1 Data | FastF1 + Jolpica API |
| AI | OpenAI GPT-4o-mini |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |
| Database | None needed (FastF1 handles it) |
| Emotional support | None (Ferrari fan, remember) |

---

## 📊 Data Coverage

- **Seasons:** 2018 — 2026 (live)
- **Races:** Every Grand Prix including sprints
- **Data:** Real telemetry — lap times, positions, tire compounds, sector times
- **Standings:** Driver and Constructor championships
- **Updates:** New races added automatically every weekend

---

## 🔧 Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- An OpenAI API key
- Patience (FastF1 downloads data on first load — grab a coffee)
- Optional: therapy, if you're also a Ferrari fan

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:
```
OPENAI_API_KEY=your_key_here
```

Start the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — you're in the pit lane.

---

## 🌐 Deployment

| Service | Purpose | URL |
|---|---|---|
| Vercel | Frontend hosting | pitwall-f1.com |
| Railway | Backend API | pitwall-production-c292.up.railway.app |

Both auto-deploy when you push to `main`. Like a perfectly executed pit stop — except this one actually works.

---

## 🏗️ Project Structure

```
pitwall/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile            # Railway deployment config
│   └── routes/
│       ├── race.py         # Race data endpoints
│       └── ai.py           # AI analyst endpoint
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Homepage
│   │   │   ├── RaceReplay.jsx   # Race analysis
│   │   │   ├── HeadToHead.jsx   # Driver comparison
│   │   │   ├── Standings.jsx    # Championship standings
│   │   │   ├── Contact.jsx      # Contact page
│   │   │   └── Support.jsx      # Buy me a coffee
│   │   ├── components/
│   │   │   └── Navbar.jsx       # Navigation
│   │   └── App.jsx             # Routes
│   └── index.html
└── README.md               # You are here
```

---

## 📡 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /race?year=&gp=` | Full race data with positions, lap times, tires |
| `GET /races?year=` | List of races for a season |
| `GET /gap-to-leader?year=&gp=` | Gap to leader per lap |
| `GET /sectors?year=&gp=` | Sector times per lap |
| `GET /h2h?year=&driver1=&driver2=` | Head to head season comparison |
| `GET /standings/drivers?year=` | Driver championship standings |
| `GET /standings/constructors?year=` | Constructor standings |
| `POST /analyze` | AI race analyst |

---

## 🔴 A Note on Being a Ferrari Fan

Building a tool that objectively shows Ferrari's strategy mistakes in high definition was perhaps not the wisest decision for my mental health.

On the bright side, PitWall now contains the most comprehensive database of Ferrari strategic errors ever assembled. I am thinking of submitting it to the Guinness World Records.

Some things I have confirmed with data while building this:
- Yes, Ferrari did pit Leclerc too early at Monaco 2024
- Yes, the gap was unrecoverable
- Yes, Sainz would have held position with different tires
- No, I am still not over it
- Yes, I will be fine

*Forza Ferrari.* 🔴

---

## 💰 Support PitWall

If PitWall helped you win an argument about tire strategy, settle a debate about who really was faster, or just made watching F1 more interesting — consider buying me a coffee.

Server costs are real. OpenAI API calls are real. Ferrari heartbreak is very real.

**[buymeacoffee.com/arushbhise](https://buymeacoffee.com/arushbhise)**

---

## 📬 Contact

Built and maintained by **Arush Bhise** — CS student at University of New Brunswick, Ferrari fan, and apparently a glutton for punishment.

- 📧 Email: arush.bhise@unb.ca
- 🌐 Website: pitwall-f1.com
- 💻 GitHub: github.com/arushbhise-rgb

Got a feature request? Found a bug? Want to discuss why Ferrari keeps doing this? I read every message.

---

## ⚖️ License

Copyright © 2026 Arush Bhise. All rights reserved.

This source code is available for viewing purposes only. You may not copy, modify, distribute, or use this code in your own projects without explicit written permission.

See the [LICENSE](./LICENSE) file for full details.

---

## 🏁 Final Lap

> *"The best car doesn't always win. The best strategy wins."*
>
> Ferrari has taken note of this quote and is currently investigating why it does not apply to them.

---

*PitWall is not affiliated with Formula 1, the FIA, or any F1 team. Especially not Ferrari. They have enough problems.*

*Real F1 data powered by [FastF1](https://docs.fastf1.dev/) and [Jolpica](https://api.jolpi.ca/).*

![Made with love and race data](https://img.shields.io/badge/Made%20with-Race%20Data%20%F0%9F%8F%8E%EF%B8%8F-red)
![Ferrari Fan](https://img.shields.io/badge/Ferrari%20Fan-Suffering%20Daily-red)
![Free Forever](https://img.shields.io/badge/Free-Forever-brightgreen)
