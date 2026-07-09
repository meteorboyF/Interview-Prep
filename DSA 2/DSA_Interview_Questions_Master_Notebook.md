  
**DSA Interview Questions**

**Master Notebook: DSA 1 & DSA 2**

*UTA Interview Preparation*

Every interview question across both courses, organised by topic, with rapid-fire drills and a UTA-specific section

# **How to Use This Notebook**

This is a consolidated question bank pulled from all DSA 1 and DSA 2 topic notes, plus additional rapid-fire questions per topic. It is designed for the final revision phase: cover the answer, attempt the question aloud as if teaching, then check.

* Conceptual Q\&A: the deeper 'explain why' questions an interviewer uses to test understanding.

* Rapid-fire: quick factual recall (complexities, preconditions, one-liners) to drill until automatic.

* As a UTA, you are assessed on teaching clarity as much as correctness, the final section covers teaching-specific questions.

*Contents: Part 1 covers DSA 1 (sorting, searching, linked lists, stacks, queues, graphs, trees, sets). Part 2 covers DSA 2 (C++/STL/recursion review, divide and conquer, greedy, dynamic programming). Part 3 is cross-cutting and UTA-specific questions.*

# **Part 1: DSA 1 Interview Questions**

## **1.1 Sorting (Selection, Bubble, Insertion)**

**Conceptual**

**Q: Why is selection sort O(n^2) even in the best case, unlike bubble/insertion sort?**

**A:** It always scans the entire unsorted portion to find the minimum, regardless of whether the array is already sorted. There is no early exit based on data order.

**Q: Is selection sort stable? Can it be made stable?**

**A:** Not by default, swapping the minimum into place can move an equal element past another. It can be made stable by shifting elements instead of swapping, at the cost of more data movement.

**Q: When would you actually prefer selection sort in practice?**

**A:** When writes/swaps are far more expensive than comparisons, since it makes only O(n) swaps versus O(n^2) for bubble sort, useful for flash memory or EEPROM.

**Q: How do you make bubble sort adaptive (best case O(n))?**

**A:** Add a boolean flag tracking whether any swap happened in a pass. If a full pass makes zero swaps, the array is sorted, so break out early.

**Q: Why is bubble sort considered inefficient compared to insertion sort, even though both are O(n^2)?**

**A:** Bubble sort typically performs more swaps for the same input, since it moves an element one position per comparison, while insertion sort shifts a block more efficiently and does fewer total writes on average.

**Q: Why is insertion sort used inside hybrid algorithms like Timsort and Introsort?**

**A:** For small subarrays (roughly under 16-32 elements) it has very low constant overhead and is naturally adaptive, so it beats the recursion overhead of quicksort/mergesort at small sizes.

**Q: What does it mean for insertion sort to be 'online'?**

**A:** It can sort a list as elements arrive one at a time, without seeing the whole dataset in advance, since each new element is inserted into the already-sorted portion built so far.

**Q: What does 'stable sort' mean, and why does it matter?**

**A:** Equal-keyed elements keep their original relative order. It matters when sorting by a second field after already sorting by a first, a stable sort preserves the earlier ordering within ties.

**Rapid-fire**

* Selection sort best/avg/worst? All O(n^2).

* Which of the three O(n^2) sorts is best for nearly sorted data? Insertion sort (O(n) best case).

* Which makes the fewest swaps? Selection sort (O(n) swaps).

* Which are stable? Bubble and insertion; selection is not (by default).

* Bidirectional bubble sort is also called? Cocktail (shaker) sort.

* Core operation of insertion sort? Shifting, not swapping.

## **1.2 Searching (Linear, Binary)**

**Conceptual**

**Q: When would you use linear search instead of binary search?**

**A:** When data is unsorted and sorting would cost more than a single scan, when the dataset is very small, or when searching a linked list where random access is not O(1).

**Q: Why write mid \= low \+ (high \- low) / 2 instead of (low \+ high) / 2?**

**A:** To avoid integer overflow. For large low and high, their sum can exceed the maximum integer value, causing incorrect or negative results, the subtraction form keeps the intermediate value bounded.

**Q: What is the time complexity of binary search and why?**

**A:** O(log n), because each comparison eliminates half the remaining search space, so it takes log base 2 of n steps to shrink n elements to 1\.

**Q: How would you find the first occurrence of a duplicated target using binary search?**

**A:** Run binary search normally, but when arr\[mid\] equals the target, record the index and continue searching the left half (high \= mid \- 1\) instead of stopping, to find any earlier occurrence.

**Q: Can binary search be applied to a linked list?**

**A:** Not efficiently, it needs O(1) random access to the middle element each step, and a linked list only offers O(n) sequential access, which removes the log n benefit.

**Rapid-fire**

* Binary search precondition? The array must be sorted.

* Linear search precondition? None.

* Binary search space, iterative vs recursive? O(1) vs O(log n) call stack.

* How do you optimise linear search? Sentinel search (removes the bounds check each iteration).

* Binary search on a rotated sorted array, key idea? At each step find which half is properly sorted, then check if the target lies in that half's range.

## **1.3 Linked Lists (Singly & Doubly)**

**Conceptual**

**Q: Why is inserting at the head O(1) for a linked list but O(n) for an array?**

**A:** An array insert at the front must shift every element right; a linked list only creates a node and redirects the head pointer, no existing node moves.

**Q: Why is deleting the last node O(n) in a singly linked list?**

**A:** You need the second-to-last node to set its next to NULL, and a singly list only has forward pointers, so finding it requires traversing from the head.

**Q: What happens if you lose the head pointer?**

**A:** The whole list becomes unreachable, since head is the only entry point. In C++ without garbage collection this also leaks memory.

**Q: How do you detect a cycle in a linked list, and its complexity?**

**A:** Floyd's slow/fast pointer algorithm, O(n) time and O(1) space, better than a hash set of visited nodes which needs O(n) space.

**Q: Can you reverse a linked list in place, and its space complexity?**

**A:** Yes, the iterative three-pointer method reverses in one O(n) pass with O(1) extra space. The recursive version is O(n) time but O(n) space due to the call stack.

**Q: What is the main advantage of a doubly linked list over a singly linked list?**

**A:** O(1) deletion of a node you hold a pointer to, and O(1) tail deletion with a tail pointer, because the previous node is directly reachable via the prev pointer.

**Q: What is the trade-off for that advantage?**

**A:** Extra memory (one more pointer per node) and more pointer updates per operation, meaning more chances for bugs, since both next and prev must stay consistent.

**Q: Why is a doubly linked list used in an LRU cache instead of a singly linked list?**

**A:** An LRU cache must move a node to the front and evict the back node in O(1), which requires unlinking an arbitrary node in O(1), needing access to both neighbours, only a doubly linked list provides that directly.

**Rapid-fire**

* The reusable reversal pattern uses which three pointers? prev, curr, next.

* Insert at head complexity? O(1).

* Search complexity? O(n) for both list types.

* std::list in C++ is implemented as? A doubly linked list.

* Two real-world uses of a doubly linked list? LRU cache, browser back/forward history.

* First node's prev and last node's next in a DLL? Both NULL.

## **1.4 Stack & Queue**

**Conceptual**

**Q: What is stack overflow, and what causes it in practice?**

**A:** Pushing onto a full-capacity stack; with recursion it happens when too many nested calls exceed the call stack's memory, usually from infinite or excessively deep recursion.

**Q: How would you implement a queue using two stacks?**

**A:** Keep an 'in' and an 'out' stack. Push to 'in'. To dequeue, if 'out' is empty, pop everything from 'in' into 'out' (reversing order), then pop from 'out'. Amortised O(1) per operation.

**Q: Why is a stack the natural choice for checking balanced parentheses?**

**A:** The most recently opened bracket must be closed first, which is exactly LIFO, the top of the stack always holds the most recent unmatched opening bracket.

**Q: Why is a circular queue preferred over a simple array-based queue?**

**A:** A simple array queue dequeuing from index 0 must shift all remaining elements (O(n)); a circular queue wraps front/rear with modulo, reusing freed space for O(1) enqueue and dequeue.

**Q: How would you implement a stack using two queues?**

**A:** To push, enqueue into queue1 then rotate all previously-present elements behind it so the newest sits at the front; this makes push O(n) and pop O(1).

**Q: What is the difference between a queue and a deque?**

**A:** A queue allows insert at the rear and remove at the front only (strict FIFO); a deque (double-ended queue) allows insert and remove at both ends.

**Rapid-fire**

* Stack order vs queue order? LIFO vs FIFO.

* push/pop/peek complexity? O(1).

* Circular queue isFull() condition? (rear \+ 1\) % capacity \== front.

* Which data structure does recursion implicitly use? A stack (the call stack).

* Which structure powers BFS? A queue. DFS? A stack (or recursion).

* STL stack/queue are built on which container by default? deque.

## **1.5 Graphs (Representation, BFS, DFS, Topological Sort)**

**Conceptual**

**Q: When would you choose an adjacency matrix over an adjacency list?**

**A:** For dense graphs (edges near V^2) or when you need frequent O(1) edge-existence checks. For sparse/most real-world graphs, an adjacency list is preferred for O(V+E) space.

**Q: Why does BFS give the shortest path in an unweighted graph?**

**A:** It explores vertices in increasing order of distance from the source, level by level, so the first time a vertex is reached is guaranteed to be via the fewest edges.

**Q: Why mark a vertex visited when it is enqueued, rather than when it is dequeued?**

**A:** Otherwise the same vertex could be enqueued multiple times by different neighbours before processing, wasting time/space and possibly giving an incorrect distance. Marking at enqueue time ensures each vertex enters the queue once.

**Q: What is the key difference between BFS and DFS in exploration order?**

**A:** BFS explores level by level using a queue; DFS goes as deep as possible along one path before backtracking, using a stack or recursion.

**Q: How would you detect a cycle in an undirected graph using DFS?**

**A:** During DFS, if you reach an already-visited vertex that is not the immediate parent of the current node, a cycle exists, so you pass the parent along with each recursive call.

**Q: Why must a graph be acyclic for a topological order to exist?**

**A:** In a cycle, every vertex depends on another that ultimately depends back on it, so no vertex can be placed before all others, there is no valid starting point.

**Q: What is the difference between the DFS-based topological sort and Kahn's algorithm?**

**A:** DFS-based uses finish times pushed onto a stack (reverse post-order); Kahn's is iterative, using in-degree counts and a queue, repeatedly removing zero-in-degree vertices. Both are O(V+E); Kahn's also detects cycles.

**Q: Why is BFS/DFS complexity O(V \+ E) and not just O(V) or O(E)?**

**A:** Every vertex is visited once (O(V)) and each vertex's full adjacency list is scanned once, summing to O(E) across all vertices, so neither term can be dropped.

**Rapid-fire**

* Adjacency matrix space? O(V^2). Adjacency list space? O(V+E).

* BFS/DFS time complexity? O(V+E).

* Does BFS give shortest path on a weighted graph? No, only unweighted (use Dijkstra's for weighted).

* Topological sort precondition? The graph must be a DAG (directed, acyclic).

* Which topological method detects cycles for free? Kahn's algorithm (result size \!= V means a cycle).

## **1.6 Trees & Binary Search Trees**

**Conceptual**

**Q: Why does inorder traversal of a BST always produce sorted output?**

**A:** Inorder visits the whole left subtree (smaller values), then the node, then the right subtree (larger values), and this holds recursively, so the overall order is strictly increasing.

**Q: Why is deleting a node with two children the hardest case, and how do you handle it?**

**A:** Removing it directly disconnects both subtrees with no single child to promote. Replace its value with its inorder successor (smallest in the right subtree), then delete that successor, which has at most one child.

**Q: What is the worst-case time complexity of BST operations, and when does it occur?**

**A:** O(n), when the tree is skewed into essentially a linked list, which happens when values are inserted in sorted or reverse-sorted order into a plain, unbalanced BST.

**Q: How would you check if a binary tree is a valid BST?**

**A:** Run an inorder traversal and confirm the sequence is strictly increasing, or recursively verify each node's value falls within a valid (min, max) range inherited from its ancestors, not just comparing to immediate children.

**Q: How would you find the height of a binary tree?**

**A:** Recursively: height(node) \= 1 \+ max(height(left), height(right)), with height(null) \= \-1 or 0 by convention, which must be stated explicitly.

**Rapid-fire**

* Inorder order? Left, Root, Right. Preorder? Root, Left, Right. Postorder? Left, Right, Root.

* Which traversal gives sorted output on a BST? Inorder.

* Which traversal to copy/serialize a tree? Preorder. To delete a tree safely? Postorder.

* Level-order traversal uses which structure? A queue (it is BFS on a tree).

* BST search/insert/delete, balanced vs skewed? O(log n) vs O(n).

* How to fix the skewed-BST worst case? Self-balancing trees (AVL, Red-Black).

## **1.7 Set Operations**

**Conceptual**

**Q: What is the difference between std::set and std::unordered\_set in C++?**

**A:** std::set is a balanced BST (sorted, O(log n) operations); std::unordered\_set is a hash table (no order, average O(1), O(n) worst case on many collisions).

**Q: When would you choose a hash-based set over a tree-based set?**

**A:** When you need the fastest average lookup and do not need sorted iteration. Choose the tree-based set when you need sorted order, range queries, or worst-case guarantees.

**Q: How would you find the intersection of two very large arrays without a large hash set in memory?**

**A:** Sort both arrays (or read them already sorted), then use a two-pointer sweep, needing only O(1) extra space beyond the arrays, no hash table required.

**Q: How is a set related to binary search trees?**

**A:** std::set is a direct application of a self-balancing BST: same inorder-gives-sorted property and same O(log n) search/insert/delete, with automatic balancing to avoid the skewed worst case.

**Rapid-fire**

* std::set insert/search? O(log n). unordered\_set average? O(1).

* Union/intersection of two sets sizes n, m? O(n+m).

* STL algorithms set\_union/set\_intersection require input to be? Sorted.

* Does a set allow duplicates? No, they are silently discarded (use multiset if needed).

# **Part 2: DSA 2 Interview Questions**

## **2.1 C++, STL & Recursion Review**

**Conceptual**

**Q: Why pass a large object by reference instead of by value?**

**A:** Passing by value copies the whole object (time and memory proportional to its size); passing by reference (or const reference if read-only) gives direct O(1) access to the original regardless of size.

**Q: What does const mean in a parameter like 'const vector\<int\>& arr'?**

**A:** The function receives the argument by reference (no copy) but promises not to modify it, the compiler errors if the body tries to change arr. It is the standard way to pass large read-only arguments.

**Q: You need to count word frequency in a large document, which container and why?**

**A:** unordered\_map\<string,int\>, average O(1) insertion and lookup per word, and order does not matter for a frequency count.

**Q: Now you must print that frequency in alphabetical order, does your choice change?**

**A:** Either switch to map\<string,int\> (sorted keys, O(log n) ops), or keep unordered\_map for fast counting and copy into a vector of pairs to sort once at the end, often faster if counting dominates.

**Q: Why can't you efficiently insert at the front of a vector, but you can for a queue?**

**A:** A vector stores elements contiguously, so a front insert shifts everything right (O(n)); a queue only modifies its ends and its underlying deque supports O(1) insertion at both ends.

**Q: What are the two required components of any correct recursive function?**

**A:** A base case that terminates without a further recursive call, and a recursive case that reduces the problem toward the base case. Missing either causes infinite recursion and stack overflow.

**Q: Why does naive recursive Fibonacci run in exponential time?**

**A:** It recomputes the same subproblems repeatedly, fib(n-2) is computed inside both the fib(n-1) and fib(n-2) branches, and this duplication compounds at every level, giving roughly 2^n calls.

**Q: Can every recursive function be rewritten iteratively?**

**A:** Yes, using an explicit stack to simulate the call stack. Some conversions are simple (tail recursion), others require carefully managing the state that would otherwise live on the call stack.

**Q: What is tail recursion, and why does it matter?**

**A:** A recursive call in tail position is the last operation with no pending work after it returns. Some compilers optimise it into a loop (tail call optimisation), avoiding stack growth, though this is not guaranteed in standard C++.

**Rapid-fire**

* struct vs class default access in C++? struct is public, class is private, by default.

* Vector random access? O(1). Vector front insert? O(n).

* map vs unordered\_map ordering? Sorted vs no order.

* Naive Fibonacci time? O(2^n). Memoised? O(n).

* Recursion's hidden space cost? O(depth) for the call stack.

## **2.2 Divide and Conquer (Merge Sort, Quick Sort, Max Subarray)**

**Conceptual**

**Q: Why is merge sort's time complexity O(n log n)?**

**A:** The array is halved at each level (log n levels), and merging across all subarrays at each level does O(n) total work, so O(n) per level times log n levels gives O(n log n).

**Q: Why does merge sort need O(n) extra space?**

**A:** The merge step needs a temporary array to hold the merged result while reading from both halves, you cannot merge two sorted halves back into the same array in place without overwriting data still needed.

**Q: Is merge sort stable, and why does that matter?**

**A:** Yes, if the merge takes from the left half on ties (using \<= not \<), equal elements keep their relative order, which matters when sorting by one field after another.

**Q: Why does quicksort have a worst case of O(n^2), and when does it happen?**

**A:** When the pivot is repeatedly the smallest or largest element, each partition splits into sizes 0 and n-1 instead of two halves, giving n levels of O(n) work. It happens on sorted/reverse-sorted input with a first/last-element pivot.

**Q: How would you reduce the chance of quicksort's worst case in practice?**

**A:** Use randomised pivot selection or median-of-three, both make the worst-case pattern extremely unlikely on real or adversarial input.

**Q: Why is quicksort often faster in practice than merge sort despite a worse worst case?**

**A:** It sorts in place with better cache locality (no separate temporary array) and has smaller constant factors, while merge sort's extra allocation and copying add overhead.

**Q: Why does Kadane's algorithm work, in one sentence?**

**A:** A negative running sum can never help a future subarray, so it is always at least as good to restart from the current element as to extend a negative-sum prefix into it.

**Q: How do you derive the complexity of a divide and conquer algorithm generally?**

**A:** Write its recurrence, for example T(n) \= 2T(n/2) \+ O(n) for merge sort, then solve it via recursion tree or the Master Theorem, giving O(n log n) here.

**Rapid-fire**

* Merge sort best/avg/worst? All O(n log n). Space? O(n).

* Quick sort avg vs worst? O(n log n) vs O(n^2). Space? O(log n).

* Which is stable, merge or quick? Merge sort.

* Which is in-place, merge or quick? Quick sort.

* Best sort for a linked list? Merge sort (no random access needed).

* Optimal max-subarray algorithm and complexity? Kadane's, O(n) time O(1) space.

* The one line that IS Kadane's algorithm? currentMax \= max(arr\[i\], currentMax \+ arr\[i\]).

## **2.3 Greedy Algorithms**

**Conceptual**

**Q: Why does greedy work for fractional knapsack but not 0/1 knapsack?**

**A:** With fractions allowed, you always fill capacity exactly using best ratios with no waste (provable by exchange argument). In 0/1, items are indivisible, so a high-ratio item may not fit the remaining capacity, forcing suboptimal leftover space that greedy cannot fix.

**Q: Why does activity selection sort by finish time, not start time or duration?**

**A:** Choosing the earliest-finishing activity leaves the most remaining time for future activities. An exchange argument shows any optimal solution can start with the earliest-finishing activity without reducing the count.

**Q: Why doesn't sorting activities by shortest duration work?**

**A:** A short activity can still finish very late and block more of the schedule than a longer one that finishes early; finish time, not duration, determines remaining room.

**Q: Why does Prim's algorithm use a min-heap?**

**A:** To efficiently extract the minimum-weight edge crossing the MST boundary each step in O(log V), giving O(E log V) total instead of O(V^2) with a linear scan.

**Q: Why does Kruskal's need a Union-Find (DSU) structure?**

**A:** To answer 'are these two vertices already connected?' at each edge in nearly O(1), which determines whether adding the edge forms a cycle, far faster than a fresh traversal per edge.

**Q: Why is path compression important in Union-Find?**

**A:** Without it, find() can degrade to O(n) on a long chain. Path compression flattens the tree during each find, making future lookups nearly O(1), essential for Kruskal's near-linear performance beyond the sort.

**Q: Why can't Dijkstra's algorithm handle negative edge weights?**

**A:** It finalises a vertex's distance when popped from the heap, assuming no future path could shorten it, a negative edge encountered later could still reduce an already-finalised distance, breaking that assumption.

**Q: What is edge relaxation, and why is it called that?**

**A:** Checking whether going through u gives a shorter path to v than currently recorded, and updating if so. The distance estimate is a too-high upper bound that gets 'relaxed' toward the true value when a better path is found.

**Q: How is Dijkstra's similar to Prim's in structure?**

**A:** Both use a min-heap to greedily pick the next vertex and grow outward one vertex at a time. Prim's minimises the single connecting edge weight; Dijkstra's minimises total accumulated distance from the source.

**Q: How do you know whether a problem can be solved greedily?**

**A:** There is no universal test, either recognise a known greedy pattern or prove the greedy-choice property via an exchange argument. If you cannot and a counterexample exists, use Dynamic Programming instead.

**Rapid-fire**

* Fractional knapsack complexity and greedy choice? O(n log n), take highest value/weight ratio.

* Activity selection greedy choice? Pick the earliest-finishing activity.

* Prim's vs Kruskal's core structure? Min-heap vs sorting \+ Union-Find.

* Prim's better for which graphs? Dense. Kruskal's? Sparse.

* Dijkstra's precondition? Non-negative edge weights.

* The classic greedy-failure problem? 0/1 Knapsack.

## **2.4 Dynamic Programming (0-1 Knapsack, Bellman-Ford, LCS, MCM)**

**Conceptual**

**Q: What distinguishes Dynamic Programming from plain Divide and Conquer?**

**A:** DP is for overlapping subproblems, the same subproblem recurs many times, so results are cached and reused. Divide and Conquer assumes independent, non-overlapping subproblems (like merge sort's halves).

**Q: What is the difference between memoisation and tabulation?**

**A:** Memoisation is top-down: the natural recursion plus a cache filled on first computation. Tabulation is bottom-up: iteratively filling a table smallest-subproblem-first, avoiding recursion overhead.

**Q: Why does 0/1 Knapsack need DP instead of the greedy approach?**

**A:** Items are indivisible, so a high-ratio item may waste remaining capacity, and greedy's single irrevocable pass cannot undo that. DP explores both include and exclude for every item and keeps the genuinely best outcome.

**Q: Why must the inner loop go downward in the space-optimised 1D knapsack?**

**A:** dp\[w\] must reference the previous item's value at dp\[w \- weight\]; going upward could reuse a value already updated for the current item in the same pass, counting the item more than once (that would be Unbounded Knapsack).

**Q: What does 'pseudo-polynomial time' mean for 0/1 Knapsack?**

**A:** O(n\*W) is polynomial in the numeric value of W, but W can need exponentially many bits to represent, so runtime relative to input size in bits can behave exponentially for huge W, efficient for small capacities, impractical for astronomically large ones.

**Q: Why does Bellman-Ford need exactly V-1 rounds of relaxation?**

**A:** The longest shortest (simple) path has at most V-1 edges since it cannot revisit a vertex. Each round propagates the shortest distance one more edge along any such path, so V-1 rounds finalise every shortest path.

**Q: How does Bellman-Ford's extra Vth pass detect a negative cycle?**

**A:** If everything stabilised after V-1 rounds, one more pass should find nothing to relax. If an edge can still be relaxed, some distance is still decreasing, only possible via a reachable negative-weight cycle.

**Q: Why does LCS take max(dp\[i-1\]\[j\], dp\[i\]\[j-1\]) on a mismatch, not dp\[i-1\]\[j-1\]?**

**A:** On a mismatch, the current character of at least one string cannot be in the LCS ending here, so the best answer comes from ignoring one character from either string. Using dp\[i-1\]\[j-1\] would skip both at once, possibly missing a valid subsequence needing only one skipped.

**Q: What is the difference between Longest Common Subsequence and Substring?**

**A:** A subsequence preserves order but allows gaps; a substring must be contiguous. Substring's DP resets to 0 on a mismatch rather than taking the max of neighbouring subproblems.

**Q: Why is Matrix Chain Multiplication a DP problem, not Divide and Conquer alone?**

**A:** Trying every split point recomputes the same sub-chains repeatedly across different larger splits, that overlap signals DP. Caching each dp\[i\]\[j\] the first time brings it from exponential to O(n^3).

**Q: Why does the MCM table fill by increasing chain length?**

**A:** Computing dp\[i\]\[j\] needs dp\[i\]\[k\] and dp\[k+1\]\[j\], both shorter sub-chains. Filling by increasing length guarantees every needed shorter sub-chain is already computed.

**Rapid-fire**

* 0-1 Knapsack time/space? O(nW) / O(nW) or O(W) optimised.

* Bellman-Ford time? O(VE). Handles negatives? Yes. Detects negative cycles? Yes.

* Dijkstra's vs Bellman-Ford one-liner? Speed vs correctness under negative weights.

* LCS time/space? O(mn) / O(mn) or O(min(m,n)) for length only.

* MCM time/space? O(n^3) / O(n^2).

* MCM cost formula? dp\[i\]\[j\] \= min over k of dp\[i\]\[k\] \+ dp\[k+1\]\[j\] \+ p\[i-1\]\*p\[k\]\*p\[j\].

* Two things every DP needs? Overlapping subproblems and optimal substructure.

# **Part 3: Cross-Cutting & UTA-Specific Questions**

## **3.1 Paradigm comparison questions (very commonly asked)**

**Q: Compare Divide and Conquer, Greedy, and Dynamic Programming.**

**A:** Divide and Conquer splits into independent non-overlapping subproblems (merge sort). Greedy makes one irrevocable locally optimal choice per step and needs a provable greedy-choice property (Dijkstra's, MST). DP handles overlapping subproblems by caching results and needs optimal substructure, more general but usually higher complexity (0/1 Knapsack, LCS).

**Q: Give one example each where greedy works and where it fails, and explain the difference.**

**A:** Works: Fractional Knapsack, taking a fraction of the best-ratio item never wastes capacity. Fails: 0/1 Knapsack, indivisible items mean committing early to a high-ratio item can waste capacity a different combination would use better, needing DP's fuller exploration.

**Q: When is BFS the right tool versus Dijkstra's versus Bellman-Ford for shortest paths?**

**A:** BFS for unweighted graphs (O(V+E)). Dijkstra's for non-negative weighted graphs (O((V+E) log V)). Bellman-Ford when negative weights exist or negative cycles must be detected (O(VE), slower).

**Q: Which sorting algorithm would you pick for: a linked list, a nearly-sorted array, and a huge array needing worst-case guarantees?**

**A:** Linked list: merge sort (no random access needed). Nearly-sorted array: insertion sort (O(n) best case). Huge array with worst-case guarantees: merge sort (guaranteed O(n log n)) or heapsort, not plain quicksort due to its O(n^2) worst case.

## **3.2 Complexity questions that span topics**

**Q: Why do we ignore constants and lower-order terms in Big-O?**

**A:** Big-O describes growth rate for large n, where the highest-order term dominates regardless of constants. An O(n) algorithm always eventually beats an O(n^2) one as n grows, whatever the constants.

**Q: Can an algorithm have different best and worst case complexity? Give examples.**

**A:** Yes. Insertion sort: O(n) best, O(n^2) worst. Quicksort: O(n log n) average, O(n^2) worst. Always specify which case you mean.

**Q: Give an example of a time-space trade-off from these courses.**

**A:** Hash-based sets use O(n) extra space for O(1) average lookups versus a sorted array's O(1) space but O(log n) lookups. Memoisation trades O(n) space to cut naive Fibonacci from O(2^n) to O(n) time.

## **3.3 UTA-specific teaching questions**

These assess teaching ability, which for a UTA role matters as much as technical correctness. Answers should emphasise drawing, analogies, and meeting the student where they are.

**Q: How would you explain binary search to a student who does not understand it?**

**A:** Start with the dictionary or phone-book analogy before any code, draw the sorted array, physically point at the middle element for a few iterations by hand, and only introduce the mid formula and code once the halving/elimination idea is visually clear.

**Q: A student confuses BFS and DFS. How do you help?**

**A:** Have them trace both on the same small graph side by side, using a real queue (write left to right, remove from the left) for BFS and a real stack (write top to bottom, remove from the top) for DFS, so the difference in exploration order becomes visually obvious rather than abstract.

**Q: A student has memorised the three tree traversals but does not understand why the orders differ. How do you help?**

**A:** Have them act out the recursion on a drawn tree with three sticky notes labelled L, Root, R, moving a token by each traversal's rule, seeing the token visit nodes in a different sequence makes the distinction concrete rather than three memorised snippets.

**Q: How would you help a student decide whether a new problem needs Greedy or DP?**

**A:** Have them write the greedy rule then actively hunt for a small counterexample by hand, like the 0/1 Knapsack (60,10)(100,20)(120,30) case. Finding one proves DP is needed; not finding one is a hint (not proof) greedy may work, so they should still reason via an exchange argument.

**Q: How would you help a student debug a segmentation fault in their linked list code?**

**A:** Ask them to draw the list on paper and trace their pointer updates line by line against the drawing, most linked list bugs come from dereferencing NULL or losing a reference before use, which becomes visible immediately once drawn.

**Q: A student cannot see why splitting a problem in half (divide and conquer) helps at all. How do you help?**

**A:** Draw the recursion tree level by level for a small array and have them count comparisons per level versus number of levels, seeing that log n levels of O(n) work totals far less than n^2 for any real n makes the benefit tangible.

**Q: What is your general approach to explaining any algorithm to a first-year student?**

**A:** Lead with a one-sentence everyday analogy, then the step-by-step mechanism in plain words, then a tiny worked example on paper, then complexity and one real use case, always starting from a drawing rather than from code.

## **3.4 The universal answer template**

When asked to explain or teach any algorithm, structure the answer consistently, this itself signals teaching competence:

* 1\. One-sentence intuition or analogy.

* 2\. Step-by-step mechanism in plain words.

* 3\. A small worked example (5-6 elements) on the board.

* 4\. Time and space complexity, stating which case.

* 5\. When to use it, when not to, and one real-world application.

## **3.5 Final confidence checklist**

* Can you answer every conceptual question above out loud, without reading the answer?

* Can you rattle off the rapid-fire answers instantly, they are the ones most likely to be fired at you in quick succession?

* Can you code every core algorithm from both courses in C++ from memory, in a few minutes each?

* For any algorithm, can you state what problem it solves, when to use it, and when it fails?

* Can you handle at least three of the UTA teaching questions convincingly, showing you would start from a drawing or analogy, not code?

* Can you compare Divide and Conquer, Greedy, and DP fluently, with a concrete example of each?