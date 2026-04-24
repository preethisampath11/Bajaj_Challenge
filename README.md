# SRM Challenge - BFHL Tree Analyser

Full-stack monorepo for hierarchical data processing with Express backend and React+Vite frontend.

## Project Structure

```
srm-challenge/
├── server/
│   ├── src/
│   │   ├── index.js          ← Express server entrypoint
│   │   └── processor.js       ← Tree hierarchy logic
│   ├── .env                   ← Server configuration
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/        ← React components
│   │   ├── hooks/             ← Custom hooks
│   │   ├── main.jsx           ← React 18 entry
│   │   ├── App.jsx            ← Root component
│   │   └── index.css          ← Global styles
│   ├── index.html             ← Vite entry
│   ├── vite.config.js         ← Vite configuration
│   ├── .env                   ← Client configuration
│   └── package.json
├── .gitignore
└── README.md
```

## Running Locally

**Prerequisites:** Node.js 16+, npm or yarn

**Server:**
```bash
cd server
npm install
npm start
```
Starts on `http://localhost:3001`

**Client:**
```bash
cd client
npm install
npm run dev
```
Starts on `http://localhost:5173`

## API Usage

### POST /bfhl

Accepts JSON payloads with hierarchical string relationships and returns structured analysis.

**Example cURL Request:**
```bash
curl -X POST http://localhost:3001/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "B->C", "D->E"]}'
```

**Request Body:**
```json
{
  "data": ["A->B", "B->C", "D->E"]
}
```

**Response:**
```json
{
  "success": true,
  "hierarchy": {
    "A": ["B"],
    "B": ["C"],
    "D": ["E"]
  },
  "roots": ["A", "D"],
  "leaves": ["C", "E"],
  "depth": 2
}
```

**Response Fields:**
- `hierarchy`: Adjacency list mapping source to target nodes
- `roots`: Nodes with no incoming edges
- `leaves`: Nodes with no outgoing edges
- `depth`: Maximum path length in the graph

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid format"
}
```

Strings must follow `source->target` format. Cyclic relationships are detected and reported.

## Environment Variables

### Server (.env)
```
USER_ID=yourname_ddmmyyyy
EMAIL_ID=your@srmist.edu.in
ROLL_NUMBER=RA22110XXXXXXX
PORT=3001
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001
```
