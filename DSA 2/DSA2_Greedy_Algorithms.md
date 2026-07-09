  
**DSA 2**

**Greedy Algorithms**

*UTA Interview Preparation Notes*

Covers Weeks 5-7: Fractional Knapsack, Activity Selection, Prim's, Kruskal's, Dijkstra's, Summary of Greedy Approach

# **Part 0: The Greedy Algorithm Paradigm**

A greedy algorithm builds a solution step by step, at each step making the choice that looks best right now, without reconsidering that choice later. It never backtracks. This works only for problems with a specific structure, described below.

## **How to teach it**

Analogy: giving change with the fewest coins, at each step you grab the largest coin denomination that does not exceed the remaining amount, and you never go back to swap a coin out later. This works for common currency systems, but the key teaching point is that greedy does not always work, it only works when the problem has the right structure.

## **What problem this technique solves**

Greedy algorithms solve optimisation problems (maximise or minimise something) that have two properties:

* Greedy-choice property: a globally optimal solution can be reached by making a locally optimal (greedy) choice at each step, without needing to reconsider previous choices.

* Optimal substructure: an optimal solution to the problem contains optimal solutions to its subproblems (the same property Divide and Conquer relies on, but here combined with the greedy-choice property specifically).

## **When to use it**

* You can prove (or it is a known result) that the greedy-choice property holds, usually via an exchange argument: showing that any optimal solution can be transformed into the greedy solution without making it worse.

* You need a fast, simple algorithm and an exact greedy proof exists for your problem, greedy algorithms are typically much faster than the Dynamic Programming alternative for the same problem class.

## **When you cannot or should not use it**

* The problem does not actually have the greedy-choice property, a locally best choice can lock you out of the true global optimum. The classic example is the 0/1 Knapsack problem (items cannot be split), where greedy by value/weight ratio can give a suboptimal answer, this requires Dynamic Programming instead (covered in Weeks 8-9 of this course).

* You have not proven the greedy property holds, applying greedy "because it seems reasonable" without justification is a common source of wrong answers, always be ready to justify why the greedy choice is safe for your specific problem.

# **Part 1: Fractional Knapsack**

## **1.1 What problem it solves**

Given a set of items, each with a weight and a value, and a knapsack with a maximum weight capacity, choose how much of each item to take (fractions of an item are allowed) to maximise total value without exceeding the capacity.

## **1.2 How to teach it**

Analogy: filling a sack with gold dust, sugar, and flour of different values per kilogram, since these are divisible substances, you can scoop any fraction you like. The obvious strategy is to fill up on the most valuable-per-kilogram substance first, then the next best, and so on, using a fraction of the last one to exactly fill the remaining capacity.

* Compute the value-to-weight ratio for every item.

* Sort items by that ratio in descending order.

* Take as much as possible of the highest-ratio item, then the next, until the capacity is exactly filled (the last item taken may be a fraction).

## **1.3 C++ code**

| struct Item {     int value, weight; };   double fractionalKnapsack(vector\<Item\>& items, int capacity) {     sort(items.begin(), items.end(), \[\](Item& a, Item& b) {         return (double)a.value / a.weight \> (double)b.value / b.weight;     });       double totalValue \= 0.0;     int remaining \= capacity;       for (Item& item : items) {         if (remaining \<= 0\) break;         if (item.weight \<= remaining) {             totalValue \+= item.value;             remaining \-= item.weight;         } else {             totalValue \+= item.value \* ((double)remaining / item.weight);             remaining \= 0;         }     }     return totalValue; } |
| :---- |

## **1.4 Worked example**

*Items (value, weight): (60,10), (100,20), (120,30). Capacity \= 50*

* Ratios: 60/10=6, 100/20=5, 120/30=4. Sorted order: item1 (ratio 6), item2 (ratio 5), item3 (ratio 4).

* Take all of item1: value=60, remaining capacity=40

* Take all of item2: value=60+100=160, remaining capacity=20

* Take 20/30 of item3: value=160 \+ 120\*(20/30)=160+80=240

Maximum value \= 240\.

## **1.5 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(n log n), dominated by sorting items by ratio |
| Space complexity | O(1) extra, or O(n) if sorting is not in place |
| Optimality | Always gives the true optimal solution, greedy-choice property is provable here |

## **1.6 When to use it**

* Items are genuinely divisible: liquids, powders, money, or any resource that can be split into fractions.

* You need a fast, exact optimal solution, greedy here is provably optimal and much faster than a DP-based approach.

## **1.7 When you cannot or should not use it**

* Items must be taken whole or not at all (0/1 Knapsack), for example indivisible physical objects like a specific laptop or a specific painting, greedy by ratio is not guaranteed optimal here, see Part 6 for the concrete counterexample.

## **1.8 Interview Q\&A**

**Q: Why does the greedy value/weight ratio approach give the optimal answer for fractional knapsack, but not for 0/1 knapsack?**

**A:** Because fractions are allowed, you can always fill the capacity exactly using the best available ratios, with no wasted space, an exchange argument shows any solution not following this order can be improved by swapping toward higher-ratio items. In 0/1 knapsack, items are indivisible, so a high-ratio item might not fit the remaining capacity at all, forcing a suboptimal use of leftover space that greedy cannot fix by taking a partial item.

**Q: What is the time complexity bottleneck of fractional knapsack, and can it be improved?**

**A:** The O(n log n) sort dominates. If you only need the single best solution once, this is already optimal, sorting cannot be avoided since the algorithm fundamentally needs items ordered by ratio.

## **1.9 Tips and tricks**

* Always state upfront that this only works because items are divisible, and contrast it with 0/1 knapsack unprompted, it is the most common follow-up question for this topic.

* Double-check your ratio comparison uses double division, not integer division, a classic implementation bug.

# **Part 2: Activity Selection**

## **2.1 What problem it solves**

Given a set of activities, each with a start time and a finish time, and a single resource (for example, one meeting room), select the maximum number of activities that can be performed without any two overlapping.

## **2.2 How to teach it**

Analogy: booking a single conference room for the day, given a long list of meeting requests with start and end times, you want to accept as many non-overlapping meetings as possible. The key greedy insight: always accept the request that finishes earliest among the remaining valid options, finishing early leaves the most room for future activities.

* Sort all activities by finish time, ascending.

* Select the first activity (earliest finish time).

* For each subsequent activity in sorted order, select it only if its start time is greater than or equal to the finish time of the last selected activity.

## **2.3 C++ code**

| struct Activity {     int start, finish; };   int activitySelection(vector\<Activity\>& acts) {     sort(acts.begin(), acts.end(), \[\](Activity& a, Activity& b) {         return a.finish \< b.finish;     });       int count \= 1;     int lastFinish \= acts\[0\].finish;       for (int i \= 1; i \< (int)acts.size(); i++) {         if (acts\[i\].start \>= lastFinish) {             count++;             lastFinish \= acts\[i\].finish;         }     }     return count; } |
| :---- |

## **2.4 Worked example**

*Activities (start, finish): (1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11), (8,12), (2,14), (12,16)*

* Sorted by finish time: (1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11), (8,12), (2,14), (12,16)

* Select (1,4). lastFinish=4.

* (3,5): start 3 \< 4, skip. (0,6): start 0 \< 4, skip.

* (5,7): start 5 \>= 4, select. lastFinish=7.

* (3,9): skip. (5,9): skip. (6,10): skip.

* (8,11): start 8 \>= 7, select. lastFinish=11.

* (8,12): skip. (2,14): skip.

* (12,16): start 12 \>= 11, select. lastFinish=16.

Total selected: 4 activities \-\> (1,4), (5,7), (8,11), (12,16).

## **2.5 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(n log n), dominated by sorting by finish time |
| Space complexity | O(1) extra beyond the sort |
| Optimality | Always gives the true maximum count, provable via exchange argument |

## **2.6 When to use it**

* Single-resource scheduling where the goal is simply to maximise the number of accepted activities, all activities are equally weighted/valuable.

* Interval scheduling problems in general: booking systems, CPU job scheduling with a single processor, classroom allocation for one room.

## **2.7 When you cannot or should not use it**

* Activities have different values/weights and you want to maximise total value rather than total count, sorting by finish time is no longer guaranteed optimal, this becomes the Weighted Activity Selection problem, which requires Dynamic Programming.

* Multiple resources are available (for example k meeting rooms instead of one), this becomes a more general interval partitioning / graph colouring style problem, not solved by this simple greedy rule directly.

## **2.8 Interview Q\&A**

**Q: Why does sorting by finish time (rather than start time or duration) give the optimal answer?**

**A:** Because picking the activity that finishes earliest always leaves the maximum possible remaining time for scheduling further activities. An exchange argument shows that any optimal solution can be modified to start with the earliest-finishing activity without reducing the total count, so it is always safe to choose it first.

**Q: Why doesn't sorting by shortest duration work instead?**

**A:** A short activity might still finish very late (for example, starting near the end of the day), which can block more of the remaining schedule than a longer activity that finishes early. Finish time, not duration, determines how much room is left for future choices.

**Q: How would you modify this problem if each activity had an associated value and you wanted to maximise total value instead of count?**

**A:** The simple greedy approach no longer guarantees optimality, because a high finish-time-priority choice might exclude a much more valuable activity. This becomes the Weighted Activity Selection problem, solved with Dynamic Programming: for each activity, decide to include or exclude it, using binary search to find the last non-overlapping previous activity, similar in spirit to the DP topics later in this course.

## **2.9 Tips and tricks**

* Always state "sort by finish time, not start time or duration" explicitly and be ready to justify it, this exact confusion is the most common mistake candidates make on this problem.

* Mention the weighted variant and that it needs DP, unprompted, it shows you understand the boundary of where greedy stops working.

# **Part 3: Prim's Algorithm (Minimum Spanning Tree)**

## **3.1 What problem it solves**

Given a connected, undirected, weighted graph, find a Minimum Spanning Tree (MST): a subset of edges that connects all vertices, contains no cycles, and has the minimum possible total edge weight. Applications: designing least-cost network cabling, road/pipeline networks connecting all cities at minimum cost.

## **3.2 How to teach it**

Analogy: growing a network outward from a single city, always laying the cheapest possible new cable that connects a city already in your network to a city not yet connected. This is exactly BFS's growing-frontier idea, but instead of a plain queue, you always expand via the cheapest available edge, using a min-heap (priority queue).

* Start at any vertex, add it to the MST set.

* Repeatedly find the minimum-weight edge that connects a vertex inside the MST set to a vertex outside it.

* Add that edge and the new vertex to the MST set.

* Repeat until all vertices are included.

## **3.3 C++ code (using a min-heap / priority\_queue)**

| int primMST(int V, vector\<vector\<pair\<int,int\>\>\>& adjList) {     // adjList\[u\] \= list of {neighbour, weight}     vector\<bool\> inMST(V, false);     priority\_queue\<pair\<int,int\>, vector\<pair\<int,int\>\>, greater\<\>\> pq;     // pq holds {weight, vertex}, min-heap by weight       pq.push({0, 0});  // start from vertex 0, cost 0     int totalWeight \= 0;       while (\!pq.empty()) {         auto \[weight, u\] \= pq.top(); pq.pop();         if (inMST\[u\]) continue;  // skip stale entries         inMST\[u\] \= true;         totalWeight \+= weight;           for (auto& \[v, w\] : adjList\[u\]) {             if (\!inMST\[v\]) pq.push({w, v});         }     }     return totalWeight; } |
| :---- |

## **3.4 Complexity**

| Implementation | Time complexity |
| :---- | :---- |
| Adjacency matrix, no heap | O(V^2), good for dense graphs |
| Adjacency list with binary heap (priority\_queue) | O(E log V) |
| Adjacency list with Fibonacci heap | O(E \+ V log V), theoretical, rarely implemented by hand |

## **3.5 When to use it**

* Dense graphs (E close to V^2), the O(V^2) adjacency-matrix version is simple and competitive.

* You already have a natural single starting point, or you are building the network outward incrementally, for example simulating physical infrastructure growth.

## **3.6 When you cannot or should not use it**

* The graph is disconnected, Prim's (as written) only finds an MST for the connected component containing the start vertex, it does not detect or handle disconnection automatically.

* Very sparse graphs where Kruskal's edge-sorting approach is typically simpler and just as fast or faster (see the comparison in Part 6).

## **3.7 Interview Q\&A**

**Q: Why does Prim's algorithm use a min-heap?**

**A:** To efficiently retrieve the minimum-weight edge crossing the current MST boundary at each step without scanning all candidate edges linearly every time, a binary heap gives O(log V) extraction of the minimum, bringing total complexity down to O(E log V) instead of O(V^2) with a naive linear scan.

**Q: Why do we check 'if (inMST\[u\]) continue' after popping from the priority queue?**

**A:** Because the same vertex can be pushed onto the queue multiple times with different weights (once for each edge discovered to it), and we only want to process it once, using the cheapest entry, which the min-heap guarantees appears first, later stale duplicate entries are simply skipped.

# **Part 4: Kruskal's Algorithm (Minimum Spanning Tree)**

## **4.1 What problem it solves**

Solves the exact same Minimum Spanning Tree problem as Prim's algorithm, but builds the tree by considering edges globally in increasing weight order, rather than growing outward from one vertex.

## **4.2 How to teach it**

Analogy: given a full price list of every possible cable connection between any two cities in the country, sort the list cheapest first, and buy cables one at a time from the top of the list, skipping any cable that would form a redundant loop (connecting two cities already reachable from each other).

* Sort all edges in the graph by weight, ascending.

* Initialise each vertex as its own separate component (Union-Find / Disjoint Set Union structure).

* For each edge in sorted order: if its two endpoints are in different components, add the edge to the MST and merge (union) the components. If they are already in the same component, adding the edge would create a cycle, skip it.

* Stop once V-1 edges have been added (a spanning tree on V vertices always has exactly V-1 edges).

## **4.3 C++ code (with Union-Find / DSU)**

| struct DSU {     vector\<int\> parent, rank\_;     DSU(int n) : parent(n), rank\_(n, 0\) {         for (int i \= 0; i \< n; i++) parent\[i\] \= i;     }     int find(int x) {         if (parent\[x\] \!= x) parent\[x\] \= find(parent\[x\]);  // path compression         return parent\[x\];     }     bool unite(int x, int y) {         int rx \= find(x), ry \= find(y);         if (rx \== ry) return false;  // already connected, would form a cycle         if (rank\_\[rx\] \< rank\_\[ry\]) swap(rx, ry);         parent\[ry\] \= rx;         if (rank\_\[rx\] \== rank\_\[ry\]) rank\_\[rx\]++;         return true;     } };   struct Edge { int u, v, weight; };   int kruskalMST(int V, vector\<Edge\>& edges) {     sort(edges.begin(), edges.end(), \[\](Edge& a, Edge& b) {         return a.weight \< b.weight;     });       DSU dsu(V);     int totalWeight \= 0, edgesUsed \= 0;       for (Edge& e : edges) {         if (dsu.unite(e.u, e.v)) {             totalWeight \+= e.weight;             edgesUsed++;             if (edgesUsed \== V \- 1\) break;         }     }     return totalWeight; } |
| :---- |

## **4.4 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(E log E), dominated by sorting edges (equivalent to O(E log V) since E is at most V^2) |
| Space complexity | O(V) for the DSU structure, O(E) to store edges |
| Union-Find operations (with path compression \+ union by rank) | Nearly O(1) amortised per operation |

## **4.5 When to use it**

* Sparse graphs (E much smaller than V^2), sorting E edges is cheaper than Prim's heap operations across a dense graph.

* The edge list is already the natural representation of your input (for example, a list of possible connections with costs), rather than an adjacency list per vertex.

## **4.6 When you cannot or should not use it**

* Very dense graphs, sorting O(V^2) edges can become more expensive than Prim's heap-based growth, Prim's is typically preferred there.

* As with Prim's, the graph must be connected for a true spanning tree to exist, Kruskal's will otherwise produce a Minimum Spanning Forest (one MST per connected component) instead.

## **4.7 Interview Q\&A**

**Q: Why does Kruskal's algorithm need a Union-Find (DSU) structure specifically?**

**A:** To efficiently answer "are these two vertices already connected?" at each candidate edge, which is exactly what determines whether adding the edge would create a cycle. DSU answers this in nearly O(1) amortised time with path compression and union by rank, far faster than checking connectivity with a fresh traversal for every edge.

**Q: What happens if you run Kruskal's algorithm on a disconnected graph?**

**A:** It will still process all edges and connect whatever it can, producing a Minimum Spanning Forest, one MST per connected component, rather than a single spanning tree, since no edge exists to connect separate components.

**Q: Why is path compression important in the Union-Find implementation?**

**A:** Without it, repeated find() calls can degrade to O(n) in the worst case if the structure becomes a long chain. Path compression flattens the tree during each find() call, so future lookups for the same elements become nearly O(1), which is essential for Kruskal's overall near-linear performance beyond the initial sort.

# **Part 5: Dijkstra's Algorithm (Single-Source Shortest Path)**

## **5.1 What problem it solves**

Given a weighted graph with non-negative edge weights and a source vertex, find the shortest path distance from the source to every other vertex. This generalises BFS's shortest-path result (which only works for unweighted graphs) to graphs where edges have different costs.

## **5.2 How to teach it**

Analogy: a GPS navigation system exploring outward from your starting point, always investigating the closest not-yet-finalised location next, and updating its best-known distance to each neighbour whenever a shorter route through the current location is discovered (this update step is called "relaxing" an edge).

* Maintain a distance array, initialised to infinity for all vertices except the source (distance 0).

* Use a min-heap to always process the unvisited vertex with the smallest known distance next (the greedy choice: this vertex's distance is now guaranteed final and will never improve).

* For each neighbour of the current vertex, relax the edge: if distance\[current\] \+ edgeWeight is smaller than the neighbour's current known distance, update it and push the neighbour into the heap.

* Repeat until the heap is empty.

## **5.3 C++ code**

| vector\<int\> dijkstra(int src, int V, vector\<vector\<pair\<int,int\>\>\>& adjList) {     // adjList\[u\] \= list of {neighbour, weight}     vector\<int\> dist(V, INT\_MAX);     dist\[src\] \= 0;       priority\_queue\<pair\<int,int\>, vector\<pair\<int,int\>\>, greater\<\>\> pq;     pq.push({0, src});  // {distance, vertex}       while (\!pq.empty()) {         auto \[d, u\] \= pq.top(); pq.pop();         if (d \> dist\[u\]) continue;  // stale entry, already found a shorter path           for (auto& \[v, weight\] : adjList\[u\]) {             if (dist\[u\] \+ weight \< dist\[v\]) {                 dist\[v\] \= dist\[u\] \+ weight;                 pq.push({dist\[v\], v});             }         }     }     return dist; } |
| :---- |

## **5.4 Complexity**

| Implementation | Time complexity |
| :---- | :---- |
| Adjacency matrix, no heap | O(V^2) |
| Adjacency list with binary heap (priority\_queue) | O((V \+ E) log V) |

## **5.5 When to use it**

* All edge weights are non-negative, this is a hard requirement, not just a performance preference.

* You need shortest distances from one source to all other vertices (or to one specific target, in which case you can stop early once the target is popped from the heap).

## **5.6 When you cannot or should not use it**

* The graph has negative edge weights, Dijkstra's greedy choice (finalising a vertex's distance as soon as it is popped) assumes no future edge could ever produce a shorter path to it, which is false if negative weights exist. Use the Bellman-Ford algorithm instead (typically covered alongside Dynamic Programming later in this course, since it uses a similar relaxation-based DP structure).

* You specifically need to detect negative-weight cycles, Dijkstra's cannot do this at all, Bellman-Ford can.

## **5.7 Interview Q\&A**

**Q: Why does Dijkstra's algorithm fail on graphs with negative edge weights?**

**A:** Dijkstra's greedy step finalises a vertex's shortest distance the moment it is popped from the min-heap, assuming no undiscovered path could ever be shorter. A negative edge encountered later could still reduce the distance to an already-finalised vertex, violating that assumption and producing an incorrect result.

**Q: What is 'edge relaxation', and why is that term used?**

**A:** Relaxing an edge (u, v) means checking whether going through u gives a shorter known path to v than what is currently recorded, and updating it if so. The term comes from imagining the distance estimate as a tight, possibly-too-high upper bound that gets "relaxed" (loosened toward the true value) whenever a better path is found.

**Q: How is Dijkstra's algorithm similar to Prim's algorithm in structure?**

**A:** Both use a min-heap to greedily pick the next vertex to finalise, and both grow a result outward one vertex at a time. The key difference is what they minimise: Prim's picks the vertex with the cheapest single connecting edge to the current tree, while Dijkstra's picks the vertex with the cheapest total accumulated path distance from the source.

# **Part 6: Summary of the Greedy Approach**

## **6.1 The two properties every greedy algorithm relies on**

* Greedy-choice property: a locally optimal choice at each step leads to a globally optimal solution, and this must be provable (usually via an exchange argument), not assumed.

* Optimal substructure: the optimal solution to the full problem builds directly from optimal solutions to the remaining subproblem after the greedy choice is made.

## **6.2 The classic greedy failure case: 0/1 Knapsack**

This is the single most important counterexample to know. Items (value, weight): (60,10), (100,20), (120,30), capacity \= 50, but items are now indivisible (0/1 Knapsack, not fractional).

* Greedy by ratio would pick item1 (ratio 6\) and item2 (ratio 5): total weight 30, total value 160, with 20 capacity left unused since item3 (weight 30\) does not fit.

* The true optimal choice is item2 \+ item3: total weight 50, total value 220, which greedy never finds because it committed to item1 early and could not undo that choice.

*This is exactly why 0/1 Knapsack requires Dynamic Programming (covered in Weeks 8-9): it needs to consider both including and excluding each item and compare the resulting subproblems, something a one-directional greedy pass cannot do.*

## **6.3 Comparison table of this week's greedy algorithms**

| Algorithm | Problem solved | Greedy choice made | Typical complexity | Key structure used |
| :---- | :---- | :---- | :---- | :---- |
| Fractional Knapsack | Maximise value within weight capacity, divisible items | Take the highest value/weight ratio item available | O(n log n) | Sorting |
| Activity Selection | Maximise count of non-overlapping activities | Pick the activity that finishes earliest | O(n log n) | Sorting |
| Prim's | Minimum Spanning Tree | Add the cheapest edge connecting the tree to a new vertex | O(E log V) | Min-heap |
| Kruskal's | Minimum Spanning Tree | Add the cheapest edge that does not form a cycle | O(E log E) | Sorting \+ Union-Find |
| Dijkstra's | Single-source shortest path (non-negative weights) | Finalise the closest not-yet-finalised vertex | O((V+E) log V) | Min-heap |

## **6.4 Prim's vs Kruskal's, at a glance**

| Aspect | Prim's | Kruskal's |
| :---- | :---- | :---- |
| Grows from | A single starting vertex, outward | Globally, across all edges by weight |
| Best for | Dense graphs | Sparse graphs |
| Core structure | Min-heap (priority queue) | Sorting \+ Union-Find (DSU) |
| Cycle avoidance | Implicit, only considers edges leaving the current tree | Explicit, checked via Union-Find |

## **6.5 Structuring your answer when asked to "explain" a greedy algorithm**

* 1\. State the optimisation goal clearly (maximise/minimise what, subject to what constraint).

* 2\. State the specific greedy choice rule in one sentence.

* 3\. Justify briefly why that greedy choice is safe for this problem (exchange argument intuition), or name the classic counterexample if the interviewer is testing whether you know greedy does not always work.

* 4\. Trace it on a small example.

* 5\. State time/space complexity and the data structure that makes it efficient (heap, sort, Union-Find).

## **6.6 Frequently repeated cross-cutting questions**

**Q: How do you know, in general, whether a problem can be solved with a greedy algorithm?**

**A:** There is no universal test, you either recognise the problem as matching a known greedy-solvable pattern, or you attempt to prove the greedy-choice property yourself, typically via an exchange argument showing that any optimal solution can be rearranged to match the greedy choice without becoming worse. If you cannot construct that argument and a counterexample exists, the problem likely needs Dynamic Programming instead.

**Q: As a UTA, how would you help a student understand why greedy works for Activity Selection but not for 0/1 Knapsack?**

**A:** Walk them through the concrete 0/1 Knapsack counterexample by hand, showing the greedy pick and the true optimal pick side by side with actual numbers, then contrast it with the Activity Selection exchange argument, seeing one problem where greedy provably breaks and one where it provably works makes the distinction concrete rather than a rule to memorise.

## **6.7 Final checklist before the interview**

* Can you code fractional knapsack and activity selection from memory in under 3 minutes each?

* Can you code Prim's and Kruskal's, including the DSU structure with path compression, without looking anything up?

* Can you code Dijkstra's and explain precisely why it fails on negative weights?

* Can you reproduce the 0/1 Knapsack greedy-failure counterexample with actual numbers, from memory?

* Can you explain, for any greedy algorithm you are asked about, exactly what the greedy choice is and why it is safe, in one or two sentences?