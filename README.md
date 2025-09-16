# Project Information

## Frontend Installation

```bash
npm install

# Run the application
npm run seed
```

Frontend Tech Stack

- Runtime: ReactJS (with Vite)
- Routing: React Router DOM
- UI: Bootstrap, FontAwesome
- Data Handling: Axios
- Visualization: Chart.js + React-Chartjs-2
- Tables: React Data Table Component

## Backend Installation

Install all required dependencies:

```bash
npm install
# Run the application:
npm start
# Seed the database with initial data:
npm run seed
```

Backend Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM: Sequelize

# API Endpoints & Sample Requests

## API Endpoints

| Method | Endpoint                     | Description                                        |
| ------ | ---------------------------- | -------------------------------------------------- |
| POST   | `/ingest/v1/vitals`          | Ingest patient vital signs                         |
| GET    | `/fhir/Patient`              | Search patients by name or identifier              |
| GET    | `/fhir/Patient/:id`          | Get patient by ID                                  |
| GET    | `/fhir/Observation`          | Search observations (filter by patient, code date) |
| PATCH  | `/observations/:id/reviewed` | Mark an observation as reviewed                    |

---

## Sample Requests

### Ingest Heart Rate Reading

```bash
curl -X POST http://localhost:3000/ingest/v1/vitals \
  -H "Content-Type: application/json" \
  -d '{
    "device": {
      "id": "fitbit-abc-001",
      "vendor": "fitbit"
    },
    "patient": {
      "national_id": "IN-1987-XXXX",
      "name": "Asha Kumar",
      "dob": "1987-05-13",
      "sex": "female"
    },
    "reading": {
      "type": "heart_rate",
      "value": 128,
      "unit": "beats/min",
      "at": "2025-01-15T06:21:00Z"
    },
    "idempotency_key": "fitbit-abc-001:2025-01-15T06:21:00Z"
  }'
```

![Injest Vitals](/Images/InjestVitals.png)

### Ingest Blood Pressure Reading

```bash
curl -X POST http://localhost:3000/ingest/v1/vitals \
  -H "Content-Type: application/json" \
  -d '{
    "device": {
      "id": "omron-def-002",
      "vendor": "omron"
    },
    "patient": {
      "national_id": "IN-1987-XXXX",
      "name": "Asha Kumar",
      "dob": "1987-05-13",
      "sex": "female"
    },
    "reading": {
      "type": "bp",
      "systolic": 152,
      "diastolic": 96,
      "unit": "mm[Hg]",
      "at": "2025-01-15T08:30:00Z"
    },
    "idempotency_key": "omron-def-002:2025-01-15T08:30:00Z"
  }'
```

### Search Patients by Name

```bash
curl "http://localhost:3000/fhir/Patient?name=Asha"
```

![Injest Vitals](/Images/SearchPatientsByName.png)

### Search Observations by Patient ID

```bash
curl "http://localhost:3000/fhir/Observation?patient=1"
```

![Injest Vitals](/Images/patientsObv.png)

### Mark an Observation as Reviewed

```bash
curl -X PATCH http://localhost:3000/observations/1/reviewed
```
