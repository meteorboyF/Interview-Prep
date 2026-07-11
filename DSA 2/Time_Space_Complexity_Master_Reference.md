  
**Time & Space Complexity**

**Master Reference: DSA 1 & DSA 2**

*UTA Interview Preparation Notes*

Consolidated complexity tables for every algorithm and data structure covered across DSA 1 and DSA 2

# **Part 0: What Time and Space Complexity Actually Mean**

Time complexity describes how the number of operations an algorithm performs grows as input size (n) grows. Space complexity describes how the extra memory it uses grows with n. Neither measures actual seconds or bytes, they measure growth rate, which is what makes them comparable across different machines and languages.

## **How to teach it**

Analogy: imagine three people searching for a name. Person A checks every page of an unsorted phone book one by one (linear). Person B has a sorted phone book and repeatedly opens to the middle of the remaining range (logarithmic). Person C has already built an index card for every name in advance and just looks up the card (constant). All three eventually find the name, but how their effort scales as the phone book grows to a million names is completely different, that scaling behaviour is exactly what complexity notation captures.

## **Big-O, Big-Omega, Big-Theta, in plain terms**

* Big-O (O): the worst-case upper bound, "this algorithm never does more than this much work." This is what is almost always meant in interviews when someone says "time complexity."

* Big-Omega (Ω): the best-case lower bound, "this algorithm never does less than this much work."

* Big-Theta (Θ): a tight bound, used when best case and worst case are the same order, "this algorithm always does almost exactly this much work."

*In practice, most interview conversations use Big-O loosely to mean "the relevant bound for this case" (best/average/worst), always clarify which case you are describing when precision matters.*

## **Common complexity classes, fastest to slowest growth**

| Notation | Name | n=10 | n=1,000 | n=1,000,000 | Example from this syllabus |
| :---- | :---- | :---- | :---- | :---- | :---- |
| O(1) | Constant | 1 | 1 | 1 | Stack push/pop, hash map lookup, array index access |
| O(log n) | Logarithmic | \~3 | \~10 | \~20 | Binary search, BST search (balanced) |
| O(n) | Linear | 10 | 1,000 | 1,000,000 | Linear search, single array traversal, BFS/DFS (per edge+vertex) |
| O(n log n) | Linearithmic | \~33 | \~9,966 | \~19,931,569 | Merge sort, quick sort (avg), building a sorted structure |
| O(n^2) | Quadratic | 100 | 1,000,000 | 10^12 | Selection/bubble/insertion sort, naive nested-loop pair checking |
| O(2^n) | Exponential | 1,024 | astronomical | astronomical | Naive recursive Fibonacci, brute-force subsets |

*The key interview-relevant takeaway: the gap between O(n log n) and O(n^2) looks small on paper but becomes enormous at real-world scale, this is exactly why merge sort/quicksort replace the O(n^2) sorts once n grows large, and why this is one of the most common "why does this matter in practice" interview questions.*

## **How to analyse code to find its complexity**

* A single loop over n elements: O(n).

* A loop inside a loop, both over roughly n elements: O(n^2), multiply the iteration counts.

* A loop that cuts the problem in half each time (like binary search): O(log n).

* A recursive function: write its recurrence relation, for example T(n) \= 2T(n/2) \+ O(n) for merge sort, then solve it (recursion tree, or the Master Theorem) to get the closed form, in this case O(n log n).

* Space complexity: count extra memory used beyond the input itself, an array of size n allocated inside the function is O(n) space, a fixed number of variables is O(1), and recursion adds O(depth) space for the call stack even if no extra data structure is allocated.

## **Interview Q\&A**

**Q: Why do we ignore constants and lower-order terms in Big-O notation (writing O(n) instead of O(3n \+ 5))?**

**A:** Because Big-O describes growth rate as n becomes large, and for large enough n, the highest-order term dominates the total regardless of constants, two algorithms that are O(n) will eventually behave similarly in scaling even if one has a larger constant factor, while an O(n) algorithm will always eventually beat an O(n^2) algorithm as n grows, regardless of constants.

**Q: Can an algorithm have different best-case and worst-case time complexity? Give an example from this syllabus.**

**A:** Yes. Insertion sort is O(n) best case (already sorted input) but O(n^2) worst case (reverse sorted input). Quicksort is O(n log n) average/best case but O(n^2) worst case (consistently poor pivot choices). Always state which case you are referring to when asked for "the" complexity.

**Q: What is the difference between time complexity and space complexity trade-offs? Give an example.**

**A:** Sometimes you can trade one for the other. Hashing-based set operations use O(n) extra space to achieve O(1) average lookups, versus a sorted-array approach that uses O(1) extra space but needs O(log n) lookups. Memoisation in recursion trades O(n) or more extra space to bring exponential time down to polynomial time, exactly the fix for naive recursive Fibonacci.

# **Part 1: DSA 1 Complexity Reference**

## **1.1 Sorting Algorithms**

| Algorithm | Best | Average | Worst | Space | Stable | In-place |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Selection Sort | O(n^2) | O(n^2) | O(n^2) | O(1) | No | Yes |
| Bubble Sort | O(n)\* | O(n^2) | O(n^2) | O(1) | Yes | Yes |
| Insertion Sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes | Yes |

*\* Bubble sort reaches O(n) best case only with the swapped-flag early-exit optimisation.*

## **1.2 Searching Algorithms**

| Algorithm | Best | Average / Worst | Space | Precondition |
| :---- | :---- | :---- | :---- | :---- |
| Linear Search | O(1) | O(n) | O(1) | None |
| Sentinel Linear Search | O(1) | O(n) | O(1) | None (array is mutated temporarily) |
| Binary Search | O(1) | O(log n) | O(1) iterative / O(log n) recursive | Array must be sorted |

## **1.3 Singly Linked List**

| Operation | Time | Notes |
| :---- | :---- | :---- |
| Insert at head | O(1) | \- |
| Insert at tail | O(n) / O(1)\* | \*O(1) with a maintained tail pointer |
| Insert at position | O(n) | O(pos) precisely |
| Delete at head | O(1) | \- |
| Delete at tail | O(n) | Needs the second-to-last node |
| Delete by value | O(n) | Search \+ unlink |
| Search | O(n) | \- |
| Reverse (iterative) | O(n) time, O(1) space | Three-pointer technique |
| Cycle detection (Floyd's) | O(n) time, O(1) space | Slow/fast pointer |

## **1.4 Doubly Linked List**

| Operation | Time | Notes |
| :---- | :---- | :---- |
| Insert at head / after known node | O(1) | \- |
| Insert at tail (with tail pointer) | O(1) | \- |
| Delete at head | O(1) | \- |
| Delete at tail (with tail pointer) | O(1) | Advantage over singly linked list |
| Delete a known node (by pointer) | O(1) | Advantage over singly linked list |
| Search | O(n) | Same as singly linked list |
| Extra memory per node | O(1) constant overhead | 2 pointers vs 1 for singly linked list |

## **1.5 Stack and Queue**

| Structure / Operation | Time | Space |
| :---- | :---- | :---- |
| Stack: push, pop, peek | O(1) | O(1) extra |
| Stack: search for a value | O(n) | \- |
| Queue (naive array, shifting) | Enqueue O(1), Dequeue O(n) | O(1) extra |
| Queue (circular array or linked list) | Enqueue O(1), Dequeue O(1) | O(1) extra |

## **1.6 Graph Representation and Traversal**

| Item | Time | Space |
| :---- | :---- | :---- |
| Adjacency matrix storage | \- | O(V^2) |
| Adjacency list storage | \- | O(V \+ E) |
| Check edge exists (matrix) | O(1) | \- |
| Check edge exists (list) | O(degree of vertex) | \- |
| BFS | O(V \+ E) | O(V) |
| DFS (recursive or iterative) | O(V \+ E) | O(V), plus recursion depth for recursive version |
| Topological Sort (DFS-based) | O(V \+ E) | O(V) |
| Topological Sort (Kahn's / BFS-based) | O(V \+ E) | O(V) |

## **1.7 Trees and Binary Search Trees**

| Operation | Time (balanced / average) | Time (worst case, skewed) | Space |
| :---- | :---- | :---- | :---- |
| Inorder / Preorder / Postorder traversal | O(n) | O(n) | O(h) recursion, h \= height |
| Level order traversal (BFS) | O(n) | O(n) | O(n) for the queue in the worst level |
| BST Search | O(log n) | O(n) | O(1) iterative / O(h) recursive |
| BST Insert | O(log n) | O(n) | O(1) iterative / O(h) recursive |
| BST Delete | O(log n) | O(n) | O(1) iterative / O(h) recursive |

*Worst case occurs when the BST is skewed (essentially a linked list), for example inserting already-sorted data into a plain, unbalanced BST.*

## **1.8 Set Operations**

| Operation | Hash set (average) | Sorted array / tree set |
| :---- | :---- | :---- |
| Insert | O(1) | O(log n) |
| Search / contains | O(1) | O(log n) |
| Union (sizes n, m) | O(n \+ m) | O(n \+ m), needs sorted input |
| Intersection (sizes n, m) | O(n \+ m) | O(n \+ m) with two pointers on sorted input |

# **Part 2: DSA 2 Complexity Reference**

## **2.1 Divide and Conquer**

| Algorithm | Best | Average | Worst | Space | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Stable, never degrades |
| Quick Sort | O(n log n) | O(n log n) | O(n^2) | O(log n) | In-place, worst case on poor pivot choice |
| Maximum Subarray (Divide and Conquer) | \- | O(n log n) | O(n log n) | O(log n) | Demonstrates the D\&C technique |
| Maximum Subarray (Kadane's Algorithm) | \- | O(n) | O(n) | O(1) | The true optimal solution |

## **2.2 Greedy Algorithms**

| Algorithm | Time complexity | Space | Key structure |
| :---- | :---- | :---- | :---- |
| Fractional Knapsack | O(n log n) | O(1) extra | Sorting by ratio |
| Activity Selection | O(n log n) | O(1) extra | Sorting by finish time |
| Prim's (adjacency matrix) | O(V^2) | O(V) | None, linear scan |
| Prim's (adjacency list \+ min-heap) | O(E log V) | O(V \+ E) | Min-heap (priority queue) |
| Kruskal's | O(E log E) | O(V \+ E) | Sorting \+ Union-Find |
| Dijkstra's (adjacency matrix) | O(V^2) | O(V) | None, linear scan |
| Dijkstra's (adjacency list \+ min-heap) | O((V+E) log V) | O(V \+ E) | Min-heap (priority queue) |

*Union-Find (DSU) operations, with path compression and union by rank, run in nearly O(1) amortised time per operation, formally O(α(n)) where α is the inverse Ackermann function, which is effectively constant for any n that could exist in practice.*

## **2.3 STL Container Operations (DSA 2 Review)**

| Container | Insert | Search | Notes |
| :---- | :---- | :---- | :---- |
| vector | O(1) at end, O(n) elsewhere | O(n) | O(1) random access by index |
| stack / queue | O(1) | N/A, only end(s) accessible | \- |
| map / set | O(log n) | O(log n) | Balanced BST internally, sorted order |
| unordered\_map / unordered\_set | O(1) average | O(1) average | Hash table, no order, O(n) worst case on collisions |

## **2.4 Recursion vs Iteration (General)**

| Aspect | Recursion | Iteration |
| :---- | :---- | :---- |
| Extra space | O(depth) for the call stack | O(1) typically |
| Naive recursive Fibonacci | O(2^n) time, exponential | O(n) time with a simple loop |
| Memoised recursive Fibonacci | O(n) time, O(n) space | Same as iterative with a DP array |

## **2.5 Best, Average, and Worst Case Examples**

The input example is as important as the notation in an interview: state the complexity, then name the condition that causes it. When an algorithm always performs the same asymptotic amount of work, all three cases are identical.

### **Sorting and Searching**

| Algorithm | Best case: time and example | Average case: time and example | Worst case: time and example | Auxiliary space |
| :---- | :---- | :---- | :---- | :---- |
| Selection Sort | O(n^2), any input; it still scans the entire unsorted suffix | O(n^2), randomly ordered input | O(n^2), any input; comparisons do not decrease | O(1) |
| Bubble Sort (optimised) | O(n), already sorted input; the first pass makes no swaps | O(n^2), randomly ordered input | O(n^2), reverse-sorted input; nearly every comparison swaps | O(1) |
| Insertion Sort | O(n), already sorted input; each key needs one comparison | O(n^2), randomly ordered input | O(n^2), reverse-sorted input; every key shifts across the sorted prefix | O(1) |
| Merge Sort | O(n log n), any input; every level still merges all n items | O(n log n), randomly ordered input | O(n log n), any input; input order does not change the recursion tree | O(n) |
| Quick Sort | O(n log n), each pivot divides the array into near-equal halves | O(n log n), pivots are reasonably balanced on typical random input | O(n^2), each pivot is the smallest or largest item, such as sorted input with a last-element pivot | O(log n) average, O(n) worst recursion stack |
| Linear Search | O(1), target is the first item | O(n), target is typically around the middle | O(n), target is last or absent | O(1) |
| Sentinel Linear Search | O(1), target is the first item | O(n), target is around the middle | O(n), target is last or absent | O(1) |
| Binary Search | O(1), target is the middle item | O(log n), target is found after several halvings | O(log n), target is absent or found at the deepest level | O(1) iterative, O(log n) recursive |

### **Linear Data Structures**

| Algorithm / operation | Best case: time and example | Average case: time and example | Worst case: time and example | Auxiliary space |
| :---- | :---- | :---- | :---- | :---- |
| Linked List Search | O(1), target is at the head | O(n), target is around the middle | O(n), target is at the tail or absent | O(1) |
| Linked List Insert by Position | O(1), insert at the head | O(n), position is around the middle | O(n), insert at the tail without a tail pointer | O(1) |
| Linked List Delete by Value | O(1), target is at the head | O(n), target is around the middle | O(n), target is at the tail or absent | O(1) |
| Linked List Reverse | O(n), any n-node list | O(n), any n-node list | O(n), every pointer must be reversed | O(1) iterative, O(n) recursive |
| Floyd's Cycle Detection | O(1), the head immediately participates in a self-loop | O(n), pointers meet after traversing part of the list | O(n), no cycle or the meeting point is reached only after many steps | O(1) |
| Stack Push / Pop / Peek | O(1), any valid operation | O(1), any valid operation | O(1), fixed work regardless of stack size | O(1) per operation |
| Queue Enqueue / Dequeue (circular or linked) | O(1), any valid operation | O(1), any valid operation | O(1), fixed pointer or index updates | O(1) per operation |
| Queue Dequeue (naive shifting array) | O(1), queue contains at most one item | O(n), remaining items are shifted | O(n), dequeue from a full n-item queue | O(1) |

### **Trees, Graphs, and Sets**

| Algorithm / operation | Best case: time and example | Average case: time and example | Worst case: time and example | Auxiliary space |
| :---- | :---- | :---- | :---- | :---- |
| BST Search | O(1), target is at the root | O(log n), tree is reasonably balanced | O(n), tree is skewed and target is deepest or absent | O(1) iterative, O(h) recursive |
| BST Insert | O(1), inserting into an empty tree | O(log n), tree is reasonably balanced | O(n), inserting into a skewed tree | O(1) iterative, O(h) recursive |
| BST Delete | O(1), root or located node needs no traversal and has at most one child | O(log n), target is in a balanced tree | O(n), target is deep in a skewed tree or deleting a node requires finding a deep successor | O(1) iterative, O(h) recursive |
| Tree Traversal (DFS) | O(n), any n-node tree | O(n), any n-node tree | O(n), every node must be visited | O(h), up to O(n) for a skewed tree |
| Breadth-First Search | O(V + E), full traversal of any represented graph | O(V + E), full traversal of a typical graph | O(V + E), all reachable vertices and edges are examined | O(V) |
| Depth-First Search | O(V + E), full traversal of any represented graph | O(V + E), full traversal of a typical graph | O(V + E), all reachable vertices and edges are examined | O(V) |
| Topological Sort | O(V + E), any DAG | O(V + E), any DAG | O(V + E), every vertex and edge must be processed | O(V) |
| Hash Set Search / Insert | O(1), direct bucket access with no collision | O(1), a well-distributed hash function and controlled load factor | O(n), all keys collide into one bucket | O(n) table storage |
| Set Union / Intersection | O(n + m), empty or disjoint inputs still require processing the inputs | O(n + m), typical sets | O(n + m), every element must be considered | O(n + m) for the result |

### **Divide and Conquer, Greedy, Dynamic Programming, and Strings**

| Algorithm | Best case: time and example | Average case: time and example | Worst case: time and example | Auxiliary space |
| :---- | :---- | :---- | :---- | :---- |
| Maximum Subarray (D&C) | O(n log n), any input; both halves and crossing sums are evaluated | O(n log n), mixed positive and negative values | O(n log n), any input; value arrangement does not prune work | O(log n) |
| Kadane's Algorithm | O(n), any input; every element is examined once | O(n), mixed values | O(n), any input; every element is still examined | O(1) |
| Fractional Knapsack | O(n log n), items already ordered by ratio when a general comparison sort is still run | O(n log n), randomly ordered ratios | O(n log n), reverse ratio order; sorting dominates | O(1) extra excluding sort implementation |
| Activity Selection | O(n log n), activities already ordered by finish time when sorting is still run | O(n log n), randomly ordered activities | O(n log n), reverse finish-time order; sorting dominates | O(1) extra excluding sort implementation |
| Prim's (matrix) | O(V^2), any connected weighted graph | O(V^2), typical graph | O(V^2), matrix scanning is independent of edge arrangement | O(V) |
| Prim's (min-heap) | O(E log V), sparse connected graph under the standard bound | O(E log V), typical adjacency-list graph | O(E log V), many edge relaxations and heap updates | O(V + E) |
| Kruskal's Algorithm | O(E log E), edges already ordered when a general sort is still run | O(E log E), randomly ordered edges | O(E log E), reverse-ordered edges; sorting dominates | O(V + E) |
| Dijkstra's (matrix) | O(V^2), any non-negative weighted graph | O(V^2), typical graph | O(V^2), matrix scanning is independent of weights | O(V) |
| Dijkstra's (min-heap) | O((V + E) log V), sparse graph with few successful relaxations | O((V + E) log V), typical graph | O((V + E) log V), many successful relaxations create heap entries | O(V + E) |
| Bellman-Ford | O(E), an implementation with early exit on a graph needing one relaxation pass | O(VE), paths propagate across several passes | O(VE), shortest paths require all V-1 passes, such as edges presented in an unfavourable order | O(V) |
| 0/1 Knapsack DP | O(nW), any values and weights for n items and capacity W | O(nW), typical input | O(nW), all table states are filled regardless of values | O(nW), reducible to O(W) |
| Longest Common Subsequence DP | O(nm), any two strings of lengths n and m | O(nm), partially matching strings | O(nm), matching pattern does not change the table size | O(nm), reducible to O(min(n,m)) for length only |
| Matrix Chain Multiplication DP | O(n^3), any chain of n matrices | O(n^3), typical dimensions | O(n^3), every split for every interval is tested | O(n^2) |
| KMP String Matching | O(n + m), match begins immediately after the O(m) LPS build | O(n + m), typical text and pattern | O(n + m), many partial matches, such as repeated prefixes; KMP never moves the text pointer backward | O(m) |
| Travelling Salesman (brute force) | O(n!), any n-city cost matrix | O(n!), typical costs | O(n!), every tour is enumerated without pruning | O(n) recursion/path storage |
| Travelling Salesman (Held-Karp DP) | O(n^2 2^n), any n-city cost matrix | O(n^2 2^n), typical costs | O(n^2 2^n), all subset-and-endpoint states are evaluated | O(n 2^n) |
| Naive Recursive Fibonacci | O(2^n), any requested n under the standard loose bound | O(2^n), any requested n | O(2^n), recursion repeatedly recomputes the same subproblems | O(n) recursion stack |
| Memoised Fibonacci | O(n), any requested n | O(n), any requested n | O(n), each value from 0 through n is computed once | O(n) |

# **Part 3: Master Summary and Interview Notes**

## **3.1 Every algorithm in this syllabus, ranked by typical time complexity**

| Complexity | Algorithms from DSA 1 & DSA 2 | Why this class |
| :---- | :---- | :---- |
| O(1) | Stack/Queue push-pop-front-back, hash map/set average insert-search, array index access | A fixed number of steps that does not grow with n: a direct index, pointer update, or hash computation reaches the target without scanning anything. |
| O(log n) | Binary search, BST search/insert/delete (balanced case) | Each step throws away a constant fraction (about half) of what remains, so only ~log2(n) steps are needed to shrink n down to 1. |
| O(n) | Linear search, linked list traversal/search, BFS/DFS (in terms of V, technically O(V+E)), Kadane's Algorithm, tree traversals | Every element (or every vertex and edge) is visited a constant number of times in a single pass, so work grows in direct proportion to the input size. |
| O(n log n) | Merge sort, quick sort (avg/best), Divide and Conquer max subarray, Fractional Knapsack, Activity Selection, Kruskal's (as O(E log E)) | O(n) work is done at each of the ~log n levels of a halving divide-and-conquer (or one dominating comparison sort), giving n multiplied by log n. |
| O(n^2) | Selection sort, bubble sort, insertion sort (worst/avg), quick sort (worst case), Prim's/Dijkstra's with adjacency matrix (in terms of V) | Two nested loops each run ~n times, so nearly every element is compared or shifted against every other: n multiplied by n operations. |
| O(2^n) | Naive recursive Fibonacci (the classic example of when NOT to use plain recursion) | The recursion branches into ~2 subproblems at each of n levels with no reuse of results, so the call tree doubles every level: 2^n total calls. |

## **3.2 Every algorithm in this syllabus, ranked by typical space complexity**

*Space here means auxiliary (extra) memory beyond the input itself; recursion counts its call-stack depth.*

| Complexity | Where it shows up (DSA 1 & DSA 2) | Why this much memory |
| :---- | :---- | :---- |
| O(1) | Selection/bubble/insertion sort, iterative binary search, linked list traversal/reverse, Kadane's Algorithm, stack/queue operations | Uses only a fixed set of variables (a few indices or pointers) and rearranges or scans the existing data in place, allocating nothing that grows with n. |
| O(log n) | Recursive binary search, quick sort (average recursion depth), balanced BST recursive operations | The extra memory is the recursion call stack, and a balanced halving divide is only about log2(n) frames deep at any one moment. |
| O(n) | Merge sort (merge buffer), BFS/DFS (visited array plus the queue/stack), hash map/set, memoised Fibonacci, adjacency list O(V+E), 1-D DP arrays, recursion on a skewed tree or linked list | Allocates one auxiliary structure - an array, queue, hash table, memo/DP table, or a recursion stack - whose size grows in direct proportion to the input. |
| O(n^2) | 0/1 Knapsack, LCS and Matrix-Chain DP tables, graph adjacency matrix (O(V^2)) | Stores a value for every pair of indices: an n by n grid of subproblems (or a slot for every possible vertex-to-vertex edge). |

## **3.3 How to answer "what is the time complexity" in an interview**

* 1\. State which case you are giving (best, average, or worst), do not just say a bare complexity without qualifying it if it varies.

* 2\. Justify it briefly: point to the loop structure, the recurrence relation, or the specific input pattern that triggers that case.

* 3\. State the space complexity too, even if not asked, it shows completeness and is very often the actual follow-up question.

* 4\. If relevant, mention the trade-off against an alternative algorithm (for example, "O(n^2) worst case for quicksort, but faster in practice than merge sort's guaranteed O(n log n) due to cache locality").

## **3.4 Common mistakes to avoid**

* Confusing average case with worst case, always specify which one you mean, especially for quicksort and hash-based structures.

* Forgetting that O(V \+ E) is not the same as O(V) or O(E) alone, both terms matter and neither can be dropped in a general graph.

* Stating a data structure's complexity without stating which implementation, for example "queue dequeue is O(1)" is only true for a circular array or linked-list-based queue, not a naive shifting array queue.

* Forgetting recursion's hidden O(depth) space cost, an algorithm can look O(1) extra space in the code but still carry O(n) recursion stack space.

## **3.5 Final checklist before the interview**

* Can you state the best/average/worst time and space complexity for every algorithm across DSA 1 and DSA 2 without hesitation?

* Can you explain, for at least three algorithms, why their worst case differs from their average case, with a concrete triggering example?

* Can you derive complexity from a recurrence relation on the spot (state it, then solve it via recursion tree reasoning)?

* Can you always follow a time complexity answer with the matching space complexity, unprompted?

* Can you explain Big-O to a first-year student using an everyday analogy, before ever writing a formula?
