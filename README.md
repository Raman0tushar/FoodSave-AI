# 🍱 FoodSave AI

### Predict. Prepare. Prevent Waste.

FoodSave AI is an AI-powered food demand prediction and food-waste
reduction platform designed for restaurants, hostels, college canteens,
hotels, and institutional kitchens.

The platform uses historical meal consumption data to estimate future
food demand, applies waste and day-of-week adjustments, and uses **IBM
Granite with Ollama + Retrieval-Augmented Generation (RAG)** to provide
practical, knowledge-grounded recommendations for reducing avoidable
food waste.

------------------------------------------------------------------------

## 🌱 Project Goal

Food waste is often caused by uncertainty about how much food should be
prepared.

FoodSave AI addresses this problem by combining:

-   Historical food consumption
-   Expected customer count
-   Recent waste patterns
-   Day-of-week demand patterns
-   Numerical demand prediction
-   AI-powered explanations
-   Knowledge-base retrieval
-   Surplus food donation workflow

### Primary SDG

**SDG 12 --- Responsible Consumption and Production**

### Related SDGs

-   **SDG 2 --- Zero Hunger**
-   **SDG 13 --- Climate Action**

------------------------------------------------------------------------

## 🎯 Problem Statement

Institutional kitchens often prepare food using rough estimates rather
than data-driven demand forecasting.

This can result in:

-   Overproduction
-   Avoidable food waste
-   Higher food costs
-   Inefficient kitchen operations
-   Poor demand planning

### FoodSave AI Solution

``` text
Historical Meal Data
        ↓
Demand Prediction Engine
        ↓
Predicted Food Demand
        ↓
Recommended Preparation Quantity
        ↓
AI + RAG Explanation
        ↓
Practical Waste-Reduction Actions
```

------------------------------------------------------------------------

# 🚀 Key Features

## 1. 📊 Demand Prediction

FoodSave AI calculates expected food demand using historical meal data.

The prediction engine considers:

-   Historical consumption per customer
-   Recent food waste rate
-   Waste adjustment
-   Day-of-week adjustment
-   Expected customers
-   Operational safety margin

Example:

``` text
Expected Customers        55
Historical Consumption    0.18 kg/customer
Recent Waste Rate         12%
Waste Adjustment          0.98
Day Adjustment            1.03

Predicted Demand          ≈ 10.02 kg
Recommended Preparation   ≈ 10.52 kg
```

The exact values depend on the organization's historical meal data.

------------------------------------------------------------------------

## 2. 🧠 AI Insights with IBM Granite

FoodSave AI integrates **IBM Granite** locally through **Ollama**.

Granite is used to:

-   Explain predictions
-   Answer food-waste questions
-   Generate practical recommendations
-   Provide contextual sustainability guidance

### Important Architecture Principle

The LLM does **not** determine the numerical food quantity.

``` text
PredictionService
       ↓
Numerical prediction
       ↓
Source of truth

RAG + Granite
       ↓
Explanation
Recommendations
Context
```

This keeps the numerical prediction deterministic and separates
prediction from AI-generated recommendations.

------------------------------------------------------------------------

# 🔎 Retrieval-Augmented Generation (RAG)

FoodSave AI uses RAG to ground AI recommendations in a project-specific
knowledge base.

### RAG Flow

``` text
User Question
      ↓
Embedding Generation
      ↓
nomic-embed-text
      ↓
MongoDB Atlas Vector Search
      ↓
Relevant Knowledge Documents
      ↓
Prediction Context + Retrieved Knowledge
      ↓
IBM Granite
      ↓
Grounded AI Response
```

### Knowledge Base Topics

The project can contain knowledge documents covering:

-   Food Waste Prevention
-   Batch Cooking Strategy
-   Portion Control
-   Leftover Management
-   Kitchen Inventory Management
-   Historical Demand Planning
-   Sustainable Kitchen Practices

------------------------------------------------------------------------

# ❤️ Surplus Food Donation

FoodSave AI also provides a surplus food workflow.

``` text
Demand Prediction
       ↓
Prepare Food
       ↓
Serve Customers
       ↓
Safe Surplus Available?
       │
       ├── No → Record as Waste
       │
       └── Yes
             ↓
        Safety Check
             ↓
      Eligible for Donation?
             │
             ├── No → Appropriate Disposal
             │
             └── Yes
                   ↓
              NGO Request
                   ↓
              NGO Accepts
                   ↓
            Pickup Scheduled
                   ↓
                Collected
                   ↓
                Donated
```

The current implementation stores NGO information directly with the
surplus listing rather than maintaining a separate NGO database.

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                         ┌─────────────────────┐
                         │    Food Manager      │
                         │    React Frontend    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Spring Boot      │
                         │       REST API      │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
      │ Meal / Waste│       │ Prediction   │       │  Surplus    │
      │ Management  │       │   Service    │       │  Donation   │
      └──────┬──────┘       └──────┬───────┘       └──────┬──────┘
             │                     │                      │
             └─────────────────────┼──────────────────────┘
                                   ▼
                              ┌───────────┐
                              │ MongoDB   │
                              │ / Atlas   │
                              └─────┬─────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                 ┌───────────────┐     ┌───────────────┐
                 │ Vector Search │     │ Meal / Waste  │
                 │ Knowledge     │     │ Predictions   │
                 └───────┬───────┘     └───────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   Ollama      │
                 │               │
                 │ Granite       │
                 │ nomic-embed   │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ AI Insights   │
                 │ Explanation   │
                 │ Recommendations│
                 └───────────────┘
```

------------------------------------------------------------------------

# 🧮 Prediction Engine

The current prediction engine follows this conceptual calculation:

``` text
Historical kg/customer
          ×
Expected customers
          =
Base demand

Base demand
    ×
Waste adjustment
    ×
Day-of-week adjustment
    =
Predicted demand

Predicted demand
    ×
1.05 safety margin
    =
Recommended preparation
```

## Waste Adjustment

The current rules are:

    Recent Waste Rate   Adjustment
  ------------------- ------------
               \< 10%         1.00
          10%--14.99%         0.98
          15%--19.99%         0.95
                ≥ 20%         0.92

## Day Adjustment

The day-of-week adjustment is based on historical consumption patterns
and is limited to:

``` text
0.90 → 1.10
```

This prevents extreme changes from a small historical anomaly.

## Confidence

The current confidence value is a heuristic based on the amount of
historical data:

    Historical Records   Confidence
  -------------------- ------------
                   30+          90%
                20--29          85%
                10--19          78%
                  5--9          68%
                  1--4          55%
                     0          40%

If recent waste is above 20%, the confidence is reduced by 5 percentage
points, with a minimum of 30%.

> **Note:** This confidence score is a heuristic, not a calibrated
> probability. Future versions can evaluate prediction quality using
> MAE, RMSE, and MAPE.

------------------------------------------------------------------------

# 🛠️ Technology Stack

## Frontend

-   React
-   Vite
-   Tailwind CSS
-   Axios
-   React Router
-   Recharts
-   Lucide React

## Backend

-   Java
-   Spring Boot
-   Spring Data MongoDB
-   REST APIs
-   Lombok

## Database

-   MongoDB
-   MongoDB Atlas
-   MongoDB Atlas Vector Search

## AI

-   Ollama
-   IBM Granite
-   `nomic-embed-text`
-   Retrieval-Augmented Generation (RAG)

------------------------------------------------------------------------

# 📁 Project Structure

``` text
FoodSave-AI/
│
├── foodsave-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── foodsave-backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── foodsave/
│   │       │       ├── config/
│   │       │       ├── controller/
│   │       │       ├── dto/
│   │       │       ├── exception/
│   │       │       ├── model/
│   │       │       ├── repository/
│   │       │       └── service/
│   │       └── resources/
│   └── pom.xml
│
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

# 📡 Main API Modules

## Organizations

``` text
POST   /api/organizations
GET    /api/organizations
GET    /api/organizations/{id}
PUT    /api/organizations/{id}
DELETE /api/organizations/{id}
```

## Meals

``` text
POST   /api/meals
GET    /api/meals
GET    /api/meals/{id}
GET    /api/meals/organization/{organizationId}
PUT    /api/meals/{id}
DELETE /api/meals/{id}
```

## Waste

``` text
POST /api/waste/meal/{mealId}
GET  /api/waste
GET  /api/waste/organization/{organizationId}
GET  /api/waste/organization/{organizationId}/summary
```

## Predictions

``` text
POST /api/predictions
GET  /api/predictions
GET  /api/predictions/organization/{organizationId}
```

## AI

``` text
POST /api/ai/prediction-insight
POST /api/ai/rag-insight
```

## Knowledge Base

``` text
POST   /api/knowledge
GET    /api/knowledge
GET    /api/knowledge/{id}
GET    /api/knowledge/category/{category}
GET    /api/knowledge/source/{source}
GET    /api/knowledge/tag/{tag}
DELETE /api/knowledge/{id}
```

## Surplus Donation

``` text
POST /api/surplus
GET  /api/surplus
GET  /api/surplus/organization/{organizationId}
```

Additional workflow endpoints manage safety approval, NGO requests,
acceptance, pickup, collection, donation, cancellation, and expiry.

------------------------------------------------------------------------

# 💻 Local Setup

## Prerequisites

Install:

-   Java
-   Maven
-   Node.js
-   npm
-   MongoDB or MongoDB Atlas
-   Ollama

Verify:

``` bash
java -version
mvn -version
node -v
npm -v
ollama --version
```

------------------------------------------------------------------------

# ⚙️ Backend Setup

Go to:

``` bash
cd foodsave-backend
```

Configure MongoDB in:

``` text
src/main/resources/application.properties
```

Example local AI configuration:

``` properties
ollama.url=http://localhost:11434
ollama.model=granite4
ollama.embedding-model=nomic-embed-text
```

Start the backend:

``` bash
mvn spring-boot:run
```

Backend:

``` text
http://localhost:8080
```

------------------------------------------------------------------------

# 🤖 Ollama Setup

Pull the required models:

``` bash
ollama pull granite4
ollama pull nomic-embed-text
```

Check installed models:

``` bash
ollama list
```

Test Granite:

``` bash
ollama run granite4
```

Test Ollama API:

``` bash
curl http://localhost:11434/api/tags
```

------------------------------------------------------------------------

# 🎨 Frontend Setup

Go to:

``` bash
cd foodsave-frontend
```

Install dependencies:

``` bash
npm install
```

Start Vite:

``` bash
npm run dev
```

The frontend normally runs at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 🔐 Environment and Secrets

Do not commit:

-   MongoDB passwords
-   MongoDB connection strings containing credentials
-   API keys
-   `.env` files
-   local build directories
-   `node_modules`
-   Java `target` directories

Use environment variables for production credentials.

Example:

``` text
.env
.env.local
```

These files are excluded by `.gitignore`.

------------------------------------------------------------------------

# 🧪 Example Prediction Request

``` json
{
  "organizationId": "YOUR_ORGANIZATION_ID",
  "predictionDate": "2026-09-21",
  "mealType": "LUNCH",
  "expectedCustomers": 55
}
```

Example response structure:

``` json
{
  "organizationId": "YOUR_ORGANIZATION_ID",
  "predictionDate": "2026-09-21",
  "mealType": "LUNCH",
  "expectedCustomers": 55,
  "predictedDemandKg": 10.02,
  "recommendedPreparationKg": 10.52,
  "historicalKgPerCustomer": 0.18,
  "recentWasteRate": 12.0,
  "wasteAdjustment": 0.98,
  "dayAdjustment": 1.03,
  "confidence": 78.0,
  "predictionMethod": "Historical Consumption + Waste + Day-of-Week Adjustment"
}
```

The values above are illustrative; actual predictions depend on stored
meal history.

------------------------------------------------------------------------

# 🧠 Example RAG Request

``` json
{
  "organizationId": "YOUR_ORGANIZATION_ID",
  "predictionId": "YOUR_PREDICTION_ID",
  "query": "How can I reduce food waste when demand is uncertain?"
}
```

The system:

``` text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Relevant FoodSave Knowledge
   ↓
Prediction Context
   ↓
IBM Granite
   ↓
Grounded Response
```

------------------------------------------------------------------------

# 📈 Future Improvements

Potential future improvements include:

-   ML-based time-series forecasting
-   Weather-aware demand prediction
-   Holiday and event detection
-   Menu-item-level prediction
-   More accurate prediction evaluation
-   MAE / RMSE / MAPE dashboards
-   Automated NGO matching
-   Real-time surplus notifications
-   Redis caching
-   Role-based access control
-   Production authentication
-   Advanced MongoDB Vector Search filtering
-   Prediction model retraining
-   Food cost and savings analytics

------------------------------------------------------------------------

# 🌍 Sustainability Impact

FoodSave AI is designed to support more efficient food preparation by
helping kitchens make data-informed decisions.

Potential impact areas include:

``` text
Better Demand Planning
        ↓
Less Overproduction
        ↓
Less Avoidable Food Waste
        ↓
Lower Resource Consumption
        ↓
Better Sustainability
```

When safe surplus food remains available, the donation workflow provides
a pathway toward recovery rather than treating all surplus as waste.

------------------------------------------------------------------------

# 📜 Project Context

This project was developed as part of the:

**1M1B AI for Sustainability Virtual Internship**

in collaboration with:

-   IBM SkillsBuild
-   AICTE

The project focuses on applying AI to a practical sustainability problem
aligned with the Sustainable Development Goals.

------------------------------------------------------------------------

# 👨‍💻 Project

**FoodSave AI**

**Tagline:** Predict. Prepare. Prevent Waste.

Built with:

``` text
React
+
Spring Boot
+
MongoDB
+
Ollama
+
IBM Granite
+
RAG
```

------------------------------------------------------------------------

## ⭐ If you find this project useful

Star the repository and explore how AI can be applied to practical
sustainability challenges.
