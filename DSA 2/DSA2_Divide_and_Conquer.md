  
**DSA 2**

**Divide and Conquer: Merge Sort, Quick Sort, Maximum Subarray**

*UTA Interview Preparation Notes*

Covers Week 3: The Divide and Conquer Technique, Merge Sort, Quick Sort, Maximum Subarray Problem

# **Part 0: The Divide and Conquer Technique**

Divide and Conquer is a general problem-solving paradigm, not one specific algorithm. It solves a problem by breaking it into smaller subproblems of the same type, solving each independently (usually recursively), and then combining their results into the final answer.

## **How to teach it**

Use the analogy of sorting a huge pile of exam scripts: instead of sorting all 1000 scripts alone, you split the pile into two smaller piles, hand each to an assistant who does the same splitting, and eventually you are just merging small, already-sorted piles back together. The key insight is that the sub-piles are solved exactly the same way as the original problem, just smaller.

* Divide: split the problem into smaller subproblems of the same type.

* Conquer: solve each subproblem, typically by recursing until a subproblem is trivially small (the base case).

* Combine: merge the subproblem solutions into the solution for the original problem.

## **What problem this technique solves**

It solves problems that have optimal substructure, meaning the optimal solution to the whole problem can be constructed directly from optimal solutions to its subproblems, and where the subproblems do not overlap significantly (contrast this with Dynamic Programming, covered later in the course, which is specifically for problems where subproblems do overlap).

## **When to use it**

* The problem can naturally be split into independent subproblems of smaller size.

* Combining the subproblem solutions is cheap relative to solving them.

* You want a provably better asymptotic complexity than the naive approach, classic example: sorting in O(n log n) instead of O(n^2).

## **When you cannot or should not use it**

* Subproblems overlap heavily (the same subproblem gets solved repeatedly), naive divide and conquer would redo the same work many times, this is exactly the signal to use Dynamic Programming instead.

* The recursion depth would be excessive for the input size, risking stack overflow, or the combine step is itself expensive enough to erase the benefit of splitting.

# **Part 1: Merge Sort**

## **1.1 What problem it solves**

Merge sort solves the general sorting problem while guaranteeing O(n log n) time in every case (best, average, and worst), unlike the O(n^2) sorts from DSA 1 (selection, bubble, insertion). It solves this by exploiting the fact that merging two already-sorted lists into one sorted list is a fast, linear operation.

## **1.2 How to teach it**

Analogy: two students each sort their own half of a deck of cards, then you merge the two sorted halves by repeatedly comparing the front cards of each pile and taking the smaller one, exactly the way you would merge two sorted piles by hand.

* Divide: split the array into two halves at the midpoint.

* Conquer: recursively sort each half (down to the base case of a single element, which is trivially sorted).

* Combine: merge the two sorted halves back into one sorted array.

## **1.3 C++ code**

| void merge(vector\<int\>& arr, int left, int mid, int right) {     vector\<int\> temp;     int i \= left, j \= mid \+ 1;       while (i \<= mid && j \<= right) {         if (arr\[i\] \<= arr\[j\]) temp.push\_back(arr\[i++\]);         else temp.push\_back(arr\[j++\]);     }     while (i \<= mid) temp.push\_back(arr\[i++\]);     while (j \<= right) temp.push\_back(arr\[j++\]);       for (int k \= 0; k \< (int)temp.size(); k++)         arr\[left \+ k\] \= temp\[k\]; }   void mergeSort(vector\<int\>& arr, int left, int right) {     if (left \>= right) return;  // base case: 0 or 1 element     int mid \= left \+ (right \- left) / 2;     mergeSort(arr, left, mid);     mergeSort(arr, mid \+ 1, right);     merge(arr, left, mid, right); }   // call: mergeSort(arr, 0, arr.size() \- 1); |
| :---- |

## **1.4 Worked example**

*Array: \[38, 27, 43, 10\]*

* Divide: \[38, 27\] and \[43, 10\]

* Divide further: \[38\], \[27\], \[43\], \[10\] (base cases, each trivially sorted)

* Merge pairs: \[38,27\] \-\> \[27,38\], and \[43,10\] \-\> \[10,43\]

* Merge final: \[27,38\] and \[10,43\] \-\> \[10, 27, 38, 43\]

## **1.5 Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(n log n) |
| Average case | O(n log n) |
| Worst case | O(n log n), never degrades |
| Space | O(n), needs auxiliary arrays for merging |
| Stable? | Yes, if coded carefully (use \<= not \< when comparing during merge) |
| In-place? | No, standard implementation needs O(n) extra space |

## **1.6 When to use it**

* You need a guaranteed O(n log n) worst case, no risk of degrading to O(n^2) regardless of input order (unlike quicksort).

* You need a stable sort, for example sorting records by a secondary key after already sorting by a primary key.

* Sorting linked lists, merge sort adapts well since it does not need random access, unlike quicksort's partitioning.

* External sorting (sorting data too large to fit in memory), since merge sort naturally processes data in sequential chunks.

## **1.7 When you cannot or should not use it**

* Memory is tightly constrained, the O(n) auxiliary space requirement can be a real problem for very large datasets, unlike quicksort's O(log n) auxiliary space.

* Average-case performance matters more than worst-case guarantees, and cache performance matters, quicksort is often faster in practice on arrays due to better cache locality and lower constant factors.

## **1.8 Interview Q\&A**

**Q: Why is merge sort's time complexity O(n log n)?**

**A:** The array is divided in half at each level, giving log n levels of recursion, and at each level, the merge step across all subarrays does a total of O(n) work, since merging is linear in the combined size of the pieces being merged. Multiplying the O(n) work per level by the log n levels gives O(n log n).

**Q: Why does merge sort need O(n) extra space?**

**A:** The merge step needs a temporary array to hold the merged result while comparing elements from the two halves, you cannot merge two sorted halves of the same array back into itself in place without overwriting data you still need to read.

**Q: Is merge sort stable, and why does that matter?**

**A:** Yes, if the merge step takes from the left half whenever elements are equal (using \<= rather than \<), equal elements retain their original relative order. This matters when sorting by one field after already sorting by another, and you want ties in the new sort to preserve the old order.

## **1.9 Tips and tricks**

* Always mention the O(n) space trade-off unprompted, it is the most common follow-up question after coding merge sort.

* If asked to sort a linked list, merge sort is usually the expected answer, since it does not rely on random access the way quicksort's partitioning does.

# **Part 2: Quick Sort**

## **2.1 What problem it solves**

Quick sort also solves general sorting in O(n log n) average time, using in-place partitioning around a chosen pivot instead of merging, which makes it typically faster in practice than merge sort due to better cache locality and no extra array allocation, at the cost of a worst-case O(n^2) that can occur on adversarial input.

## **2.2 How to teach it**

Analogy: picking one student (the pivot) and asking everyone shorter to stand to their left and everyone taller to stand to their right. Once that is done, the pivot is guaranteed to be in its final sorted position, and you repeat the same process independently on the left group and the right group.

* Choose a pivot element from the array (strategy varies, see below).

* Partition: rearrange the array so all elements less than the pivot come before it, and all elements greater come after it. The pivot is now in its correct final sorted position.

* Recursively apply the same process to the subarray left of the pivot, and the subarray right of the pivot.

## **2.3 C++ code (Lomuto partition scheme)**

| int partition(vector\<int\>& arr, int low, int high) {     int pivot \= arr\[high\];  // choosing the last element as pivot     int i \= low \- 1;       for (int j \= low; j \< high; j++) {         if (arr\[j\] \< pivot) {             i++;             swap(arr\[i\], arr\[j\]);         }     }     swap(arr\[i \+ 1\], arr\[high\]);     return i \+ 1;  // final index of the pivot }   void quickSort(vector\<int\>& arr, int low, int high) {     if (low \>= high) return;  // base case: 0 or 1 element     int pivotIndex \= partition(arr, low, high);     quickSort(arr, low, pivotIndex \- 1);     quickSort(arr, pivotIndex \+ 1, high); }   // call: quickSort(arr, 0, arr.size() \- 1); |
| :---- |

## **2.4 Worked example**

*Array: \[10, 80, 30, 90, 40\], pivot \= last element \= 40*

* Scan and compare each element to pivot 40: 10 \< 40 (swap into position), 80 not \< 40, 30 \< 40 (swap into position), 90 not \< 40

* After the scan: \[10, 30, 80, 90, 40\], swap pivot into place \-\> \[10, 30, 40, 90, 80\]

* Pivot 40 is now at index 2, its correct final position. Recurse on \[10,30\] (left) and \[90,80\] (right) independently.

## **2.5 Pivot selection strategies**

* Always first or last element: simplest to code, but worst case O(n^2) triggers on already-sorted or reverse-sorted input, a realistic scenario, not just an adversarial one.

* Random element: makes the worst case extremely unlikely regardless of input pattern, a common practical improvement.

* Median-of-three (first, middle, last): approximates a good pivot cheaply and avoids the sorted-input worst case without full randomisation.

## **2.6 Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(n log n), pivot roughly splits array in half each time |
| Average case | O(n log n) |
| Worst case | O(n^2), occurs when the pivot is always the smallest or largest element (e.g. sorted input with last-element pivot) |
| Space | O(log n) average, for the recursion stack (in-place partitioning) |
| Stable? | No, the partitioning step can reorder equal elements |
| In-place? | Yes |

## **2.7 When to use it**

* Sorting large arrays in memory where average-case speed and low memory overhead matter more than worst-case guarantees.

* You control or can randomise pivot selection, removing realistic risk of hitting the worst case.

* This is why most language standard library sort functions for arrays are quicksort-based (often introsort, quicksort with a fallback to heapsort to bound the worst case).

## **2.8 When you cannot or should not use it**

* You need a guaranteed worst-case bound, for example in real-time systems where an O(n^2) spike is unacceptable, merge sort or heapsort is safer.

* You need stability (equal elements must retain relative order), plain quicksort does not provide this.

* Sorting a linked list, quicksort's partitioning relies on efficient random access and in-place swapping, which linked lists do not provide well.

## **2.9 Interview Q\&A**

**Q: Why does quicksort have a worst case of O(n^2), and when does it happen?**

**A:** It happens when the chosen pivot is repeatedly the smallest or largest remaining element, causing each partition step to split the array into a piece of size 0 and a piece of size n-1 instead of two roughly equal halves. This gives n levels of recursion each doing O(n) work, totalling O(n^2). It commonly occurs with already sorted or reverse sorted input when always picking the first or last element as pivot.

**Q: How would you reduce the chance of hitting quicksort's worst case in practice?**

**A:** Use randomised pivot selection (swap a random element into the pivot position before partitioning) or median-of-three pivot selection, both make the worst-case pattern extremely unlikely to occur on real or adversarial input.

**Q: Why is quicksort often faster in practice than merge sort, despite having a worse worst case?**

**A:** Quicksort sorts in place with better cache locality (it works within contiguous sections of the same array, no separate temporary array), and has smaller constant factors in its inner loop, whereas merge sort's extra array allocation and copying add overhead even though its asymptotic complexity is technically more consistent.

**Q: Is quicksort stable? Can it be made stable?**

**A:** Not stable by default, the partition step can swap equal elements past each other. It can be made stable, but only by using extra space (similar to merge sort), which removes its main practical advantage of being in-place.

## **2.10 Tips and tricks**

* If asked to code quicksort, mention the worst-case risk and pivot strategy unprompted, it shows awareness beyond just reciting the algorithm.

* Know both partition schemes exist (Lomuto, shown above, is simpler to code; Hoare's is more efficient but trickier to reason about), Lomuto is sufficient to have ready by memory for an interview.

# **Part 3: Maximum Subarray Problem**

## **3.1 What problem it solves**

Given an array of integers (which may include negative numbers), find the contiguous subarray with the largest possible sum. This models real problems like finding the best-performing contiguous period in a stream of daily profit/loss values.

## **3.2 How to teach it**

Analogy: a trader's daily profit/loss log. You want to find the best unbroken stretch of days to have been invested, some days lose money, but a losing day might still be worth passing through if the days after it more than make up for it.

## **3.3 Approach 1: Divide and Conquer (O(n log n))**

Since this week's topic is Divide and Conquer, this is the expected primary approach: split the array in half, and observe that the maximum subarray either lies entirely in the left half, entirely in the right half, or crosses the midpoint. Solve the first two recursively, and handle the crossing case directly by expanding outward from the midpoint in both directions.

| int maxCrossingSum(vector\<int\>& arr, int low, int mid, int high) {     int leftSum \= INT\_MIN, sum \= 0;     for (int i \= mid; i \>= low; i--) {         sum \+= arr\[i\];         leftSum \= max(leftSum, sum);     }     int rightSum \= INT\_MIN; sum \= 0;     for (int i \= mid \+ 1; i \<= high; i++) {         sum \+= arr\[i\];         rightSum \= max(rightSum, sum);     }     return leftSum \+ rightSum; }   int maxSubArrayDC(vector\<int\>& arr, int low, int high) {     if (low \== high) return arr\[low\];  // base case: single element     int mid \= low \+ (high \- low) / 2;     int leftMax \= maxSubArrayDC(arr, low, mid);     int rightMax \= maxSubArrayDC(arr, mid \+ 1, high);     int crossMax \= maxCrossingSum(arr, low, mid, high);     return max({leftMax, rightMax, crossMax}); }   // call: maxSubArrayDC(arr, 0, arr.size() \- 1); |
| :---- |

## **3.4 Approach 2: Kadane's Algorithm (O(n), the optimal solution)**

How to teach it: scan the array once, keeping a running sum of the "best subarray ending exactly here." At each element, decide: is it better to extend the previous subarray by including this element, or to abandon everything before it and restart fresh from this element? Whichever is larger becomes the new running sum, and you track the best running sum seen so far.

| int maxSubArrayKadane(vector\<int\>& arr) {     int maxSoFar \= arr\[0\];     int currentMax \= arr\[0\];       for (int i \= 1; i \< (int)arr.size(); i++) {         currentMax \= max(arr\[i\], currentMax \+ arr\[i\]);         maxSoFar \= max(maxSoFar, currentMax);     }     return maxSoFar; } |
| :---- |

## **3.5 Worked example (Kadane's)**

*Array: \[-2, 1, \-3, 4, \-1, 2, 1, \-5, 4\]*

* i=0: currentMax=-2, maxSoFar=-2

* i=1: currentMax=max(1,-2+1)=1, maxSoFar=1

* i=2: currentMax=max(-3,1-3)=-2, maxSoFar=1

* i=3: currentMax=max(4,-2+4)=4, maxSoFar=4

* i=4: currentMax=max(-1,4-1)=3, maxSoFar=4

* i=5: currentMax=max(2,3+2)=5, maxSoFar=5

* i=6: currentMax=max(1,5+1)=6, maxSoFar=6

* i=7: currentMax=max(-5,6-5)=1, maxSoFar=6

* i=8: currentMax=max(4,1+4)=5, maxSoFar=6

Answer: 6 (the subarray \[4, \-1, 2, 1\])

## **3.6 Complexity and comparison of the two approaches**

| Approach | Time | Space | When to use |
| :---- | :---- | :---- | :---- |
| Divide and Conquer | O(n log n) | O(log n), recursion stack | When the topic/interview specifically asks for a D\&C approach, or as a stepping stone to explain the technique |
| Kadane's Algorithm | O(n) | O(1) | The actual optimal, practical solution, always prefer this unless D\&C is explicitly requested |

## **3.7 When to use each**

* In a real interview with no constraint on method: always mention Kadane's algorithm as the optimal O(n) answer.

* If the interviewer specifically asks you to demonstrate the Divide and Conquer paradigm (as this week's syllabus topic does), present the D\&C version, but mention Kadane's afterwards to show you know the truly optimal approach as well.

## **3.8 Interview Q\&A**

**Q: Why does Kadane's algorithm work, in one sentence?**

**A:** At every position, a negative running sum can never help a future subarray, so it is always at least as good to restart the subarray from the current element as to extend a negative-sum prefix into it.

**Q: What if the array can contain all negative numbers, does Kadane's algorithm still work?**

**A:** Yes, as written above (initialising both maxSoFar and currentMax to arr\[0\] rather than to 0), it correctly returns the least negative single element, since an empty subarray is not considered a valid answer in the standard version of this problem.

**Q: How would you also return the actual subarray (start and end indices), not just the maximum sum?**

**A:** Track additional variables for the start index of the current run and the best start/end indices seen so far. Whenever you restart the run (currentMax \= arr\[i\] because arr\[i\] alone beats extending), update the tracked start index to i, and whenever maxSoFar is updated, record the current start and i as the best end index.

**Q: Why is the Divide and Conquer solution to this problem O(n log n) instead of O(n)?**

**A:** Because at every one of the log n levels of recursion, the crossing-sum calculation does O(n) work in total across all subarrays at that level (it must scan outward from every midpoint), giving O(n) per level multiplied by O(log n) levels.

## **3.9 Tips and tricks**

* If this problem comes up, state both approaches, lead with mentioning Kadane's O(n) as the optimal known solution, then present the D\&C version since that is this week's specific technique.

* The line currentMax \= max(arr\[i\], currentMax \+ arr\[i\]) is the single most important line to have memorised cold, it is the entire algorithm.

* Practice the extension to also return the subarray indices, it is a very common follow-up.

# **Part 4: General Notes**

## **Merge Sort vs Quick Sort vs the O(n^2) sorts (DSA 1 recap)**

| Algorithm | Best | Average | Worst | Space | Stable | In-place |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Selection/Bubble/Insertion Sort | O(n) or O(n^2)\* | O(n^2) | O(n^2) | O(1) | Varies | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No |
| Quick Sort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No | Yes |

*\* Insertion and bubble sort (optimised) reach O(n) best case on nearly sorted input, selection sort is always O(n^2). See the DSA 1 Sorting & Searching notes for full detail.*

## **Structuring your answer when asked to "explain" a Divide and Conquer algorithm**

* 1\. State the paradigm explicitly: "this is divide and conquer, meaning divide, conquer, combine."

* 2\. Identify exactly what gets divided, what the base case is, and what the combine step does.

* 3\. Trace it on a small example (4-6 elements) on the whiteboard, showing the recursion tree.

* 4\. Derive the time complexity from the recursion tree: work per level multiplied by number of levels.

* 5\. State space complexity and any stability/in-place trade-offs.

## **Frequently repeated cross-cutting questions**

**Q: How do you generally derive the time complexity of a divide and conquer algorithm?**

**A:** Write its recurrence relation, for example T(n) \= 2T(n/2) \+ O(n) for both merge sort and the D\&C maximum subarray solution, then solve it (by recursion tree or the Master Theorem) to get the closed-form complexity, in this case O(n log n).

**Q: As a UTA, how would you help a student who cannot see why splitting a problem in half helps at all?**

**A:** Show them the recursion tree drawn out level by level for a small array, and have them count total comparisons per level versus the number of levels, seeing concretely that log n levels of O(n) work totals far less than n^2 for any reasonably sized n makes the benefit tangible rather than abstract.

## **Final checklist before the interview**

* Can you code merge sort and quicksort from memory in under 5 minutes each, including the merge/partition helper functions?

* Can you state, without hesitation, why quicksort's worst case is O(n^2) and how to mitigate it?

* Can you code Kadane's algorithm in under 1 minute, and explain why it is correct in one sentence?

* Can you write the recurrence relation for merge sort and explain how it leads to O(n log n)?

* Can you explain the general divide/conquer/combine structure before diving into any specific algorithm's code?