# PathX 🧭

An interactive, responsive path-finding visualizer built with **React** showcasing popular graph traversal and search algorithms on a 20×40 grid.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)

---

## 🚀 Features

- **20×40 Interactive Grid**: Total of 800 cells ($\text{id} = \text{row} \times 40 + \text{col}$).
- **Drag-and-Drop Controls**:
  - Reposition **Start** (Green ▶) and **Target** (Red 🎯) points by dragging.
  - Draw and erase walls seamlessly with click-and-drag.
- **Pure Function Algorithms**:
  - All algorithms are pure functions taking `(start, end, walls)` and returning `{ visited, path }` without touching the DOM.
  - Returns an empty path `[]` if the destination is unreachable.
- **Algorithms Included**:
  - **Breadth-First Search (BFS)**: Explores level-by-level using a FIFO queue; guarantees the shortest path on unweighted graphs.
  - **Depth-First Search (DFS)**: Explores deep paths using a LIFO stack; does not guarantee the shortest path.
  - **Dijkstra's Algorithm**: Uses an array-backed binary `MinHeap` priority queue with uniform edge relaxation; guarantees optimal shortest path.
  - **A\* Search**: Uses `MinHeap` and the admissible Manhattan distance heuristic ($f(n) = g(n) + h(n)$); efficiently guides exploration toward the target.
- **Real-Time Step Animation**:
  - Visualizes node exploration in animated blue, followed by the shortest path highlighted in glowing yellow.
  - Uses `setInterval` with an adjustable **Step Delay Slider** (5ms to 60ms).
- **Comprehensive Statistics**:
  - Real-time readout of cells explored, path length (steps), algorithm runtime in milliseconds, or "No path found".
- **Dark Mode Support**:
  - Built-in theme switcher with smooth CSS transitions and high-contrast color schemes.
- **Random Maze Generation**:
  - One-click randomized wall generator (~28% density) keeping endpoints clear.

---

## 📁 Project Structure

```
PathX/
├── .gitignore
├── README.md
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── algorithms/
    │   │   ├── heap.js       # Array-based binary MinHeap class
    │   │   ├── utils.js      # getNeighbors, manhattan distance, buildPath
    │   │   ├── bfs.js        # Pure BFS implementation
    │   │   ├── dfs.js        # Pure DFS implementation
    │   │   ├── dijkstra.js   # Pure Dijkstra implementation
    │   │   └── astar.js      # Pure A* implementation
    │   ├── components/
    │   │   ├── Cell.js       # Memoized grid cell component
    │   │   ├── Grid.js       # 20x40 interactive grid container
    │   │   ├── Controls.js   # Toolbar, algorithm select, buttons, slider
    │   │   └── Stats.js      # Metrics line & color legend
    │   ├── App.js            # Main application state & animation loop
    │   ├── App.css           # Styling, keyframe animations, dark theme
    │   └── index.js          # React DOM entry point
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RohaanAhmadQuadri/PathX.git
   cd PathX
   ```

2. **Navigate into the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📖 Algorithm Comparison

| Algorithm | Data Structure | Guarantees Shortest Path? | Time Complexity | Best Use Case |
|-----------|----------------|----------------------------|-----------------|---------------|
| **BFS** | Queue (FIFO) | ✅ Yes | $O(V + E)$ | Unweighted graphs, shallow goals |
| **DFS** | Stack (LIFO) | ❌ No | $O(V + E)$ | Maze exploration, cycle detection |
| **Dijkstra** | Min-Heap (Priority Queue) | ✅ Yes | $O((V + E) \log V)$ | Weighted & unweighted graphs |
| **A\*** | Min-Heap + Manhattan Heuristic | ✅ Yes (admissible $h$) | $O(E \log V)$ | Directed pathfinding toward target |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
