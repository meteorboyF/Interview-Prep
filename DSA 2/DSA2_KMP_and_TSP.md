  
**DSA 2**

**String Matching & TSP**

*UTA Interview Preparation Notes*

Covers Week 10: Knuth-Morris-Pratt (KMP) Algorithm, Travelling Salesman Problem (TSP)

# **Part 1: Knuth-Morris-Pratt (KMP) Algorithm**

## **1.1 What problem it solves**

The string matching (pattern searching) problem: given a text of length n and a pattern of length m, find all positions where the pattern occurs in the text. KMP does this in O(n \+ m) time, avoiding the wasted re-comparisons of the naive O(n\*m) approach.

## **1.2 The naive approach and why it is slow**

The naive method tries to match the pattern starting at every position in the text. On a mismatch, it slides the pattern forward by just one position and restarts the comparison from the beginning of the pattern, throwing away everything it already learned. In the worst case (for example text "AAAA...A" and pattern "AAA...B"), this re-compares the same characters repeatedly, giving O(n\*m).

| // Naive: O(n\*m) worst case void naiveSearch(string text, string pattern) {     int n \= text.size(), m \= pattern.size();     for (int i \= 0; i \<= n \- m; i++) {         int j \= 0;         while (j \< m && text\[i \+ j\] \== pattern\[j\]) j++;         if (j \== m) cout \<\< "Found at index " \<\< i \<\< endl;         // on mismatch: slide by 1, discard all progress     } } |
| :---- |

## **1.3 The key insight of KMP**

How to teach it: when a mismatch happens after already matching several characters, KMP uses the fact that it already knows what those matched characters were. If part of the matched portion is also a prefix of the pattern, the pattern can be shifted forward intelligently, skipping positions that provably cannot match, instead of sliding by just one and rechecking. The information needed to do this is precomputed once into an array called the LPS (Longest Proper Prefix which is also Suffix) array, also called the failure function.

* A proper prefix is a prefix that is not the whole string. A proper suffix is a suffix that is not the whole string.

* LPS\[i\] \= the length of the longest proper prefix of pattern\[0..i\] that is also a suffix of pattern\[0..i\].

* When a mismatch occurs at pattern position j, instead of restarting from 0, KMP jumps j back to LPS\[j-1\], reusing the already-matched prefix.

## **1.4 Building the LPS array**

*Worked example, pattern \= "ABABCABAB":*

| Index:   0  1  2  3  4  5  6  7  8 Char:    A  B  A  B  C  A  B  A  B LPS:     0  0  1  2  0  1  2  3  4 |
| :---- |

* LPS\[0\] \= 0 always (a single character has no proper prefix).

* At index 2 ('A'): prefix "A" matches suffix "A", so LPS \= 1\.

* At index 3 ('B'): prefix "AB" matches suffix "AB", so LPS \= 2\.

* At index 4 ('C'): no prefix-suffix match, LPS \= 0\.

* At index 8 ('B'): prefix "ABAB" matches suffix "ABAB", so LPS \= 4\.

## **1.5 C++ code**

| vector\<int\> buildLPS(string& pattern) {     int m \= pattern.size();     vector\<int\> lps(m, 0);     int len \= 0;  // length of the previous longest prefix-suffix     int i \= 1;       while (i \< m) {         if (pattern\[i\] \== pattern\[len\]) {             len++;             lps\[i\] \= len;             i++;         } else if (len \!= 0\) {             len \= lps\[len \- 1\];  // fall back, do NOT advance i         } else {             lps\[i\] \= 0;             i++;         }     }     return lps; }   void KMPSearch(string& text, string& pattern) {     int n \= text.size(), m \= pattern.size();     vector\<int\> lps \= buildLPS(pattern);     int i \= 0, j \= 0;  // i indexes text, j indexes pattern       while (i \< n) {         if (text\[i\] \== pattern\[j\]) {             i++; j++;             if (j \== m) {                 cout \<\< "Found at index " \<\< (i \- j) \<\< endl;                 j \= lps\[j \- 1\];  // continue searching for more matches             }         } else if (j \!= 0\) {             j \= lps\[j \- 1\];  // reuse prefix info, do NOT reset i         } else {             i++;         }     } } |
| :---- |

## **1.6 Complexity**

| Property | Value |
| :---- | :---- |
| Building the LPS array | O(m), m \= pattern length |
| Searching the text | O(n), n \= text length |
| Total time complexity | O(n \+ m) |
| Space complexity | O(m), for the LPS array |
| Naive approach (for comparison) | O(n \* m) worst case |

*The crucial point: in KMP the text index i never moves backward, each text character is examined a bounded number of times, which is what guarantees the linear O(n) search phase.*

## **1.7 When to use it**

* Searching for a single pattern in a large text, especially when the pattern has repeated sub-structures (where the naive approach wastes the most work).

* Streaming or single-pass scenarios: KMP never needs to move backward in the text, so it works even when the text can only be read forward once.

* When a guaranteed linear worst case is required, unlike some hashing-based methods (Rabin-Karp) whose worst case can degrade on hash collisions.

## **1.8 When you cannot or should not use it**

* Searching for many different patterns at once, KMP handles one pattern at a time; the Aho-Corasick algorithm (a generalisation of KMP to multiple patterns) is better suited, though it is beyond this course's scope.

* Approximate/fuzzy matching (allowing typos or small differences), KMP only finds exact matches; edit-distance-based DP (related to LCS from Weeks 8-9) is needed for approximate matching.

## **1.9 Interview Q\&A**

**Q: What is the core idea that makes KMP faster than the naive approach?**

**A:** When a mismatch occurs after matching several characters, KMP reuses the knowledge of what those matched characters were, rather than discarding it. If a matched portion is also a prefix of the pattern, it shifts the pattern forward to align that prefix, skipping positions that provably cannot match, so it never re-examines already-matched text characters.

**Q: What does the LPS array store, and why is it needed?**

**A:** LPS\[i\] stores the length of the longest proper prefix of the pattern up to index i that is also a suffix of it. It tells KMP, on a mismatch at pattern position j, how far back to jump (to LPS\[j-1\]) so it can reuse the already-matched prefix instead of restarting from the pattern's beginning.

**Q: Why is the total time complexity O(n \+ m) and not O(n \* m)?**

**A:** The LPS array is built once in O(m). During the search, the text index i never moves backward, and although the pattern index j can fall back, the total number of fallback steps across the whole run is bounded by the number of forward steps, so the search phase is O(n). Together this gives O(n \+ m).

**Q: In the search loop, why do we not reset the text index i on a mismatch?**

**A:** Because the LPS array already tells us how much of the pattern's prefix is still validly matched at the current text position, so there is no need to re-examine earlier text characters. Only the pattern index j is adjusted (to lps\[j-1\]), while i stays put, this is exactly what avoids the naive approach's repeated backward re-scanning.

## **1.10 Tips and tricks**

* Building the LPS array correctly is the hard part, practice the len \= lps\[len-1\] fallback line specifically, it is where most people make mistakes.

* Emphasise unprompted that 'i never moves backward in the text', it is the single sentence that best demonstrates you understand why KMP is linear.

* If asked about alternatives, name Rabin-Karp (hashing-based) and Aho-Corasick (multiple patterns) to show breadth, but note KMP's advantage is a guaranteed linear worst case for a single pattern.

# **Part 2: Travelling Salesman Problem (TSP)**

## **2.1 What problem it solves**

Given a set of cities and the distances between every pair, find the shortest possible route that visits every city exactly once and returns to the starting city. This is one of the most famous problems in computer science, and importantly, it is a known NP-hard problem, meaning no efficient (polynomial-time) exact algorithm is known to exist.

## **2.2 How to teach it**

Analogy: a delivery driver who must visit a list of addresses and return to the depot, wanting the route with the least total driving distance. It sounds simple, but the number of possible routes explodes factorially as cities are added, making brute force quickly impossible even for a modest number of cities.

* A 'tour' is a route that starts at a city, visits every other city exactly once, and returns to the start (this kind of cycle is called a Hamiltonian cycle).

* The goal is the minimum-total-weight Hamiltonian cycle.

## **2.3 Why TSP is hard: the size of the search space**

For n cities, the number of possible distinct tours is (n-1)\!/2. This factorial growth is the crux of why TSP is intractable to brute force:

| Number of cities | Approximate number of possible tours |
| :---- | :---- |
| 5 | 12 |
| 10 | 181,440 |
| 15 | \~43 billion |
| 20 | \~60,000,000,000,000,000 (6 x 10^16) |

*Even at 20 cities, checking every tour is already infeasible, and real-world logistics problems can involve hundreds or thousands of locations.*

## **2.4 Approach 1: Brute Force (exact, O(n\!))**

Generate every possible permutation of cities, compute each tour's total distance, and keep the minimum. Guaranteed to find the true optimum, but only usable for very small n (roughly up to 10-12 cities).

| int tspBruteForce(vector\<vector\<int\>\>& dist, int n) {     vector\<int\> cities;     for (int i \= 1; i \< n; i++) cities.push\_back(i);  // fix city 0 as start       int minCost \= INT\_MAX;     do {         int cost \= 0, current \= 0;         for (int next : cities) {             cost \+= dist\[current\]\[next\];             current \= next;         }         cost \+= dist\[current\]\[0\];  // return to start         minCost \= min(minCost, cost);     } while (next\_permutation(cities.begin(), cities.end()));       return minCost; } |
| :---- |

## **2.5 Approach 2: Dynamic Programming (Held-Karp, O(n^2 \* 2^n))**

This connects directly to the Dynamic Programming topic from Weeks 8-9. The Held-Karp algorithm uses a bitmask to represent the set of already-visited cities as the DP state, dp\[mask\]\[i\] \= the minimum cost to start at city 0, visit exactly the set of cities in 'mask', and end at city i. It is still exponential, but O(n^2 \* 2^n) is dramatically better than O(n\!), pushing the feasible limit from \~12 cities up to roughly \~20 cities.

| int tspDP(vector\<vector\<int\>\>& dist, int n) {     int FULL \= (1 \<\< n) \- 1;     vector\<vector\<int\>\> dp(1 \<\< n, vector\<int\>(n, INT\_MAX));     dp\[1\]\[0\] \= 0;  // start at city 0, only city 0 visited (bit 0 set)       for (int mask \= 1; mask \<= FULL; mask++) {         for (int u \= 0; u \< n; u++) {             if (\!(mask & (1 \<\< u)) || dp\[mask\]\[u\] \== INT\_MAX) continue;             for (int v \= 0; v \< n; v++) {                 if (mask & (1 \<\< v)) continue;  // v already visited                 int nextMask \= mask | (1 \<\< v);                 int newCost \= dp\[mask\]\[u\] \+ dist\[u\]\[v\];                 dp\[nextMask\]\[v\] \= min(dp\[nextMask\]\[v\], newCost);             }         }     }       int answer \= INT\_MAX;     for (int u \= 1; u \< n; u++) {         if (dp\[FULL\]\[u\] \!= INT\_MAX)             answer \= min(answer, dp\[FULL\]\[u\] \+ dist\[u\]\[0\]);     }     return answer; } |
| :---- |

## **2.6 Approach 3: Approximation and Heuristics (for large n)**

Since exact methods fail beyond \~20 cities, real-world TSP is solved with approximation algorithms and heuristics that find a good (not necessarily optimal) tour quickly.

* Nearest Neighbour heuristic: always travel to the closest unvisited city next. Very fast (O(n^2)) and simple, but can produce tours noticeably worse than optimal, a greedy approach that does not guarantee optimality (connecting back to the limits of greedy from Weeks 5-7).

* Christofides algorithm: for metric TSP (distances satisfy the triangle inequality), guarantees a tour at most 1.5 times the optimal length, using minimum spanning trees (Prim's/Kruskal's from Weeks 5-7) and matching as building blocks.

* 2-opt / local search: repeatedly improve a tour by swapping pairs of edges to remove crossings, until no improvement is found.

## **2.7 Complexity comparison**

| Approach | Time complexity | Optimal? | Practical up to |
| :---- | :---- | :---- | :---- |
| Brute force | O(n\!) | Yes, exact | \~10-12 cities |
| Held-Karp (DP with bitmask) | O(n^2 \* 2^n) | Yes, exact | \~18-20 cities |
| Nearest Neighbour heuristic | O(n^2) | No, approximate | Very large n |
| Christofides (metric TSP) | Polynomial | Within 1.5x of optimal | Large n |

## **2.8 When to use each**

* Very few cities (up to \~12) and you need the exact optimum: brute force is acceptable.

* Small-to-moderate cities (up to \~20) needing the exact optimum: Held-Karp DP.

* Many cities where a good-enough answer quickly is acceptable (essentially all real logistics): heuristics/approximation like Nearest Neighbour, 2-opt, or Christofides.

## **2.9 When exact methods cannot be used**

* Beyond roughly 20 cities, both brute force and Held-Karp become computationally infeasible, there is simply no known efficient exact algorithm, which is the practical meaning of TSP being NP-hard.

## **2.10 Interview Q\&A**

**Q: What does it mean that TSP is NP-hard?**

**A:** It means no polynomial-time algorithm is known to solve it exactly, and it is at least as hard as the hardest problems in NP. In practice this means that as the number of cities grows, the time to find a guaranteed optimal solution grows faster than any polynomial, so exact solutions become infeasible beyond small inputs.

**Q: How does the Held-Karp DP improve over brute force, and why is it still exponential?**

**A:** Brute force checks all O(n\!) permutations. Held-Karp uses a bitmask DP state dp\[visited set\]\[current city\], which reuses overlapping subproblems (the same visited-set-and-endpoint combination is reached by many permutations), bringing it down to O(n^2 \* 2^n). It is still exponential because the number of possible visited-set subsets is 2^n, which cannot be avoided, but it is vastly better than n\! in practice.

**Q: If you had 1000 cities to route, what approach would you actually use?**

**A:** An exact method is out of the question at that scale, so a heuristic or approximation: start with a fast constructive heuristic like Nearest Neighbour, then improve it with local search such as 2-opt, or use Christofides if the distances satisfy the triangle inequality and a provable quality bound is required. The goal shifts from 'the optimal tour' to 'a good tour, fast'.

**Q: How does the Nearest Neighbour heuristic relate to greedy algorithms from earlier in the course?**

**A:** It is a greedy algorithm: at each step it makes the locally optimal choice (go to the nearest unvisited city) without reconsidering. As with 0/1 Knapsack, this greedy choice does not guarantee a globally optimal result, a locally cheap early move can force expensive detours later, which is exactly why TSP needs approximation guarantees or exact DP when optimality matters.

## **2.11 Tips and tricks**

* Always state upfront that TSP is NP-hard, it frames the entire discussion and signals you understand why we resort to DP and heuristics.

* Explicitly connect the pieces to earlier topics: Held-Karp is bitmask DP (Weeks 8-9), Nearest Neighbour is greedy (Weeks 5-7), and Christofides builds on MST algorithms (Weeks 5-7), showing this synthesis is exactly what an interviewer wants.

* Know the rough feasibility cutoffs (brute force \~12, Held-Karp \~20), being able to say 'which method for how many cities' concretely is a strong signal.

# **Part 3: General Notes**

## **How these two topics connect to the rest of the course**

* KMP is a clever use of precomputation (the LPS array) to avoid redundant work, the same underlying philosophy as Dynamic Programming's caching, applied to string matching.

* TSP is a capstone that ties together three earlier paradigms: Dynamic Programming (Held-Karp), Greedy (Nearest Neighbour), and Minimum Spanning Trees (Christofides), while introducing the crucial concept of NP-hardness and why approximation exists.

## **Frequently repeated cross-cutting questions**

**Q: What is the difference between a problem being 'hard to solve' like the O(n^2) sorts, and being 'NP-hard' like TSP?**

**A:** The O(n^2) sorts are still polynomial-time, they scale predictably and are solvable exactly even for large inputs, just not as fast as O(n log n) alternatives. NP-hard problems like TSP have no known polynomial-time exact algorithm at all, so their exact solution time grows faster than any polynomial, making large instances fundamentally infeasible to solve exactly, not merely slow.

**Q: As a UTA, how would you explain why KMP never moves backward in the text to a confused student?**

**A:** Walk them through a naive search on a small example with a repeating pattern, marking every character comparison, then do the same with KMP, showing that the naive version re-checks text characters it already compared while KMP, thanks to the LPS array, never does. Seeing the re-checks physically crossed out versus never happening makes the linear-time advantage concrete.

## **Final checklist before the interview**

* Can you explain the KMP core idea (reuse matched-prefix information via the LPS array) in two sentences?

* Can you build the LPS array by hand for a small pattern, and code buildLPS from memory, including the fallback line?

* Can you state why KMP is O(n \+ m) and specifically why the text index never moves backward?

* Can you explain what NP-hard means and why TSP's search space grows factorially?

* Can you name and rank the three TSP approaches (brute force, Held-Karp DP, heuristics) with their complexities and feasibility limits?

* Can you connect TSP's methods back to DP, Greedy, and MST from earlier in the course?