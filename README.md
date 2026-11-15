# PathX 🧭

An interactive, responsive path-finding visualizer built with **React** showcasing popular graph traversal and search algorithms on a 20×40 grid, complete with weighted terrain, side-by-side algorithm comparison, step-by-step playback controls, and a **Node.js/Express + MongoDB** backend to save and share custom mazes.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)

---

## 🚀 Key Features

### 1. Weighted Cells ("Mud")
- **Custom Cell Weights**: Right-click (or hold <kbd>W</kbd> and click) any cell to toggle **Mud** (cost 5). Standard cells cost 1.
- **Visual Distinction**: Mud cells are rendered in rich brown with a distinct badge and legend entry.
- **Weighted Graph Search**: **Dijkstra** and **A\*** dynamically calculate cumulative edge weights and steer around mud when a lower-cost path exists.
- **Unweighted Clarification**: A helpful note clarifies that **BFS** and **DFS** are unweighted algorithms that treat all traversals as uniform cost.

### 2. Compare Mode (Side-by-Side)
- **Dual Algorithm Benchmarking**: Toggle **Compare Mode** to pit any two algorithms against each other (e.g. Dijkstra vs A*).
- **Synchronized Obstacles**: Both grids share the exact same Start, Target, Walls, and Mud cells.
- **Comparative Metrics Table**: Evaluates:
  - Cells explored (efficiency)
  - Path length (steps taken)
  - Total path cost (accounting for weights)
  - Algorithm runtime (ms)
  - Winner and performance insights

### 3. Step-by-Step Playback Controls
- **Interactive VCR Controls**:
  - **Play / Pause**: Start and halt animation at any frame.
  - **Next Step (⏭)**: Step forward node-by-node.
  - **Previous Step (⏮)**: Step backward to examine previous state expansions.
- **Scrubbable Progress Bar**: Jump directly to any point in the search sequence using the slider.
- **Speed Slider**: Real-time delay adjustment (5ms to 60ms).

### 4. Backend Service (Save & Share Grids)
- **RESTful API**: Built with Node.js, Express, and Mongoose.
  - `POST /api/grids`: Saves walls, mud cells, start, end, and maze name; returns a 6-character short ID (e.g. `a15784`).
  - `GET /api/grids/:id`: Retrieves a saved grid layout.
  - `GET /api/grids`: Lists the latest 20 saved community grids.
- **One-Click Sharing**: Generates shareable URLs like `http://localhost:3000/?grid=a15784`.
- **Auto-Loading**: Opening a shared link automatically pulls and loads the maze onto the grid.

---

## 📁 Project Structure

```
PathX/
├── .gitignore
├── README.md
├── backend/
│   ├── .env                  # PORT=5000, MONGO_URI
│   ├── .gitignore
│   ├── package.json
│   ├── server.js             # Express app, Mongoose connection, CORS
│   ├── models/
│   │   └── Grid.js           # Mongoose Grid schema
│   └── routes/
│       └── gridRoutes.js     # API endpoints: POST, GET by id, GET all
└── frontend/
    ├── .env                  # REACT_APP_API_URL=http://localhost:5000
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── algorithms/
        │   ├── heap.js       # Array-based binary MinHeap class
        │   ├── utils.js      # getNeighbors, manhattan, calculatePathCost
        │   ├── bfs.js        # Pure BFS (start, end, walls, weights)
        │   ├── dfs.js        # Pure DFS (start, end, walls, weights)
        │   ├── dijkstra.js   # Pure Dijkstra (start, end, walls, weights)
        │   └── astar.js      # Pure A* (start, end, walls, weights)
        ├── components/
        │   ├── Cell.js       # Memoized grid cell with mud badge
        │   ├── Grid.js       # 20x40 interactive grid container
        │   ├── Controls.js   # Toolbar, Compare toggle, Save/Load buttons
        │   ├── Stats.js      # Real-time metrics & color legend
        │   ├── CompareTable.js # Side-by-side performance table
        │   ├── StepControls.js # Pause, Play, Step Next/Prev, Progress Bar
        │   └── GridModal.js  # Save and Load dialogs with shareable links
        ├── App.js            # Main application state, playback loop, routing
        ├── App.css           # Responsive styling, keyframes, dark mode
        └── index.js          # React DOM entry point
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- Optional: Local [MongoDB](https://www.mongodb.com/) instance or MongoDB Atlas URI (a built-in fallback operates gracefully if MongoDB is offline)

---

### 1. Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd PathX/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (optional, defaults provided):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/pathx
   ```
4. Start the server:
   ```bash
   npm start
   ```
   Server runs on [http://localhost:5000](http://localhost:5000).

---

### 2. Start the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd PathX/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env` points to the backend:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```
4. Start the React development server:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Algorithm Comparison

| Algorithm | Data Structure | Weighted Support | Guarantees Shortest Path? | Time Complexity |
|-----------|----------------|------------------|----------------------------|-----------------|
| **BFS** | Queue (FIFO) | ❌ No (costs = 1) | ✅ Yes (unweighted only) | $O(V + E)$ |
| **DFS** | Stack (LIFO) | ❌ No (costs = 1) | ❌ No | $O(V + E)$ |
| **Dijkstra** | Min-Heap Priority Queue | ✅ Yes (mud = 5) | ✅ Yes (optimal cost) | $O((V + E) \log V)$ |
| **A\*** | Min-Heap + Manhattan Heuristic | ✅ Yes (mud = 5) | ✅ Yes (admissible heuristic) | $O(E \log V)$ |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
