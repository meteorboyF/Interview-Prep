  
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

# **Part 3: Master Summary and Interview Notes**

## **3.1 Every algorithm in this syllabus, ranked by typical time complexity**

| Complexity | Algorithms from DSA 1 & DSA 2 |
| :---- | :---- |
| O(1) | Stack/Queue push-pop-front-back, hash map/set average insert-search, array index access |
| O(log n) | Binary search, BST search/insert/delete (balanced case) |
| O(n) | Linear search, linked list traversal/search, BFS/DFS (in terms of V, technically O(V+E)), Kadane's Algorithm, tree traversals |
| O(n log n) | Merge sort, quick sort (avg/best), Divide and Conquer max subarray, Fractional Knapsack, Activity Selection, Kruskal's (as O(E log E)) |
| O(n^2) | Selection sort, bubble sort, insertion sort (worst/avg), quick sort (worst case), Prim's/Dijkstra's with adjacency matrix (in terms of V) |
| O(2^n) | Naive recursive Fibonacci (the classic example of when NOT to use plain recursion) |

## **3.2 How to answer "what is the time complexity" in an interview**

* 1\. State which case you are giving (best, average, or worst), do not just say a bare complexity without qualifying it if it varies.

* 2\. Justify it briefly: point to the loop structure, the recurrence relation, or the specific input pattern that triggers that case.

* 3\. State the space complexity too, even if not asked, it shows completeness and is very often the actual follow-up question.

* 4\. If relevant, mention the trade-off against an alternative algorithm (for example, "O(n^2) worst case for quicksort, but faster in practice than merge sort's guaranteed O(n log n) due to cache locality").

## **3.3 Common mistakes to avoid**

* Confusing average case with worst case, always specify which one you mean, especially for quicksort and hash-based structures.

* Forgetting that O(V \+ E) is not the same as O(V) or O(E) alone, both terms matter and neither can be dropped in a general graph.

* Stating a data structure's complexity without stating which implementation, for example "queue dequeue is O(1)" is only true for a circular array or linked-list-based queue, not a naive shifting array queue.

* Forgetting recursion's hidden O(depth) space cost, an algorithm can look O(1) extra space in the code but still carry O(n) recursion stack space.

## **3.4 Final checklist before the interview**

* Can you state the best/average/worst time and space complexity for every algorithm across DSA 1 and DSA 2 without hesitation?

* Can you explain, for at least three algorithms, why their worst case differs from their average case, with a concrete triggering example?

* Can you derive complexity from a recurrence relation on the spot (state it, then solve it via recursion tree reasoning)?

* Can you always follow a time complexity answer with the matching space complexity, unprompted?

* Can you explain Big-O to a first-year student using an everyday analogy, before ever writing a formula?