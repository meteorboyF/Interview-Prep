  
**DSA 2**

**Dynamic Programming**

*UTA Interview Preparation Notes*

Covers Weeks 8-9: Bellman-Ford, 0-1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication (MCM)

# **Part 0: The Dynamic Programming Paradigm**

Dynamic Programming (DP) solves a problem by breaking it into overlapping subproblems, solving each subproblem exactly once, and storing (caching) its result so it never needs to be recomputed. This is the critical difference from plain Divide and Conquer, where subproblems are assumed independent and never overlap.

## **How to teach it**

Analogy: naive recursive Fibonacci recomputes fib(3) separately inside both the fib(5) and fib(4) branches, doing the same work over and over, exactly like solving the same homework problem from scratch every time it reappears instead of writing the answer down once and reusing it. DP is simply "remember answers to subproblems you have already solved."

* Overlapping subproblems: the same smaller subproblem is needed multiple times across the recursion, this is the signal that caching will help (contrast with Divide and Conquer, Week 3, where subproblems like the two halves of merge sort never overlap).

* Optimal substructure: the optimal solution to the full problem can be built from optimal solutions to its subproblems, the same requirement Greedy also needs, but DP does not additionally require the greedy-choice property, so it works even when Greedy fails (like 0/1 Knapsack, see Week 5-7 notes).

## **Two ways to implement DP**

**Top-down (Memoisation)**

Write the natural recursive solution, then add a cache (array or hash map) that stores the result for each subproblem the first time it is computed, and returns the cached value immediately on future calls with the same parameters.

| unordered\_map\<int, long long\> memo;   long long fib(int n) {     if (n \<= 1\) return n;     if (memo.count(n)) return memo\[n\];  // already solved, reuse it     return memo\[n\] \= fib(n \- 1\) \+ fib(n \- 2); } // O(n) time instead of the naive O(2^n) |
| :---- |

**Bottom-up (Tabulation)**

Identify the order subproblems must be solved in (usually smallest first), and fill a table iteratively, so that by the time a larger subproblem needs a smaller one, it is already computed and sitting in the table. This avoids recursion and its call-stack overhead entirely.

| long long fib(int n) {     vector\<long long\> dp(n \+ 1);     dp\[0\] \= 0;     if (n \>= 1\) dp\[1\] \= 1;     for (int i \= 2; i \<= n; i++) {         dp\[i\] \= dp\[i \- 1\] \+ dp\[i \- 2\];     }     return dp\[n\]; } |
| :---- |

## **What problem this technique solves**

Any optimisation or counting problem with overlapping subproblems and optimal substructure: minimum/maximum cost, counting the number of ways to do something, or a yes/no feasibility question, where the naive recursive solution would repeat identical work exponentially many times.

## **When to use it**

* You have a working recursive solution, but it is too slow because it recomputes identical subproblems (a strong signal: draw the recursion tree and see if the same parameters appear in multiple branches).

* Greedy has been ruled out (no provable greedy-choice property), but optimal substructure still holds.

## **When you cannot or should not use it**

* The problem has no optimal substructure at all, no amount of caching subproblem answers helps if a locally optimal subproblem answer cannot be combined into a globally optimal answer.

* A provable greedy solution exists and is simpler/faster, always prefer Greedy over DP when the greedy-choice property genuinely holds, DP is more general but typically has higher time/space complexity for the same problem class.

* The number of distinct subproblems is itself exponential (does not actually collapse), caching does not help if there is nothing to reuse, this happens with poorly chosen state definitions, a key skill in DP is choosing a state representation that keeps the number of distinct subproblems polynomial.

# **Part 1: 0-1 Knapsack**

## **1.1 What problem it solves**

The same setup as Fractional Knapsack (Weeks 5-7): items with weight and value, a knapsack with weight capacity, maximise total value. The critical difference: items are indivisible, you either take an item whole or leave it, no fractions allowed. This single change is exactly why the Greedy approach that worked for Fractional Knapsack fails here (see the worked counterexample in the Greedy Algorithms notes, Part 6.2).

## **1.2 How to teach it**

Analogy: packing a physical suitcase with whole indivisible items (a laptop, a specific pair of shoes), you cannot take "two-thirds of a laptop." For every item, you face a binary decision: include it or exclude it, and that decision affects how much capacity remains for every item considered afterwards, this dependency between decisions is exactly what makes it a DP problem rather than a greedy one.

* Define the state: dp\[i\]\[w\] \= the maximum value achievable using the first i items with a knapsack capacity of w.

* For each item i, there are exactly two choices: exclude it (value stays dp\[i-1\]\[w\]), or include it, if it fits (value becomes item's value \+ dp\[i-1\]\[w \- item's weight\]).

* Take the better of the two choices: dp\[i\]\[w\] \= max(exclude, include if it fits).

## **1.3 C++ code (2D tabulation)**

| int knapsack01(vector\<int\>& weights, vector\<int\>& values, int capacity) {     int n \= weights.size();     vector\<vector\<int\>\> dp(n \+ 1, vector\<int\>(capacity \+ 1, 0));       for (int i \= 1; i \<= n; i++) {         for (int w \= 0; w \<= capacity; w++) {             dp\[i\]\[w\] \= dp\[i \- 1\]\[w\];  // exclude item i             if (weights\[i \- 1\] \<= w) {                 dp\[i\]\[w\] \= max(dp\[i\]\[w\], values\[i \- 1\] \+ dp\[i \- 1\]\[w \- weights\[i \- 1\]\]);             }         }     }     return dp\[n\]\[capacity\]; } |
| :---- |

## **1.4 Space-optimised 1D version**

Since dp\[i\]\[w\] only ever depends on the previous row (dp\[i-1\]\[...\]), the full 2D table can be collapsed into a single 1D array, provided the inner loop iterates capacity downward, this ordering prevents using an already-updated value from the current item within the same pass.

| int knapsack01Optimised(vector\<int\>& weights, vector\<int\>& values, int capacity) {     int n \= weights.size();     vector\<int\> dp(capacity \+ 1, 0);       for (int i \= 0; i \< n; i++) {         for (int w \= capacity; w \>= weights\[i\]; w--) {  // iterate downward             dp\[w\] \= max(dp\[w\], values\[i\] \+ dp\[w \- weights\[i\]\]);         }     }     return dp\[capacity\]; } |
| :---- |

## **1.5 Worked example (the exact Greedy counterexample from Weeks 5-7, revisited)**

*Items (value, weight): (60,10), (100,20), (120,30). Capacity \= 50\.*

* Greedy by ratio picked item1 \+ item2 \= value 160, wasting 20 units of capacity.

* DP correctly evaluates every combination: item2 \+ item3 (weight 20+30=50, value 100+120=220) is feasible and better.

* DP result: 220, the true optimum, exactly the gap Greedy could not close.

## **1.6 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(n \* W), n \= number of items, W \= capacity |
| Space complexity | O(n \* W) for 2D table, O(W) for the space-optimised 1D version |
| Note | This is 'pseudo-polynomial': polynomial in the numeric value of W, not in the number of bits needed to represent W, so it becomes slow if W is very large numerically |

## **1.7 When to use it**

* Items are indivisible and the capacity W is reasonably small (pseudo-polynomial time is only practical when W is not astronomically large).

* Any problem that reduces to "select a subset under a capacity constraint to maximise/minimise value", a very common problem-reduction target in interviews (subset sum, partition equal subset sum, and similar problems are variations of this same DP).

## **1.8 When you cannot or should not use it**

* Items are divisible, use the much faster Greedy Fractional Knapsack (O(n log n)) instead, DP is unnecessary overkill there.

* Capacity W is extremely large (for example, up to 10^9), the O(n \* W) table becomes infeasible, this signals a different approach is needed (sometimes meet-in-the-middle or approximation, generally beyond this course's scope).

## **1.9 Interview Q\&A**

**Q: Why does 0/1 Knapsack need Dynamic Programming instead of the Greedy approach that works for Fractional Knapsack?**

**A:** Because items cannot be split, a high value/weight ratio item might not leave enough remaining capacity to use efficiently, and once Greedy commits to taking it, that decision cannot be undone. DP instead explores both the include and exclude decision for every item and keeps the genuinely best outcome, which Greedy's single irrevocable pass cannot guarantee.

**Q: Why must the inner loop go downward (from capacity to weights\[i\]) in the space-optimised 1D version?**

**A:** Because dp\[w\] in the 1D version must reference the previous item's row's value at dp\[w \- weight\], if the loop went upward, dp\[w \- weight\] might already have been updated with the current item's contribution earlier in the same pass, effectively allowing the same item to be counted more than once, which is exactly the Unbounded Knapsack variant, not 0/1 Knapsack.

**Q: What does 'pseudo-polynomial time' mean, and why does it matter here?**

**A:** O(n \* W) is polynomial in the numeric value of W, but W's numeric value can require exponentially many bits to represent for very large capacities, so the algorithm's true runtime relative to input size (measured in bits) can behave exponentially for huge W. This matters because it means 0/1 Knapsack is efficient for reasonably small numeric capacities but becomes impractical if capacity values are astronomically large, even though the algorithm looks polynomial on paper.

## **1.10 Tips and tricks**

* Always draw the recursive decision tree first (include vs exclude at each item) before writing the DP table, it makes the state definition dp\[i\]\[w\] intuitive rather than memorised.

* Explicitly contrast this with Fractional Knapsack unprompted, interviewers frequently ask both back to back specifically to test whether you understand why Greedy fails here.

* Mention the space-optimised 1D version as a follow-up improvement, it is a very common "can you optimise this further" ask.

# **Part 2: Bellman-Ford Algorithm**

## **2.1 What problem it solves**

Single-source shortest path, the same problem Dijkstra's algorithm solves (Weeks 5-7), but Bellman-Ford also works correctly when the graph has negative edge weights, and it can additionally detect negative-weight cycles, both of which Dijkstra's cannot handle at all.

## **2.2 How to teach it**

Analogy: instead of greedily trusting that the closest not-yet-finalised vertex is truly final (Dijkstra's assumption, which breaks with negative edges), Bellman-Ford takes a more patient, brute-force-but-provably-sufficient approach: it relaxes every single edge in the graph, repeated V-1 times. The key insight taught here as classic DP reasoning: any shortest path between two vertices uses at most V-1 edges (a simple path cannot revisit a vertex), so after V-1 full rounds of relaxing every edge, every shortest path is guaranteed to have been found, regardless of edge order.

* Initialise distance to the source as 0, and all other vertices as infinity.

* Repeat V-1 times: for every edge (u, v, weight) in the graph, relax it, if dist\[u\] \+ weight \< dist\[v\], update dist\[v\].

* After V-1 rounds, do one more pass over all edges, if any edge can still be relaxed, a negative-weight cycle exists reachable from the source (shortest paths are not well-defined in that case).

## **2.3 C++ code**

| struct Edge { int u, v, weight; };   vector\<int\> bellmanFord(int src, int V, vector\<Edge\>& edges, bool& hasNegativeCycle) {     vector\<int\> dist(V, INT\_MAX);     dist\[src\] \= 0;     hasNegativeCycle \= false;       // relax all edges V-1 times     for (int i \= 0; i \< V \- 1; i++) {         for (Edge& e : edges) {             if (dist\[e.u\] \!= INT\_MAX && dist\[e.u\] \+ e.weight \< dist\[e.v\]) {                 dist\[e.v\] \= dist\[e.u\] \+ e.weight;             }         }     }       // one more pass to detect a negative-weight cycle     for (Edge& e : edges) {         if (dist\[e.u\] \!= INT\_MAX && dist\[e.u\] \+ e.weight \< dist\[e.v\]) {             hasNegativeCycle \= true;             break;         }     }     return dist; } |
| :---- |

## **2.4 Why V-1 rounds specifically (the DP argument)**

This is the classic interview follow-up. A shortest path in a graph with V vertices can contain at most V-1 edges, because a shortest (simple) path never revisits a vertex. Each full round of relaxing all edges is guaranteed to correctly finalise at least one more edge's worth of the true shortest path from the source, in the worst case, so after V-1 rounds, every shortest path, however many edges it uses (up to V-1), has been fully accounted for.

## **2.5 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(V \* E), V-1 rounds, each scanning all E edges, plus one more pass for cycle detection |
| Space complexity | O(V), for the distance array |

## **2.6 Bellman-Ford vs Dijkstra's**

| Aspect | Dijkstra's | Bellman-Ford |
| :---- | :---- | :---- |
| Handles negative weights? | No, gives incorrect results | Yes, correctly |
| Detects negative cycles? | No | Yes |
| Time complexity | O((V+E) log V) with a min-heap | O(V \* E), slower |
| Approach | Greedy, finalises one vertex at a time | Dynamic Programming style, relax all edges repeatedly |

## **2.7 When to use it**

* The graph may contain negative edge weights, for example modelling costs that can represent a rebate/discount as a negative value.

* You need to detect whether a negative-weight cycle exists at all, a requirement Dijkstra's simply cannot fulfil.

## **2.8 When you cannot or should not use it**

* All edge weights are non-negative and performance matters, Dijkstra's O((V+E) log V) is significantly faster than Bellman-Ford's O(V\*E) on the same graph, always prefer Dijkstra's when negative weights are not a concern.

* The graph actually contains a negative cycle reachable from the source, shortest paths through that cycle are undefined (you could loop forever, decreasing distance indefinitely), Bellman-Ford can only detect this, not produce a meaningful shortest-path answer for affected vertices.

## **2.9 Interview Q\&A**

**Q: Why can't Dijkstra's algorithm handle negative edge weights?**

**A:** Dijkstra's greedily finalises a vertex's shortest distance the moment it is popped from the min-heap, assuming no future discovery could ever shorten it further. A negative edge encountered later could still reduce the distance to an already-finalised vertex, which Dijkstra's has no mechanism to revisit, producing an incorrect result.

**Q: Why does Bellman-Ford need exactly V-1 rounds of relaxation, not more or fewer?**

**A:** Because the longest possible shortest (simple) path in a graph with V vertices has at most V-1 edges, a path cannot revisit a vertex and still be shortest. Each round is guaranteed to correctly propagate the shortest distance one additional edge further along any such path, so V-1 rounds are sufficient to finalise every shortest path, and a round that still finds an update after this point signals a negative cycle rather than a legitimate longer path.

**Q: How exactly does the extra Vth pass detect a negative-weight cycle?**

**A:** If every shortest path had truly stabilised after V-1 rounds, one more full pass over all edges should find nothing left to relax. If some edge can still be relaxed on this extra pass, it means a vertex's distance is still decreasing indefinitely, which is only possible if it lies on or is reachable from a negative-weight cycle.

## **2.10 Tips and tricks**

* Always state the V-1 rounds justification unprompted when coding Bellman-Ford, it is the single most commonly asked "why" question for this algorithm.

* If asked to compare with Dijkstra's, lead with "Bellman-Ford trades speed for correctness under negative weights", it is the cleanest one-sentence summary of the trade-off.

# **Part 3: Longest Common Subsequence (LCS)**

## **3.1 What problem it solves**

Given two strings (or sequences), find the length (or content) of their longest subsequence common to both. A subsequence preserves relative order but does not need to be contiguous, this is what distinguishes it from a substring. Real applications: the "diff" tool in version control (git diff) uses LCS-style logic to find what changed between two file versions, and it is used in DNA sequence alignment in bioinformatics.

## **3.2 How to teach it**

Analogy: comparing two people's travel itineraries by city visited, in order, but allowing gaps, if person A visited Dhaka, Paris, Tokyo, Rome and person B visited Dhaka, London, Tokyo, Berlin, Rome, both visited Dhaka, then Tokyo, then Rome in that relative order, even though the full itineraries differ, that shared ordered pattern (Dhaka, Tokyo, Rome) is their longest common subsequence.

* Define the state: dp\[i\]\[j\] \= length of the LCS of the first i characters of string A and the first j characters of string B.

* If A\[i-1\] \== B\[j-1\] (characters match), this character extends the LCS found without it: dp\[i\]\[j\] \= 1 \+ dp\[i-1\]\[j-1\].

* If they do not match, the LCS must come from ignoring one character from either string, whichever gives the longer result: dp\[i\]\[j\] \= max(dp\[i-1\]\[j\], dp\[i\]\[j-1\]).

## **3.3 C++ code**

| int lcs(string& A, string& B) {     int m \= A.size(), n \= B.size();     vector\<vector\<int\>\> dp(m \+ 1, vector\<int\>(n \+ 1, 0));       for (int i \= 1; i \<= m; i++) {         for (int j \= 1; j \<= n; j++) {             if (A\[i \- 1\] \== B\[j \- 1\]) {                 dp\[i\]\[j\] \= 1 \+ dp\[i \- 1\]\[j \- 1\];             } else {                 dp\[i\]\[j\] \= max(dp\[i \- 1\]\[j\], dp\[i\]\[j \- 1\]);             }         }     }     return dp\[m\]\[n\]; } |
| :---- |

## **3.4 Reconstructing the actual LCS string (common follow-up)**

| string lcsString(string& A, string& B, vector\<vector\<int\>\>& dp) {     int i \= A.size(), j \= B.size();     string result;     while (i \> 0 && j \> 0\) {         if (A\[i \- 1\] \== B\[j \- 1\]) {             result \+= A\[i \- 1\];             i--; j--;         } else if (dp\[i \- 1\]\[j\] \> dp\[i\]\[j \- 1\]) {             i--;         } else {             j--;         }     }     reverse(result.begin(), result.end());     return result; } |
| :---- |

## **3.5 Worked example**

*A \= "ABCBDAB", B \= "BDCABA"*

* Filling the DP table by comparing characters and applying the match/no-match rule gives a final LCS length of 4\.

* One valid longest common subsequence: "BCBA" or "BDAB" (multiple correct answers can exist at the same optimal length).

## **3.6 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(m \* n), m and n are the lengths of the two strings |
| Space complexity | O(m \* n) for the full table, O(min(m,n)) if only the length (not the actual subsequence) is needed, using rolling rows |

## **3.7 When to use it**

* Comparing two sequences where order matters but elements do not need to be contiguous: file diffing, DNA/protein sequence comparison, spell-check/autocorrect similarity scoring.

* As a building block for related problems: Longest Common Substring (contiguous, a small modification), Edit Distance (a closely related DP with insert/delete/replace operations), Shortest Common Supersequence.

## **3.8 When you cannot or should not use it**

* You actually need a contiguous match (substring, not subsequence), the recurrence is different, LCS's "skip a character" case does not apply to Longest Common Substring.

* Both sequences are extremely long (both in the hundreds of thousands or more), O(m\*n) becomes too slow, specialised algorithms (e.g. Hunt-Szymanski, suffix-based approaches) exist for very large inputs, generally beyond this course's scope.

## **3.9 Interview Q\&A**

**Q: Why does the recurrence take max(dp\[i-1\]\[j\], dp\[i\]\[j-1\]) when characters do not match, rather than dp\[i-1\]\[j-1\]?**

**A:** Because when the current characters differ, the current character of at least one string cannot be part of the LCS ending exactly at this position, so the best answer must come from ignoring one character from either string entirely, taking the better of the two resulting subproblems. Using dp\[i-1\]\[j-1\] directly would incorrectly skip both characters simultaneously, potentially missing a valid subsequence that only needed to skip one.

**Q: What is the difference between Longest Common Subsequence and Longest Common Substring?**

**A:** A subsequence preserves relative order but allows gaps (non-contiguous), while a substring must be contiguous. This changes the DP recurrence: substring's dp\[i\]\[j\] resets to 0 on a mismatch (since a substring match cannot have a gap), rather than taking the max of the two neighbouring subproblems.

**Q: How would you reduce the space complexity of LCS if you only need the length, not the actual subsequence?**

**A:** Since dp\[i\]\[j\] only depends on the current and previous row, you can keep just two 1D arrays (or one array updated carefully) instead of the full 2D table, reducing space from O(m\*n) to O(min(m,n)). This only works if you do not need to reconstruct the actual subsequence afterwards, since that requires backtracking through the full table.

## **3.10 Tips and tricks**

* Always draw the DP table grid on the whiteboard with both strings labelling the rows and columns, tracing a few cells by hand makes the match/no-match rule immediately clear.

* Mention Edit Distance and Longest Common Substring as closely related DP problems built on the same table structure, it shows breadth.

* Practice the backtracking reconstruction of the actual LCS string, not just its length, it is a very common follow-up request.

# **Part 4: Matrix Chain Multiplication (MCM)**

## **4.1 What problem it solves**

Given a chain of matrices to multiply together, where matrix multiplication is associative (the result is the same regardless of grouping) but the number of scalar multiplications performed depends heavily on the grouping (parenthesisation) chosen, find the grouping that minimises the total number of scalar multiplications. This does not compute the actual matrix product, only the optimal order in which to multiply.

## **4.2 How to teach it**

Analogy: multiplying three matrices A (10x30), B (30x5), C (5x60) can be grouped as (AB)C or A(BC), and the two groupings require a drastically different amount of arithmetic work, even though both produce the exact same final matrix. Computing (AB)C first costs 10\*30\*5 \+ 10\*5\*60 \= 1500 \+ 3000 \= 4500 scalar multiplications, while A(BC) costs 30\*5\*60 \+ 10\*30\*60 \= 9000 \+ 18000 \= 27000, nearly six times more work for the identical mathematical result. The goal is to find the cheapest grouping without brute-forcing every possible parenthesisation, which grows exponentially with the number of matrices.

* Represent the chain of matrices by their dimensions: matrix i has dimensions p\[i-1\] x p\[i\].

* Define the state: dp\[i\]\[j\] \= the minimum number of scalar multiplications needed to multiply matrices i through j.

* Try every possible split point k between i and j: cost \= dp\[i\]\[k\] \+ dp\[k+1\]\[j\] \+ p\[i-1\]\*p\[k\]\*p\[j\], the cost of solving the left part, the right part, and then multiplying the two resulting matrices together.

* Take the minimum cost over all possible split points k.

## **4.3 C++ code**

| int matrixChainOrder(vector\<int\>& p) {     // p has n+1 elements for n matrices: matrix i has dimensions p\[i-1\] x p\[i\]     int n \= p.size() \- 1;     vector\<vector\<int\>\> dp(n \+ 1, vector\<int\>(n \+ 1, 0));       // len \= chain length being solved, starting from length 2 upward     for (int len \= 2; len \<= n; len++) {         for (int i \= 1; i \<= n \- len \+ 1; i++) {             int j \= i \+ len \- 1;             dp\[i\]\[j\] \= INT\_MAX;             for (int k \= i; k \< j; k++) {                 int cost \= dp\[i\]\[k\] \+ dp\[k \+ 1\]\[j\] \+ p\[i \- 1\] \* p\[k\] \* p\[j\];                 dp\[i\]\[j\] \= min(dp\[i\]\[j\], cost);             }         }     }     return dp\[1\]\[n\]; } |
| :---- |

## **4.4 Worked example**

*Matrices with dimensions p \= \[10, 30, 5, 60\] (representing A:10x30, B:30x5, C:5x60)*

* dp\[1\]\[2\] (A\*B): only one way, cost \= 10\*30\*5 \= 1500

* dp\[2\]\[3\] (B\*C): only one way, cost \= 30\*5\*60 \= 9000

* dp\[1\]\[3\] (A\*B\*C): try k=1 \-\> (A)(BC): dp\[1\]\[1\]+dp\[2\]\[3\]+10\*30\*60 \= 0+9000+18000 \= 27000\. Try k=2 \-\> (AB)(C): dp\[1\]\[2\]+dp\[3\]\[3\]+10\*5\*60 \= 1500+0+3000 \= 4500\.

* dp\[1\]\[3\] \= min(27000, 4500\) \= 4500, confirming (AB)C is the optimal grouping.

## **4.5 Complexity**

| Property | Value |
| :---- | :---- |
| Time complexity | O(n^3), n \= number of matrices, three nested indices (length, i, split point k) |
| Space complexity | O(n^2), for the DP table |
| Naive brute force (for comparison) | O(4^n / n^1.5), exponential (Catalan number growth), infeasible beyond small n |

## **4.6 When to use it**

* Any problem that reduces to "optimally parenthesise/group a chain of operations with an associative but non-commutative-cost operation", matrix chain multiplication is the canonical teaching example, but the same interval-DP pattern (dp\[i\]\[j\] built from splitting at every k between i and j) appears in many other problems, such as optimal binary search tree construction and polygon triangulation.

## **4.7 When you cannot or should not use it**

* The number of matrices is very large and O(n^3) becomes too slow, in practice for genuine matrix chain multiplication n is rarely large enough for this to matter, but it is worth recognising for the general interval-DP pattern applied to bigger inputs.

* You actually need to perform the multiplication, not just find the optimal order, this algorithm only outputs the minimum cost/optimal split points, an additional step is needed to actually carry out the multiplications in that order.

## **4.8 Interview Q\&A**

**Q: Why is Matrix Chain Multiplication a Dynamic Programming problem and not solved with Divide and Conquer alone?**

**A:** Trying every possible split point on every subrange means the same sub-chains (like matrices 2 through 4\) get recomputed repeatedly across different larger split attempts, that overlap is exactly the signal for DP. Plain Divide and Conquer would redo this shared work exponentially many times, caching each dp\[i\]\[j\] the first time it is computed brings the complexity down from exponential to O(n^3).

**Q: Why does the DP table get filled by increasing chain length (len) rather than by row or column index?**

**A:** Because computing dp\[i\]\[j\] requires dp\[i\]\[k\] and dp\[k+1\]\[j\] for every split point k in between, both of which represent shorter sub-chains than \[i\]\[j\] itself. Filling by increasing length guarantees every shorter sub-chain needed has already been computed before it is required.

**Q: Does this algorithm actually multiply the matrices, or just decide the order?**

**A:** Only the order (the minimum cost and, if tracked, the optimal split points). Actually performing the multiplications afterwards, following the discovered optimal parenthesisation, is a separate step, typically done by recursively multiplying according to the recorded split points.

## **4.9 Tips and tricks**

* Memorise the cost formula cold: dp\[i\]\[j\] \= min over k of dp\[i\]\[k\] \+ dp\[k+1\]\[j\] \+ p\[i-1\]\*p\[k\]\*p\[j\], and be ready to explain each of the three terms in words (left cost, right cost, cost of the final multiplication joining them).

* Practice the len/i/j/k nested loop structure specifically, it is a distinct pattern (interval DP) from the simpler 1D or 2D DP seen in Knapsack and LCS, and is worth calling out explicitly as a different DP shape.

* If asked for a real-world motivation, mention compiler optimisation of matrix expressions and computer graphics transformation chains, both benefit from this exact optimisation.

# **Part 5: Summary of Dynamic Programming**

## **5.1 General steps to solve any DP problem**

* 1\. Identify that the problem has overlapping subproblems (try the naive recursive solution first, and check if the same subproblem parameters recur).

* 2\. Define the state precisely: what does dp\[...\] represent, in one clear sentence.

* 3\. Write the recurrence relation: how does dp\[state\] relate to smaller/simpler states.

* 4\. Identify the base case(s).

* 5\. Decide the fill order (bottom-up) or add memoisation (top-down), and implement.

* 6\. State time and space complexity, and consider whether space can be optimised (rolling array, as shown for Knapsack).

## **5.2 Comparison table of this course's Dynamic Programming algorithms**

| Algorithm | Problem solved | State definition | Time | Space |
| :---- | :---- | :---- | :---- | :---- |
| 0-1 Knapsack | Max value under weight capacity, indivisible items | dp\[i\]\[w\] \= best value using first i items, capacity w | O(nW) | O(nW) / O(W) optimised |
| Bellman-Ford | Single-source shortest path, handles negative weights | dist\[v\] \= shortest known distance to v, refined over rounds | O(VE) | O(V) |
| LCS | Longest common ordered subsequence of two strings | dp\[i\]\[j\] \= LCS length of first i and first j characters | O(mn) | O(mn) / O(min(m,n)) optimised |
| MCM | Cheapest order to multiply a chain of matrices | dp\[i\]\[j\] \= min cost to multiply matrices i..j | O(n^3) | O(n^2) |

## **5.3 Dynamic Programming vs Greedy vs Divide and Conquer**

| Aspect | Divide and Conquer | Greedy | Dynamic Programming |
| :---- | :---- | :---- | :---- |
| Subproblems | Independent, do not overlap | N/A, one pass of local choices | Overlapping, results are cached/reused |
| Revisits earlier choices? | N/A | Never | Effectively yes, explores multiple choices via subproblem table |
| Requires proof of correctness? | Usually straightforward | Yes, greedy-choice property must be proven | Yes, optimal substructure must be proven |
| Typical complexity | O(n log n) common | O(n log n) common, often fastest | Polynomial but often higher (O(n^2), O(n^3), O(nW)) |
| Example from this course | Merge Sort, Quick Sort | Fractional Knapsack, Dijkstra's | 0-1 Knapsack, Bellman-Ford, LCS, MCM |

## **5.4 Frequently repeated cross-cutting questions**

**Q: Give one example each, from this course, of a problem where Greedy works and where it fails, and explain the difference.**

**A:** Fractional Knapsack: Greedy by value/weight ratio works because taking a fraction of the best-ratio item never wastes capacity, an exchange argument confirms optimality. 0/1 Knapsack: Greedy by the same ratio fails because an item cannot be partially taken, so committing to a high-ratio item early can waste capacity that a different combination would have used better, this is exactly why 0/1 Knapsack needs the fuller exploration that Dynamic Programming provides.

**Q: As a UTA, how would you help a student decide whether a new problem needs Greedy or DP?**

**A:** Have them attempt to write the greedy rule and then actively search for a counterexample by hand, small custom inputs, exactly like the 0/1 Knapsack (60,10)(100,20)(120,30) case. If a counterexample is found, that is concrete proof DP is needed, if they cannot find one after genuine effort, it is a hint (not proof) that Greedy may work, but they should still be encouraged to reason about why, using an exchange argument, rather than trusting the absence of a found counterexample alone.

## **5.5 Final checklist before the interview**

* Can you code 0-1 Knapsack (both 2D and the space-optimised 1D version) from memory, and explain why the inner loop direction matters?

* Can you code Bellman-Ford and explain, precisely, why V-1 rounds are sufficient and how the extra round detects a negative cycle?

* Can you code LCS and reconstruct the actual subsequence, not just its length?

* Can you write the MCM cost recurrence from memory and explain each of its three terms?

* Can you state, for any DP problem, its state definition and recurrence relation in one or two sentences each, before writing any code?

* Can you clearly explain, using the 0/1 Knapsack example, exactly why Greedy fails where DP succeeds?