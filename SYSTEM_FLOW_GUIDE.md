# SYSTEM ARCHITECTURE & DATA FLOW GUIDE

## Visual Overview

### 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     BFHL Tree Analyzer System                   │
└─────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │ User Browser │
                            └──────┬───────┘
                                   │
                    ┌──────────────┘│└──────────────┐
                    │              │               │
                    ▼              ▼               ▼
         ┌──────────────────┐    HTTP           HTTPS
         │    Frontend      │   Request/         (TLS
         │  React App       │   Response      Encrypted)
         │  (Vite Build)    │
         │  Vercel Hosted   │
         └────────┬─────────┘
                  │
                  │ (CORS-protected)
                  │ POST /bfhl with JSON
                  ▼
         ┌──────────────────┐
         │    Backend       │
         │   Express API    │
         │  Node.js Server  │
         │  Render Hosted   │
         └────────┬─────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
   Algorithm          Database
  processData()      MongoDB Atlas
   (CPU)              (Storage)
        │                    │
        └─────────┬──────────┘
                  │
                  ▼ (JSON Response)
              User Sees
            Tree Visualization
            + Summary Stats
```

---

## 2. REQUEST LIFECYCLE (Step-by-Step)

### Phase 1: User Interaction (Frontend)

```
┌─────────────────────────────────────────────┐
│ Step 1: User enters edges in text area      │
│ Example: "A->B,B->C,A->C"                   │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 2: User clicks Submit button           │
│ Event: onClick handler triggered            │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 3: React parses input into array       │
│ Result: ["A->B", "B->C", "A->C"]            │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 4: useApi hook creates fetch request   │
│ Method: POST                                │
│ URL: https://bajaj-challenge-015j.         │
│      onrender.com/bfhl                      │
│ Headers: Content-Type: application/json     │
│ Body: { "data": ["A->B", "B->C", "A->C"] } │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 5: Loading spinner appears            │
│ Message: "Analysing graph..."               │
│ AbortController ready for cancellation      │
└────────────┬────────────────────────────────┘
```

### Phase 2: Network Transmission

```
┌──────────────────────────────────────┐
│ Step 6: Browser sends HTTP request   │
│ Network: HTTPS (TLS encrypted)       │
│ CORS: Browser includes Origin header │
│ Device → Internet → Render Server    │
└────────────┬─────────────────────────┘
             │
        (Network Latency)
             │
┌────────────▼─────────────────────────┐
│ Step 7: Render receives request      │
│ Server checks CORS headers           │
│ Origin: https://bajaj-challenge-    │
│         plum.vercel.app ✅ Allowed   │
└────────────┬─────────────────────────┘
```

### Phase 3: Backend Processing

```
┌────────────────────────────────────────────┐
│ Step 8: Express middleware processes       │
│ - JSON parser extracts { "data": [...] }   │
│ - Validates request body                   │
│ Status: Valid ✅                            │
└────────────┬───────────────────────────────┘
             │
┌────────────▼───────────────────────────────┐
│ Step 9: Call processData() algorithm       │
│ Input: ["A->B", "B->C", "A->C"]            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9a: Validate each edge    │    │
│ │ ✓ "A->B" matches /^[A-Z]->[A-Z]$/  │    │
│ │ ✓ "B->C" matches pattern            │    │
│ │ ✓ "A->C" matches pattern            │    │
│ │ Result: all valid                   │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9b: Check for duplicates  │    │
│ │ Count: {"A->B": 1, "B->C": 1,      │    │
│ │         "A->C": 1}                 │    │
│ │ Result: no duplicates               │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9c: Build child map        │    │
│ │ A → [B, C]                          │    │
│ │ B → [C]                             │    │
│ │ C → []                              │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9d: Find connected groups │    │
│ │ All nodes connected: {A, B, C}      │    │
│ │ Result: 1 group                     │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9e: Detect cycles         │    │
│ │ DFS from A: A→B→C→(dead end)       │    │
│ │ A→C→(dead end)                     │    │
│ │ No cycle detected ✅                │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9f: Pick root             │    │
│ │ Natural root: A (never a child)     │    │
│ │ Root: "A"                           │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9g: Build nested tree      │    │
│ │ { "A": { "B": { "C": {} },          │    │
│ │         "C": {} } }                 │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9h: Calculate depth        │    │
│ │ Longest path: A→B→C (3 nodes)       │    │
│ │ Depth: 3                            │    │
│ └─────────────────────────────────────┘    │
│                                            │
│ ┌─────────────────────────────────────┐    │
│ │ Sub-Step 9i: Build summary          │    │
│ │ total_trees: 1                      │    │
│ │ total_cycles: 0                     │    │
│ │ largest_tree_root: "A"              │    │
│ └─────────────────────────────────────┘    │
└────────────┬───────────────────────────────┘
             │
┌────────────▼───────────────────────────────┐
│ Step 10: Build response payload            │
│ {                                          │
│   "user_id": "PreethiSampathDoddi_0...", │
│   "email_id": "prethisampath_...",        │
│   "college_roll_number": "AP231...",      │
│   "hierarchies": [                         │
│     {                                      │
│       "root": "A",                         │
│       "tree": { ... },                     │
│       "depth": 3                           │
│     }                                      │
│   ],                                       │
│   "invalid_entries": [],                   │
│   "duplicate_edges": [],                   │
│   "summary": { ... }                       │
│ }                                          │
└────────────┬───────────────────────────────┘
             │
┌────────────▼───────────────────────────────┐
│ Step 11: Save to MongoDB (non-blocking)    │
│ Insert document to Analysis collection     │
│ Status: Saved ✅ (or logged if fails)      │
└────────────┬───────────────────────────────┘
             │
┌────────────▼───────────────────────────────┐
│ Step 12: Return response to frontend       │
│ HTTP 200 OK                                │
│ Headers: Content-Type: application/json    │
│ Body: [JSON payload from Step 10]          │
└────────────┬───────────────────────────────┘
```

### Phase 4: Network Transmission Back

```
┌─────────────────────────────────┐
│ Step 13: Response travels back   │
│ HTTP over HTTPS (TLS encrypted)  │
│ Render → Internet → User Browser │
└────────────┬────────────────────┘
             │
        (Network Latency)
             │
┌────────────▼────────────────────┐
│ Step 14: Browser receives        │
│ HTTP 200 with JSON body          │
└────────────┬────────────────────┘
```

### Phase 5: Frontend Display

```
┌────────────┬────────────────────────────────┐
│ Step 15: React processes response           │
│ useApi hook updates state:                  │
│ - loading: false                            │
│ - error: null                               │
│ - data: { full response JSON }              │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 16: Component re-renders               │
│ Spinner disappears                          │
│ Results section shows with slideUp animation│
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 17: Display SummaryCard                │
│ ┌──────────────────────────────┐            │
│ │ Total Trees:  1              │            │
│ │ Total Cycles: 0              │            │
│ │ Largest Root: A              │            │
│ └──────────────────────────────┘            │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 18: Display TreeCard                   │
│ ┌──────────────────────────────┐            │
│ │ ▼ A (clickable root toggle)  │            │
│ │   ▼ B (collapsible node)    │            │
│ │     D {}                     │            │
│ │   ▼ C (collapsible node)    │            │
│ │     E {}                     │            │
│ │     F {}                     │            │
│ │ Depth: 3                     │            │
│ └──────────────────────────────┘            │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 19: Display BadgeLists                 │
│ ┌──────────────────────────────┐            │
│ │ Invalid Entries: (empty)     │            │
│ │ Duplicate Edges: (empty)     │            │
│ └──────────────────────────────┘            │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ Step 20: User sees final result!            │
│ Beautiful tree visualization with stats     │
│ Ready for next input                        │
└────────────────────────────────────────────┘
```

---

## 3. ALGORITHM FLOW DIAGRAM

```
                    INPUT: ["A->B", "B->C", "A->C"]
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Validate each edge  │
                    │ Regex: /^[A-Z]-...  │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Check for           │
                    │ duplicates          │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Build child map:    │
                    │ A→[B,C], B→[C]     │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Collect all labels: │
                    │ {A, B, C}           │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Find connected      │
                    │ components (BFS)    │
                    │ Groups: [{A,B,C}]   │
                    └─────────┬───────────┘
                              │
                    ┌─────────┴─────────┐
                    │ For each group    │
                    │ Process:          │
                    ▼                   ▼
            ┌──────────────┐    ┌────────────┐
            │ Cycle detect?│    │ Pick root  │
            │ (DFS)        │    │ (no child) │
            └──────┬───────┘    └─────┬──────┘
                   │                  │
            ┌──────▼──────┐           │
         YES│             │NO         │
            ▼             ▼           ▼
    ┌───────────────┐  ┌──────────────────────┐
    │ Return:       │  │ 1. Build tree (BFS) │
    │ tree: {}      │  │ 2. Calc depth (BFS) │
    │ has_cycle:true   │ 3. Return tree+depth │
    │ (no depth)    │  └──────────────────────┘
    └───────────────┘           │
            │                   │
            └─────────┬─────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Build summary:      │
            │ total_trees         │
            │ total_cycles        │
            │ largest_tree_root   │
            └─────────┬───────────┘
                      │
                      ▼
                  OUTPUT JSON
```

---

## 4. DATA STRUCTURE TRANSFORMATIONS

### Step-by-Step Example

```
INPUT ARRAY:
["A->B", "B->C", "A->C"]

                    ↓

AFTER VALIDATION:
validEdges = ["A->B", "B->C", "A->C"]
invalidEntries = []

                    ↓

AFTER DEDUP:
uniqueEdges = ["A->B", "B->C", "A->C"]
duplicateEdges = []

                    ↓

AFTER BUILDING CHILD MAP:
childMap = {
  "A": ["B", "C"],
  "B": ["C"]
}
childSet = {"B", "C"}

                    ↓

AFTER COLLECTING LABELS:
allLabels = Set {"A", "B", "C"}

                    ↓

AFTER FINDING GROUPS:
groups = [Set {"A", "B", "C"}]

                    ↓

AFTER CYCLE DETECTION:
isCyclic = false

                    ↓

AFTER PICKING ROOT:
root = "A"  (only node not in childSet)

                    ↓

AFTER BUILDING TREE:
tree = {
  "A": {
    "B": {
      "C": {}
    },
    "C": {}
  }
}

                    ↓

AFTER CALCULATING DEPTH:
depth = 3  (A→B→C longest path has 3 nodes)

                    ↓

HIERARCHY OBJECT:
{
  "root": "A",
  "tree": { "A": { "B": { "C": {} }, "C": {} } },
  "depth": 3
}

                    ↓

FINAL RESPONSE:
{
  "user_id": "PreethiSampathDoddi_08052006",
  "email_id": "prethisampath_doddi@srmap.edu.in",
  "college_roll_number": "AP23110010958",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": { "C": {} }, "C": {} } },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## 5. DEPLOYMENT FLOW

```
┌─────────────────────────────────────────────┐
│ Developer pushes code to GitHub             │
│ git push origin main                        │
└────────────┬────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌──────────────┐
│   Render    │  │    Vercel    │
│  (Backend)  │  │  (Frontend)  │
└────────┬────┘  └──────┬───────┘
         │               │
         ▼               ▼
┌─────────────────────────────────┐
│ 1. Clone repo from GitHub       │
│ 2. Read config (render.yaml or  │
│    package.json vercel settings)│
│ 3. Install dependencies         │
│    npm install                  │
│ 4. Build                        │
│    npm run build (frontend only)│
│ 5. Start server                 │
│    node src/index.js (backend)  │
└─────────────────────────────────┘
         │                │
         ▼                ▼
   Server Running    App Deployed
   Port auto-assign  CDN Global
   (e.g., 54321)     Edge Locations
         │                │
         └────────┬───────┘
                  ▼
    ┌─────────────────────────────┐
    │ Both services ready         │
    │ Communication via HTTPS     │
    │ CORS enabled                │
    │ Database connected          │
    └─────────────────────────────┘
```

---

## 6. CORS SECURITY FLOW

```
USER REQUEST from https://bajaj-challenge-plum.vercel.app

                    ↓

Browser adds header:
  Origin: https://bajaj-challenge-plum.vercel.app

                    ↓

Express CORS middleware checks:

  ┌─────────────────────────────────────┐
  │ allowedOrigins = [                  │
  │   'http://localhost:3000',          │
  │   'http://localhost:5173',          │
  │   'http://localhost:5174',          │
  │   'http://localhost:5175',          │
  │   'https://bajaj-challenge-plum     │
  │    .vercel.app'                     │
  │ ]                                   │
  └─────────────────────────────────────┘
         ↓
    Is origin in list?
    ├─YES→ Allow request
    │      Response headers:
    │      Access-Control-Allow-Origin:
    │        https://bajaj-challenge-...
    │      Access-Control-Allow-Methods:
    │        GET, POST, OPTIONS
    │
    └─NO→  Reject with error
           "Not allowed by CORS"
```

---

## 7. ERROR HANDLING FLOW

```
USER SUBMITS FORM

            ↓

REQUEST REACHES BACKEND

            ↓

VALIDATION CHAIN:

1. Is body.data present?
   └─NO→ Return 400: "data array is required"

2. Is data an array?
   └─NO→ Return 400: "data array is required"

3. Try processData(data)
   │
   ├─SUCCESS→ Format response
   │          Save to MongoDB
   │          Return 200 + JSON
   │
   └─ERROR→ next(err)
            ↓
           globalErrorHandler
            ↓
           Log error
            ↓
           Return 500: err.message

            ↓

FRONTEND CATCHES:

try {
  const response = await fetch(...)
  // Handle response
} catch (error) {
  // Network error or abort
  setState({ error: error.message })
  // Display error message to user
}
```

---

## 8. DATABASE INTEGRATION

```
ANALYSIS RESULT READY

        ↓

new Analysis({
  user_id: "PreethiSampathDoddi_08052006",
  email_id: "prethisampath_doddi@srmap.edu.in",
  roll_number: "AP23110010958",
  input_edges: ["A->B", ...],
  hierarchies: [...],
  invalid_entries: [...],
  duplicate_edges: [...],
  summary: {...},
  processing_time_ms: 42,
  ip_address: "203.0.113.42"
})

        ↓

.save() (non-blocking)

        ↓

┌─────────────────────────────────────┐
│ MongoDB Atlas                       │
│ ├─ Cluster0                         │
│ │  └─ Database: bajaj              │
│ │     └─ Collection: analyses      │
│ │        └─ Document (inserted)    │
│ └─ Indexes:                         │
│    ├─ user_id + createdAt         │
│    ├─ email_id                     │
│    ├─ roll_number                  │
│    └─ createdAt (TTL: 30 days)     │
└─────────────────────────────────────┘

        ↓

(API response already sent to user,
 DB save is non-blocking)

Console logs:
✓ Analysis saved to MongoDB
```

---

## 9. STATE MANAGEMENT (React)

```
INITIAL STATE:
{
  data: null,
  loading: false,
  error: null
}

        ↓

USER CLICKS SUBMIT

        ↓

setState({ loading: true })
Display: Spinner + "Analysing graph..."

        ↓

FETCH IN PROGRESS
...waiting for network...

        ↓

SUCCESS (200 response)

        ↓

setState({
  data: responseJSON,
  loading: false,
  error: null
})

        ↓

COMPONENT RENDERS:
{data && (
  <div>
    <SummaryCard data={data.summary} />
    <TreeCard hierarchies={data.hierarchies} />
    <BadgeList invalid={data.invalid_entries}
               duplicates={data.duplicate_edges} />
  </div>
)}

        ↓

ERROR (network or 4xx/5xx response)

        ↓

setState({
  data: null,
  loading: false,
  error: "Connection failed" or "Server error"
})

        ↓

COMPONENT RENDERS:
{error && (
  <div className="error-message">
    {error}
  </div>
)}
```

---

This visual guide maps exactly how your BFHL Tree Analyzer processes data end-to-end!
