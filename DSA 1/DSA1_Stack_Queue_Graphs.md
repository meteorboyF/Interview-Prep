  
**DSA 1**

**Stack, Queue & Graph Algorithms**

*UTA Interview Preparation Notes*

Covers Weeks 7-9: Stack, Queue, Graph Representation, BFS, DFS, Topological Ordering

# **Part 1: Stack**

A stack is a linear data structure that follows LIFO: Last In, First Out. The only element you can access, add, or remove is the one at the "top".

## **1.1 How to teach it**

Use the analogy of a stack of plates or trays in a cafeteria: you can only take the plate on top, and you can only place a new plate on top. To reach a plate in the middle, you would have to remove every plate above it first.

* Core operations: push (add to top), pop (remove from top), peek/top (look at top without removing), isEmpty.

* Everything happens at one end only, this single restriction is what defines a stack.

## **1.2 Array-based implementation**

**C++**

| class Stack {     int arr\[100\];     int topIdx; public:     Stack() : topIdx(-1) {}       void push(int val) {         if (topIdx \== 99\) { cout \<\< "Stack overflow\\n"; return; }         arr\[++topIdx\] \= val;     }     int pop() {         if (isEmpty()) { cout \<\< "Stack underflow\\n"; return \-1; }         return arr\[topIdx--\];     }     int peek() { return isEmpty() ? \-1 : arr\[topIdx\]; }     bool isEmpty() { return topIdx \== \-1; } }; |
| :---- |

**C**

| \#define MAX 100 int arr\[MAX\], topIdx \= \-1;   void push(int val) {     if (topIdx \== MAX \- 1\) { printf("Stack overflow\\n"); return; }     arr\[++topIdx\] \= val; } int pop() {     if (topIdx \== \-1) { printf("Stack underflow\\n"); return \-1; }     return arr\[topIdx--\]; } |
| :---- |

## **1.3 Linked-list-based implementation (C++)**

Advantage over the array version: no fixed size limit, and push/pop stay O(1) without ever needing to resize.

| struct Node {     int data;     Node\* next;     Node(int val) : data(val), next(nullptr) {} };   class Stack {     Node\* topNode \= nullptr; public:     void push(int val) {         Node\* newNode \= new Node(val);         newNode-\>next \= topNode;         topNode \= newNode;     }     int pop() {         if (topNode \== nullptr) return \-1;         int val \= topNode-\>data;         Node\* temp \= topNode;         topNode \= topNode-\>next;         delete temp;         return val;     }     bool isEmpty() { return topNode \== nullptr; } }; |
| :---- |

## **1.4 Using the C++ STL stack**

| \#include \<stack\> stack\<int\> s; s.push(10); s.push(20); cout \<\< s.top();  // 20 s.pop(); cout \<\< s.empty(); // false, one element remains |
| :---- |

## **1.5 Applications (strong talking points)**

* Balanced parentheses / bracket matching: push opening brackets, pop and compare on closing brackets.

* Expression evaluation and conversion: infix to postfix, postfix evaluation.

* Function call stack: every function call is pushed, every return is popped, this is literally how recursion works under the hood.

* Undo functionality in editors.

* Depth-First Search (DFS) can be implemented using an explicit stack instead of recursion.

## **1.6 Worked example: balanced parentheses**

| bool isBalanced(string s) {     stack\<char\> st;     for (char c : s) {         if (c \== '(' || c \== '{' || c \== '\[') {             st.push(c);         } else {             if (st.empty()) return false;             char top \= st.top(); st.pop();             if (c \== ')' && top \!= '(') return false;             if (c \== '}' && top \!= '{') return false;             if (c \== '\]' && top \!= '\[') return false;         }     }     return st.empty(); } |
| :---- |

## **1.7 Complexity and Interview Q\&A**

| Operation | Time | Space |
| :---- | :---- | :---- |
| Push | O(1) | O(1) extra |
| Pop | O(1) | O(1) extra |
| Peek/Top | O(1) | O(1) extra |
| Search for a value | O(n) | \- |

**Q: What is stack overflow, and what causes it in practice?**

**A:** It occurs when you try to push onto a stack that has reached its capacity. In the context of recursion, it happens when too many nested function calls exceed the call stack's allocated memory, commonly from infinite or excessively deep recursion.

**Q: How would you implement a queue using two stacks?**

**A:** Keep an "in" stack and an "out" stack. Push new elements onto the in stack. To dequeue, if the out stack is empty, pop everything from the in stack and push it onto the out stack (this reverses the order), then pop from the out stack. This gives amortised O(1) per operation.

**Q: Why is a stack the natural choice for checking balanced parentheses?**

**A:** Because the most recently opened bracket must be the first one closed, that is exactly the LIFO property, the top of the stack always holds the most recent unmatched opening bracket.

## **1.8 Tips and tricks**

* Always check isEmpty() before pop() or peek(), popping an empty stack is a very common source of runtime errors in interviews.

* Mention that recursion is implicitly a stack, this connects the topic to function calls and is a favourite follow-up question.

* If asked to implement a stack, offer both the array-based and linked-list-based versions and state the trade-off (fixed capacity vs dynamic size).

# **Part 2: Queue**

A queue is a linear data structure that follows FIFO: First In, First Out. Elements are added at the rear and removed from the front.

## **2.1 How to teach it**

Use the analogy of a queue at a ticket counter: the person who joins first is served first, new people join at the back of the line, nobody can skip ahead.

* Core operations: enqueue (add to rear), dequeue (remove from front), front/peek, isEmpty.

## **2.2 Array-based implementation: the naive version and why it fails**

A naive array queue that always dequeues from index 0 and shifts everything left is O(n) per dequeue. The standard fix is a circular queue, which reuses freed space at the front instead of shifting.

**C++ circular queue**

| class CircularQueue {     int arr\[100\];     int frontIdx \= \-1, rearIdx \= \-1;     int capacity \= 100; public:     bool isEmpty() { return frontIdx \== \-1; }     bool isFull() { return (rearIdx \+ 1\) % capacity \== frontIdx; }       void enqueue(int val) {         if (isFull()) { cout \<\< "Queue full\\n"; return; }         if (isEmpty()) frontIdx \= 0;         rearIdx \= (rearIdx \+ 1\) % capacity;         arr\[rearIdx\] \= val;     }     int dequeue() {         if (isEmpty()) { cout \<\< "Queue empty\\n"; return \-1; }         int val \= arr\[frontIdx\];         if (frontIdx \== rearIdx) frontIdx \= rearIdx \= \-1;  // last element         else frontIdx \= (frontIdx \+ 1\) % capacity;         return val;     } }; |
| :---- |

## **2.3 Linked-list-based implementation (C++)**

| struct Node {     int data;     Node\* next;     Node(int val) : data(val), next(nullptr) {} };   class Queue {     Node\* frontNode \= nullptr;     Node\* rearNode \= nullptr; public:     void enqueue(int val) {         Node\* newNode \= new Node(val);         if (rearNode \== nullptr) { frontNode \= rearNode \= newNode; return; }         rearNode-\>next \= newNode;         rearNode \= newNode;     }     int dequeue() {         if (frontNode \== nullptr) return \-1;         int val \= frontNode-\>data;         Node\* temp \= frontNode;         frontNode \= frontNode-\>next;         if (frontNode \== nullptr) rearNode \= nullptr;         delete temp;         return val;     }     bool isEmpty() { return frontNode \== nullptr; } }; |
| :---- |

## **2.4 Using the C++ STL queue**

| \#include \<queue\> queue\<int\> q; q.push(10);   // enqueue q.push(20); cout \<\< q.front();  // 10 q.pop();      // dequeue |
| :---- |

## **2.5 Variants worth knowing**

* Circular queue: reuses freed slots at the front, avoids the O(n) shifting problem of a naive array queue.

* Deque (double-ended queue): insertion and deletion allowed at both ends, C++ STL provides deque\<T\>.

* Priority queue: elements are served by priority, not arrival order, typically implemented with a heap, C++ STL provides priority\_queue\<T\>.

## **2.6 Applications**

* Breadth-First Search (BFS) on graphs and trees, covered in detail in Part 4\.

* CPU task scheduling (round-robin scheduling).

* Print job spooling, request handling in web servers, any "first come first served" system.

## **2.7 Complexity and Interview Q\&A**

| Operation | Naive array (shift) | Circular array | Linked list |
| :---- | :---- | :---- | :---- |
| Enqueue | O(1) | O(1) | O(1) |
| Dequeue | O(n) | O(1) | O(1) |

**Q: Why is a circular queue preferred over a simple array-based queue?**

**A:** A simple array queue that dequeues from index 0 requires shifting all remaining elements left, costing O(n) per dequeue. A circular queue instead wraps the front and rear indices around using modulo arithmetic, reusing freed space and achieving O(1) enqueue and dequeue.

**Q: How would you implement a stack using two queues?**

**A:** One approach: to push, enqueue the new element into queue1, then dequeue everything that was already in queue1 in front of it and re-enqueue those elements after it, effectively rotating the new element to the front. This makes push O(n) but pop O(1).

**Q: What is the difference between a queue and a deque?**

**A:** A queue only allows insertion at the rear and removal at the front, strict FIFO. A deque (double-ended queue) allows insertion and removal at both ends, so it can behave as a stack, a queue, or both at once.

## **2.8 Tips and tricks**

* If asked to implement a queue with an array, immediately mention the circular queue approach, a naive shifting implementation is a red flag in an interview.

* Know the isFull() check for a circular queue by heart: (rear \+ 1\) % capacity \== front, it is a classic off-by-one trap.

* Connect queues to BFS unprompted, it shows you understand why the data structure exists, not just how to code it.

# **Part 3: Graph Representation**

A graph is a set of vertices (nodes) connected by edges. Edges can be directed (one-way) or undirected (two-way), and weighted (carry a cost) or unweighted.

## **3.1 How to teach it**

Draw a small graph on the board first, for example a social network: people are vertices, friendships are edges. Ask "how would you store this in a program?" before introducing either representation, it motivates the choice.

## **3.2 Adjacency Matrix**

A V x V grid where cell \[i\]\[j\] is 1 (or the weight) if an edge exists from vertex i to vertex j, and 0 otherwise.

| int V \= 5; vector\<vector\<int\>\> adjMatrix(V, vector\<int\>(V, 0));   void addEdge(int u, int v) {     adjMatrix\[u\]\[v\] \= 1;     adjMatrix\[v\]\[u\] \= 1;  // omit this line for a directed graph } |
| :---- |

## **3.3 Adjacency List**

An array of lists, where adjList\[i\] holds all vertices directly connected to vertex i. This is the representation used in almost all interview coding, since it is far more memory-efficient for sparse graphs.

| int V \= 5; vector\<vector\<int\>\> adjList(V);   void addEdge(int u, int v) {     adjList\[u\].push\_back(v);     adjList\[v\].push\_back(u);  // omit this line for a directed graph } |
| :---- |

*For a weighted graph, store pairs: vector\<vector\<pair\<int,int\>\>\> adjList(V); where each pair is {neighbour, weight}.*

## **3.4 Comparison**

| Aspect | Adjacency Matrix | Adjacency List |
| :---- | :---- | :---- |
| Space | O(V^2) | O(V \+ E) |
| Check if edge (u,v) exists | O(1) | O(degree of u) |
| Iterate all neighbours of a vertex | O(V) | O(degree of u) |
| Best for | Dense graphs, frequent edge lookups | Sparse graphs, most real-world and interview cases |

**Q: When would you choose an adjacency matrix over an adjacency list?**

**A:** When the graph is dense (edges close to V^2) or when you need O(1) edge-existence checks very frequently. For most interview problems and sparse real-world graphs, an adjacency list is preferred for its better space efficiency.

# **Part 4: Breadth-First Search (BFS)**

## **4.1 How to teach it**

Use the analogy of ripples spreading outward in water, or infection spreading level by level: BFS visits all neighbours of the current vertex first (distance 1), then all their unvisited neighbours (distance 2), and so on. It explores the graph level by level, which is exactly why it is used to find the shortest path in an unweighted graph.

* Use a queue to keep track of which vertex to visit next.

* Use a visited array/set to avoid processing the same vertex twice (and to avoid infinite loops in graphs with cycles).

* Start by enqueuing the source vertex and marking it visited.

* While the queue is not empty: dequeue a vertex, process it, then enqueue all of its unvisited neighbours and mark them visited immediately (at enqueue time, not at dequeue time, this avoids duplicate enqueues).

## **4.2 C++ code**

| void bfs(int src, vector\<vector\<int\>\>& adjList, int V) {     vector\<bool\> visited(V, false);     queue\<int\> q;     visited\[src\] \= true;     q.push(src);       while (\!q.empty()) {         int curr \= q.front(); q.pop();         cout \<\< curr \<\< " ";           for (int neighbour : adjList\[curr\]) {             if (\!visited\[neighbour\]) {                 visited\[neighbour\] \= true;                 q.push(neighbour);             }         }     } } |
| :---- |

## **4.3 BFS for shortest path in an unweighted graph**

| vector\<int\> bfsShortestPath(int src, vector\<vector\<int\>\>& adjList, int V) {     vector\<int\> dist(V, \-1);     queue\<int\> q;     dist\[src\] \= 0;     q.push(src);       while (\!q.empty()) {         int curr \= q.front(); q.pop();         for (int neighbour : adjList\[curr\]) {             if (dist\[neighbour\] \== \-1) {                 dist\[neighbour\] \= dist\[curr\] \+ 1;                 q.push(neighbour);             }         }     }     return dist;  // dist\[i\] \= shortest number of edges from src to i } |
| :---- |

## **4.4 Complexity and Interview Q\&A**

| Property | Value |
| :---- | :---- |
| Time complexity | O(V \+ E), every vertex and every edge is processed once |
| Space complexity | O(V), for the visited array and the queue |
| Guarantees shortest path? | Yes, but only for unweighted graphs |

**Q: Why does BFS give the shortest path in an unweighted graph?**

**A:** Because BFS explores vertices in strictly increasing order of distance from the source, level by level, so the first time a vertex is reached, it is guaranteed to be via the shortest possible number of edges.

**Q: Why mark a vertex visited when it is enqueued, rather than when it is dequeued?**

**A:** If you wait until dequeue time, the same vertex could be enqueued multiple times by different neighbours before any of them are processed, wasting time and space, and in the shortest-path version it could even produce an incorrect distance. Marking at enqueue time guarantees each vertex enters the queue exactly once.

**Q: What is the time complexity of BFS on an adjacency matrix versus an adjacency list?**

**A:** On an adjacency list it is O(V \+ E), since each vertex's neighbour list is scanned exactly once in total. On an adjacency matrix it becomes O(V^2), since finding the neighbours of each vertex requires scanning an entire row of size V.

## **4.5 Tips and tricks**

* Always state "BFS uses a queue" and "DFS uses a stack (or recursion)" as your opening line, it is the single fastest way to show you understand the core distinction.

* Mention the visited-at-enqueue-time detail proactively, it is a very common subtle bug interviewers probe for.

* If asked for shortest path, immediately clarify "unweighted graph, right?", since BFS does not work for weighted shortest path (that needs Dijkstra's algorithm).

# **Part 5: Depth-First Search (DFS)**

## **5.1 How to teach it**

Use the analogy of exploring a maze with one hand always on the wall: go as deep as possible down one path, and only backtrack when you hit a dead end (a vertex with no unvisited neighbours), then continue exploring from the most recent branching point.

* Use recursion (the call stack acts as the stack) or an explicit stack.

* Use a visited array to avoid revisiting vertices and to avoid infinite recursion in cyclic graphs.

* Visit the current vertex, mark it visited, then recursively visit each unvisited neighbour before moving on.

## **5.2 C++ code: recursive**

| void dfs(int curr, vector\<vector\<int\>\>& adjList, vector\<bool\>& visited) {     visited\[curr\] \= true;     cout \<\< curr \<\< " ";       for (int neighbour : adjList\[curr\]) {         if (\!visited\[neighbour\]) {             dfs(neighbour, adjList, visited);         }     } }   // call: vector\<bool\> visited(V, false); dfs(src, adjList, visited); |
| :---- |

## **5.3 C++ code: iterative (explicit stack)**

| void dfsIterative(int src, vector\<vector\<int\>\>& adjList, int V) {     vector\<bool\> visited(V, false);     stack\<int\> st;     st.push(src);       while (\!st.empty()) {         int curr \= st.top(); st.pop();         if (visited\[curr\]) continue;         visited\[curr\] \= true;         cout \<\< curr \<\< " ";           for (int neighbour : adjList\[curr\]) {             if (\!visited\[neighbour\]) st.push(neighbour);         }     } } |
| :---- |

## **5.4 Applications**

* Detecting cycles in a graph.

* Finding connected components.

* Topological sorting (covered next in Part 6).

* Solving maze/puzzle problems and backtracking algorithms.

## **5.5 Complexity and Interview Q\&A**

| Property | Value |
| :---- | :---- |
| Time complexity | O(V \+ E) |
| Space complexity | O(V), visited array plus O(V) recursion/stack depth in the worst case |

**Q: What is the key difference between BFS and DFS in terms of the order of exploration?**

**A:** BFS explores level by level, visiting all vertices at the current distance before moving further out, using a queue. DFS explores as deep as possible along one path before backtracking, using a stack or recursion.

**Q: In the iterative DFS using an explicit stack, why do you check "if (visited\[curr\]) continue" after popping, instead of only checking before pushing?**

**A:** Because a vertex can be pushed onto the stack multiple times before it is actually processed, since the push step does not always mark it visited immediately (unlike BFS). The check after popping guards against processing the same vertex twice.

**Q: How would you detect a cycle in an undirected graph using DFS?**

**A:** During DFS, if you reach an already-visited vertex that is not the immediate parent of the current vertex, a cycle exists. You need to pass the parent vertex along with each recursive call to make this check.

## **5.6 Tips and tricks**

* Recursive DFS is usually preferred in interviews for clarity, mention the iterative version only if asked or if you want to show extra depth.

* Watch out for stack overflow with recursive DFS on very large/deep graphs, this is a good point to bring up proactively.

* For directed graphs, cycle detection is different from undirected graphs, it requires tracking the current recursion path (a "grey" state), not just visited/unvisited.

# **Part 6: Topological Ordering**

A topological order is a linear ordering of the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u \-\> v, vertex u appears before vertex v in the ordering. It only exists for graphs with no cycles.

## **6.1 How to teach it**

Use the analogy of course prerequisites: if course A is a prerequisite for course B, A must appear before B in your study plan. A topological sort produces one valid overall order that respects every such prerequisite relationship simultaneously.

* Only defined for DAGs, a cyclic graph has no valid topological order (imagine two courses that are each other's prerequisite, impossible to schedule).

* There can be more than one valid topological order for the same graph.

## **6.2 Method 1: DFS-based (finish-time stack)**

How to teach it: run DFS, and every time you finish exploring a vertex completely (all its neighbours are done), push it onto a stack. Once all vertices are processed, popping the stack from top to bottom gives a valid topological order, because a vertex is only marked "finished" after everything it depends on has already finished.

| void topoDFS(int curr, vector\<vector\<int\>\>& adjList, vector\<bool\>& visited, stack\<int\>& finishOrder) {     visited\[curr\] \= true;     for (int neighbour : adjList\[curr\]) {         if (\!visited\[neighbour\]) {             topoDFS(neighbour, adjList, visited, finishOrder);         }     }     finishOrder.push(curr);  // mark curr as finished }   vector\<int\> topologicalSortDFS(vector\<vector\<int\>\>& adjList, int V) {     vector\<bool\> visited(V, false);     stack\<int\> finishOrder;     for (int i \= 0; i \< V; i++) {         if (\!visited\[i\]) topoDFS(i, adjList, visited, finishOrder);     }     vector\<int\> result;     while (\!finishOrder.empty()) {         result.push\_back(finishOrder.top());         finishOrder.pop();     }     return result; } |
| :---- |

## **6.3 Method 2: Kahn's Algorithm (BFS-based, using in-degree)**

How to teach it: repeatedly pick vertices that currently have zero incoming edges (no unmet prerequisites), output them, then remove their outgoing edges, which may free up new zero-in-degree vertices. This is naturally implemented with a queue, exactly like BFS.

| vector\<int\> topologicalSortKahn(vector\<vector\<int\>\>& adjList, int V) {     vector\<int\> inDegree(V, 0);     for (int u \= 0; u \< V; u++)         for (int v : adjList\[u\]) inDegree\[v\]++;       queue\<int\> q;     for (int i \= 0; i \< V; i++)         if (inDegree\[i\] \== 0\) q.push(i);       vector\<int\> result;     while (\!q.empty()) {         int curr \= q.front(); q.pop();         result.push\_back(curr);           for (int neighbour : adjList\[curr\]) {             if (--inDegree\[neighbour\] \== 0\) q.push(neighbour);         }     }       if ((int)result.size() \!= V) {         cout \<\< "Graph has a cycle, no valid topological order\\n";     }     return result; } |
| :---- |

*Bonus: Kahn's algorithm doubles as a cycle detector for free, if result.size() \!= V at the end, some vertices never reached in-degree zero, which means a cycle exists.*

## **6.4 Applications**

* Course scheduling with prerequisites.

* Build systems: compiling files in an order that respects dependencies.

* Task scheduling where some tasks must finish before others start.

* Package/module dependency resolution.

## **6.5 Complexity and Interview Q\&A**

| Property | Value |
| :---- | :---- |
| Time complexity (both methods) | O(V \+ E) |
| Space complexity | O(V), for the stack/queue and auxiliary arrays |
| Precondition | Graph must be a DAG (directed, acyclic) |

**Q: Why must the graph be acyclic for a topological order to exist?**

**A:** If there is a cycle, then within that cycle every vertex depends on another vertex that ultimately depends back on it, so no vertex in the cycle can be placed before all the others, there is no valid starting point.

**Q: What is the difference between the DFS-based method and Kahn's algorithm?**

**A:** The DFS-based method builds the order using finish times and a stack, giving the result in reverse post-order. Kahn's algorithm is iterative, using in-degree counts and a queue, repeatedly removing vertices with no remaining incoming edges. Both run in O(V \+ E), and Kahn's algorithm has the added benefit of directly detecting cycles.

**Q: Is the topological order always unique?**

**A:** No. If at any point there is more than one vertex with in-degree zero (in Kahn's algorithm) or more than one valid DFS starting point, multiple different valid topological orders can exist for the same graph.

## **6.6 Tips and tricks**

* If asked for topological sort, state the precondition first: "this only works on a DAG", exactly as you would state "array must be sorted" for binary search.

* Kahn's algorithm is often preferred in interviews because it naturally reports whether a cycle exists, mention this as a bonus.

* Practice tracing both methods by hand on a small 5-6 vertex DAG (for example, a course prerequisite chart) before the interview.

# **Part 7: General Notes**

## **BFS vs DFS, at a glance**

| Feature | BFS | DFS |
| :---- | :---- | :---- |
| Data structure used | Queue | Stack (or recursion) |
| Exploration order | Level by level (breadth first) | As deep as possible, then backtrack |
| Shortest path (unweighted) | Yes | No |
| Space (worst case) | O(V), can be wide | O(V), recursion depth can be deep |
| Common uses | Shortest path, level-order traversal | Cycle detection, topological sort, connected components |

## **Structuring your answer when asked to "explain" a graph algorithm**

* 1\. Draw a small graph (5-6 vertices) on the board.

* 2\. State the analogy in one sentence (ripples for BFS, maze exploration for DFS, prerequisites for topological sort).

* 3\. State the data structure it relies on and why.

* 4\. Trace it live on your drawing, narrating the visited set/queue/stack contents at each step.

* 5\. State time/space complexity and one real application.

## **Frequently repeated cross-cutting questions**

**Q: Why is the time complexity of both BFS and DFS O(V \+ E) rather than just O(V) or just O(E)?**

**A:** Every vertex is visited once, contributing the O(V) term, and for each vertex, its full adjacency list is scanned once, and summed across all vertices this totals O(E), since each edge appears in at most two adjacency lists (or one, for a directed graph).

**Q: As a UTA, how would you help a student who confuses BFS and DFS?**

**A:** Have them physically trace both on the same small graph side by side, using a real queue (write numbers left to right, remove from the left) for BFS and a real stack (write numbers top to bottom, remove from the top) for DFS, so the difference in exploration order becomes visually obvious rather than something to memorise abstractly.

## **Final checklist before the interview**

* Can you code a stack and a queue from scratch, both array-based and linked-list-based, without looking anything up?

* Can you build an adjacency list from a list of edges and explain why it beats an adjacency matrix for sparse graphs?

* Can you code BFS and DFS from memory in under 3 minutes each, and explain the visited-array subtlety in BFS?

* Can you code at least one topological sort method (Kahn's is usually easiest to explain live) and state its precondition?

* Can you explain each topic starting from an analogy and a drawing, the way you would teach a first-year student, not straight from code?