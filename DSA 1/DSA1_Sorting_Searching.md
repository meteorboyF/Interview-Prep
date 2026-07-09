  
**DSA 1**

**Sorting & Searching**

*UTA Interview Preparation Notes*

Covers: Selection Sort, Bubble Sort, Insertion Sort, Linear Search, Binary Search

# **Part 1: Sorting**

Sorting means rearranging elements of a collection into a defined order (usually ascending). At UTA interview level, you should be able to explain the idea in plain words, trace it on a small array on the whiteboard, code it cleanly, and state its time/space complexity and stability without hesitation.

## **1.1 Selection Sort**

**How to teach it**

Explain it as: "Repeatedly find the smallest remaining element and put it in its correct position." Use a simple analogy: imagine 5 unsorted playing cards on a table. You scan all of them, pick the smallest, and place it at the front. Then you scan the remaining 4, pick the smallest, place it second. Repeat until done.

* Divide the array into a sorted part (left, initially empty) and an unsorted part (right, initially the whole array).

* Find the minimum element in the unsorted part.

* Swap it with the first element of the unsorted part.

* Move the boundary between sorted and unsorted parts one step right.

* Repeat until the unsorted part has one element left.

**Worked example**

*Array: \[29, 10, 14, 37, 13\]*

* Pass 1: minimum of whole array is 10 (index 1). Swap with index 0 \-\> \[10, 29, 14, 37, 13\]

* Pass 2: minimum of \[29,14,37,13\] is 13 (index 4). Swap with index 1 \-\> \[10, 13, 14, 37, 29\]

* Pass 3: minimum of \[14,37,29\] is 14, already in place \-\> \[10, 13, 14, 37, 29\]

* Pass 4: minimum of \[37,29\] is 29\. Swap \-\> \[10, 13, 14, 29, 37\]

Sorted. Notice it always scans the full remaining unsorted part, even if the array is already sorted, that is why best case is still O(n^2).

**C++ code**

| void selectionSort(vector\<int\>& arr) {     int n \= arr.size();     for (int i \= 0; i \< n \- 1; i++) {         int minIdx \= i;         for (int j \= i \+ 1; j \< n; j++) {             if (arr\[j\] \< arr\[minIdx\]) minIdx \= j;         }         if (minIdx \!= i) swap(arr\[i\], arr\[minIdx\]);     } } |
| :---- |

**C code**

| void selectionSort(int arr\[\], int n) {     for (int i \= 0; i \< n \- 1; i++) {         int minIdx \= i;         for (int j \= i \+ 1; j \< n; j++) {             if (arr\[j\] \< arr\[minIdx\]) minIdx \= j;         }         int temp \= arr\[i\];         arr\[i\] \= arr\[minIdx\];         arr\[minIdx\] \= temp;     } } |
| :---- |

**Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(n^2) comparisons |
| Average case | O(n^2) |
| Worst case | O(n^2) |
| Space | O(1), in-place |
| Number of swaps | O(n), at most n-1 swaps |
| Stable? | No (in the standard version) |
| Adaptive? | No, does not speed up on nearly sorted input |

**Interview Q\&A**

**Q: Why is selection sort O(n^2) even in the best case, unlike bubble/insertion sort?**

**A:** Because it always scans the entire unsorted portion to find the minimum, regardless of whether the array is already sorted. There is no early exit condition based on data order.

**Q: Is selection sort stable? Can it be made stable?**

**A:** Not stable by default because it swaps the minimum into place, which can move an equal element past another equal element. It can be made stable by shifting elements instead of swapping (insert the minimum at the front and shift others), at the cost of more data movement.

**Q: When would you actually prefer selection sort in practice?**

**A:** When the cost of writing/swapping is very high compared to comparisons, for example sorting data on flash memory or EEPROM, since selection sort makes only O(n) writes versus O(n^2) for bubble sort.

**Tips and tricks**

* Remember the key phrase interviewers want: "minimum number of swaps among O(n^2) sorts."

* If asked to trace it, always show the sorted/unsorted boundary explicitly, it signals you understand the invariant.

* Common trick question: "What if you look for maximum instead of minimum and place at the end?" Same idea, symmetric version.

## **1.2 Bubble Sort**

**How to teach it**

Explain it as: "Repeatedly compare each pair of adjacent elements and swap them if they are in the wrong order, so that on every pass the largest remaining element bubbles up to its correct position at the end."

* Compare arr\[0\] and arr\[1\]; swap if arr\[0\] \> arr\[1\].

* Compare arr\[1\] and arr\[2\]; swap if needed. Continue to the end of the array.

* After one full pass, the largest element is guaranteed to be at the last position.

* Repeat for n-1 passes, each time ignoring the already-sorted tail.

**Worked example**

*Array: \[5, 1, 4, 2, 8\]*

* Pass 1: (5,1)-\>swap, (5,4)-\>swap, (5,2)-\>swap, (5,8)-\>no swap \=\> \[1,4,2,5,8\]

* Pass 2: (1,4)-\>no, (4,2)-\>swap, (4,5)-\>no \=\> \[1,2,4,5,8\]

* Pass 3: no swaps needed at all \=\> array already sorted, can stop early if using the optimised flag version

**C++ code (optimised with early exit)**

| void bubbleSort(vector\<int\>& arr) {     int n \= arr.size();     for (int i \= 0; i \< n \- 1; i++) {         bool swapped \= false;         for (int j \= 0; j \< n \- 1 \- i; j++) {             if (arr\[j\] \> arr\[j \+ 1\]) {                 swap(arr\[j\], arr\[j \+ 1\]);                 swapped \= true;             }         }         if (\!swapped) break;  // already sorted, stop early     } } |
| :---- |

**C code**

| void bubbleSort(int arr\[\], int n) {     for (int i \= 0; i \< n \- 1; i++) {         int swapped \= 0;         for (int j \= 0; j \< n \- 1 \- i; j++) {             if (arr\[j\] \> arr\[j \+ 1\]) {                 int temp \= arr\[j\];                 arr\[j\] \= arr\[j \+ 1\];                 arr\[j \+ 1\] \= temp;                 swapped \= 1;             }         }         if (\!swapped) break;     } } |
| :---- |

**Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(n) with the swapped-flag optimisation (already sorted input) |
| Average case | O(n^2) |
| Worst case | O(n^2) (reverse sorted input) |
| Space | O(1), in-place |
| Stable? | Yes, equal elements are never swapped past each other |
| Adaptive? | Yes, with the early-exit optimisation |

**Interview Q\&A**

**Q: How do you make bubble sort adaptive (best case O(n))?**

**A:** Add a boolean flag that tracks whether any swap happened during a pass. If a full pass completes with zero swaps, the array is already sorted, so you break out immediately instead of running all n-1 passes.

**Q: Why is bubble sort considered inefficient compared to insertion sort, even though both are O(n^2)?**

**A:** Bubble sort typically performs more swaps than insertion sort for the same input, since it only moves an element one position per comparison, whereas insertion sort can shift a block of elements more efficiently and does fewer total writes on average.

**Q: Is bubble sort ever used in real systems?**

**A:** Rarely for large data due to O(n^2) cost, but it is used pedagogically, and a variant (cocktail shaker sort, which bubbles in both directions) is sometimes used for small, nearly-sorted datasets.

**Tips and tricks**

* Always mention the swapped-flag optimisation unprompted, it is the single most common follow-up question.

* Know the name "cocktail sort" / "bidirectional bubble sort" as a bonus fact.

* If asked to compare bubble vs selection sort: selection sort makes fewer swaps, bubble sort is stable and adaptive, selection sort is not stable and not adaptive by default.

## **1.3 Insertion Sort**

**How to teach it**

Explain it with the classic analogy: "Sorting a hand of playing cards." You hold cards one at a time; each new card is inserted into its correct position relative to the cards you are already holding (which are always kept sorted).

* Start assuming the first element alone is a sorted sublist of size 1\.

* Take the next element (the "key") and compare it backwards against the sorted sublist.

* Shift every element greater than the key one position to the right.

* Insert the key into the gap created.

* Repeat until the whole array has been processed.

**Worked example**

*Array: \[12, 11, 13, 5, 6\]*

* Key=11: compare with 12, shift 12 right, insert 11 \=\> \[11,12,13,5,6\]

* Key=13: compare with 12, no shift needed (13\>12) \=\> \[11,12,13,5,6\]

* Key=5: shifts 13,12,11 all right, insert 5 at front \=\> \[5,11,12,13,6\]

* Key=6: shifts 13,12,11 right, insert 6 after 5 \=\> \[5,6,11,12,13\]

**C++ code**

| void insertionSort(vector\<int\>& arr) {     int n \= arr.size();     for (int i \= 1; i \< n; i++) {         int key \= arr\[i\];         int j \= i \- 1;         while (j \>= 0 && arr\[j\] \> key) {             arr\[j \+ 1\] \= arr\[j\];             j--;         }         arr\[j \+ 1\] \= key;     } } |
| :---- |

**C code**

| void insertionSort(int arr\[\], int n) {     for (int i \= 1; i \< n; i++) {         int key \= arr\[i\];         int j \= i \- 1;         while (j \>= 0 && arr\[j\] \> key) {             arr\[j \+ 1\] \= arr\[j\];             j--;         }         arr\[j \+ 1\] \= key;     } } |
| :---- |

**Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(n), when the array is already sorted |
| Average case | O(n^2) |
| Worst case | O(n^2), reverse sorted input |
| Space | O(1), in-place |
| Stable? | Yes |
| Adaptive? | Yes, naturally (no extra flag needed) |
| Online? | Yes, can sort a stream as elements arrive |

**Interview Q\&A**

**Q: Why is insertion sort used inside hybrid algorithms like Timsort and Introsort?**

**A:** For small subarrays (typically under 16-32 elements) insertion sort has very low constant overhead and is naturally adaptive, so it beats the overhead of recursive divide-and-conquer algorithms like quicksort or mergesort at small sizes.

**Q: What does it mean for insertion sort to be "online"?**

**A:** It can sort a list as new elements arrive one at a time, without needing to see the whole dataset in advance, since each new element is simply inserted into the already-sorted portion built so far.

**Q: How would you speed up the search step inside insertion sort?**

**A:** Use binary search to find the insertion point instead of linear backward scanning. This reduces comparisons to O(log n) per element, though the shifting of elements is still O(n) per element, so overall complexity remains O(n^2) in the worst case, only the comparison count improves.

**Tips and tricks**

* Insertion sort is the go-to answer whenever an interviewer asks "which O(n^2) sort is best for nearly sorted data".

* Mention binary insertion sort as a bonus, it shows depth.

* Remember: shifting, not swapping, is the core operation, this is a common point of confusion with bubble sort.

## **1.4 Sorting Algorithms: Side-by-Side Comparison**

| Algorithm | Best | Avg / Worst | Stable | In-place | Adaptive |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Selection Sort | O(n^2) | O(n^2) | No | Yes | No |
| Bubble Sort | O(n)\* | O(n^2) | Yes | Yes | Yes\* |
| Insertion Sort | O(n) | O(n^2) | Yes | Yes | Yes |

*\* Bubble sort only reaches O(n) best case and adaptivity with the swapped-flag early-exit optimisation.*

# **Part 2: Searching**

Searching means locating a target value inside a collection. The two core algorithms at this level are linear search (works on any data) and binary search (requires sorted data, but is far faster).

## **2.1 Linear Search**

**How to teach it**

Explain it as the most intuitive search: "Check every element one by one, from the start, until you either find the target or reach the end." Use an analogy: looking for a specific book on an unsorted shelf, you have no choice but to check each book in turn.

* Start at index 0\.

* Compare the current element with the target.

* If it matches, return the index.

* If not, move to the next index.

* If the end of the array is reached with no match, return \-1 (not found).

**C++ code**

| int linearSearch(vector\<int\>& arr, int target) {     for (int i \= 0; i \< (int)arr.size(); i++) {         if (arr\[i\] \== target) return i;     }     return \-1; } |
| :---- |

**C code**

| int linearSearch(int arr\[\], int n, int target) {     for (int i \= 0; i \< n; i++) {         if (arr\[i\] \== target) return i;     }     return \-1; } |
| :---- |

**Sentinel linear search (optimisation)**

A neat trick: place the target at the very end of the array as a "sentinel" before searching. This removes the need to check the loop's bounds condition (i \< n) on every iteration, since the loop is guaranteed to stop at the sentinel, only the equality check remains.

| int sentinelLinearSearch(vector\<int\>& arr, int target) {     int n \= arr.size();     int last \= arr\[n \- 1\];     arr\[n \- 1\] \= target;  // place sentinel     int i \= 0;     while (arr\[i\] \!= target) i++;     arr\[n \- 1\] \= last;   // restore original value     if (i \< n \- 1 || arr\[n \- 1\] \== target) return i;     return \-1; } |
| :---- |

**Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(1), target is the first element |
| Average / Worst case | O(n) |
| Space | O(1) |
| Precondition | None, works on unsorted data |

**Interview Q\&A**

**Q: When would you use linear search instead of binary search?**

**A:** When the data is unsorted and sorting it first would cost more than a single linear scan, or when the dataset is very small so the overhead difference is negligible, or when searching a linked list where random access is not O(1).

**Q: What is the time complexity of searching in an unsorted linked list, and why can't you use binary search there?**

**A:** It is O(n), and binary search cannot be used because it needs O(1) random access to the middle element on each step, which a linked list does not provide, accessing the middle still costs O(n).

**Tips and tricks**

* Always state the precondition explicitly: linear search needs no sorted order, that is its main advantage.

* Sentinel search is a good bonus fact if asked "how do you optimise linear search".

## **2.2 Binary Search**

**How to teach it**

Explain it as a divide-and-conquer idea: "Repeatedly cut the sorted search space in half by comparing the target with the middle element." Analogy: looking up a word in a physical dictionary, you open somewhere in the middle, decide whether the word is alphabetically before or after that page, and discard the half you don't need, repeating until found.

* Requires the array to be sorted.

* Maintain two pointers, low and high, spanning the current search range.

* Compute mid \= low \+ (high \- low) / 2 (avoids integer overflow, unlike (low \+ high) / 2).

* If arr\[mid\] \== target, done.

* If arr\[mid\] \< target, search the right half (low \= mid \+ 1).

* If arr\[mid\] \> target, search the left half (high \= mid \- 1).

* Stop when low \> high, meaning the target is not present.

**Worked example**

*Sorted array: \[2, 5, 8, 12, 16, 23, 38, 56, 72, 91\], target \= 23*

* low=0, high=9, mid=4, arr\[4\]=16 \< 23 \-\> search right, low=5

* low=5, high=9, mid=7, arr\[7\]=56 \> 23 \-\> search left, high=6

* low=5, high=6, mid=5, arr\[5\]=23 \-\> found at index 5

**C++ code: iterative**

| int binarySearchIterative(vector\<int\>& arr, int target) {     int low \= 0, high \= arr.size() \- 1;     while (low \<= high) {         int mid \= low \+ (high \- low) / 2;         if (arr\[mid\] \== target) return mid;         else if (arr\[mid\] \< target) low \= mid \+ 1;         else high \= mid \- 1;     }     return \-1; } |
| :---- |

**C++ code: recursive**

| int binarySearchRecursive(vector\<int\>& arr, int target, int low, int high) {     if (low \> high) return \-1;     int mid \= low \+ (high \- low) / 2;     if (arr\[mid\] \== target) return mid;     else if (arr\[mid\] \< target)         return binarySearchRecursive(arr, target, mid \+ 1, high);     else         return binarySearchRecursive(arr, target, low, mid \- 1); } |
| :---- |

**C code: iterative**

| int binarySearch(int arr\[\], int n, int target) {     int low \= 0, high \= n \- 1;     while (low \<= high) {         int mid \= low \+ (high \- low) / 2;         if (arr\[mid\] \== target) return mid;         else if (arr\[mid\] \< target) low \= mid \+ 1;         else high \= mid \- 1;     }     return \-1; } |
| :---- |

**Common variants (very likely to come up)**

* First occurrence of target in an array with duplicates: when arr\[mid\] \== target, do not return immediately, move high \= mid \- 1 and keep tracking the answer.

* Last occurrence: symmetric, move low \= mid \+ 1 and keep tracking the answer.

* Lower bound / upper bound: smallest index where arr\[index\] \>= target, or first index strictly greater than target.

* Search in a rotated sorted array: at each step, determine which half (left or right of mid) is properly sorted, then check if target lies within that sorted half's range.

**Complexity and properties**

| Property | Value |
| :---- | :---- |
| Best case | O(1), target is the middle element |
| Average / Worst case | O(log n) |
| Space | O(1) iterative, O(log n) recursive (call stack) |
| Precondition | Array must be sorted |

**Interview Q\&A**

**Q: Why write mid \= low \+ (high \- low) / 2 instead of (low \+ high) / 2?**

**A:** To avoid integer overflow. If low and high are both large, their sum can exceed the maximum representable integer value in fixed-width integer types, causing incorrect or negative results. The subtraction-based form keeps the intermediate value bounded within the array size.

**Q: What is the time complexity of binary search and why?**

**A:** O(log n), because each comparison eliminates half of the remaining search space, so the number of steps needed to shrink n elements down to 1 is log base 2 of n.

**Q: How would you find the first occurrence of a duplicated target using binary search?**

**A:** Run binary search as usual, but whenever arr\[mid\] equals the target, record that index as a candidate answer and continue searching the left half (high \= mid \- 1\) instead of stopping, to see if an earlier occurrence exists.

**Q: Can binary search be applied to a linked list?**

**A:** Not efficiently, because it needs O(1) random access to the middle element at every step, and a singly or doubly linked list only supports O(n) sequential access, which would remove the log n benefit.

**Tips and tricks**

* Always say the precondition first: "the array must be sorted", interviewers specifically listen for this.

* Practice tracing binary search by hand on a 8-10 element array live, it is the single most commonly asked live-coding task in this topic.

* Know the overflow-safe mid formula by heart, it is a very common "gotcha" question.

* Be ready to code both the iterative and the first/last occurrence variants without looking anything up.

## **2.3 Searching Algorithms: Side-by-Side Comparison**

| Algorithm | Precondition | Time Complexity | Space |
| :---- | :---- | :---- | :---- |
| Linear Search | None | O(n) | O(1) |
| Binary Search | Array must be sorted | O(log n) | O(1) iterative |

# **Part 3: General Interview Tips for This Topic**

## **Structuring your answer when asked to "explain" any algorithm**

* 1\. One-sentence intuition (the analogy).

* 2\. Step-by-step mechanism, in plain words.

* 3\. A tiny worked example on paper or whiteboard, 5-6 elements is enough.

* 4\. Time and space complexity, and whether it is stable/adaptive/in-place.

* 5\. One real-world use case or a common follow-up variant.

## **Frequently repeated cross-cutting questions**

**Q: What does "stable sort" mean, and why does it matter?**

**A:** A sort is stable if two elements with equal keys retain their original relative order after sorting. It matters when sorting records by one field after already having sorted them by another, for example sorting students by grade after they were already sorted by name, a stable sort keeps names alphabetical within the same grade.

**Q: What does "in-place" mean?**

**A:** An algorithm is in-place if it uses only O(1) (constant) extra memory beyond the input array, rearranging elements within the array itself rather than copying into a new structure.

**Q: Why do all three basic sorts (selection, bubble, insertion) have O(n^2) worst case?**

**A:** Each one uses nested loops where, for every element, it may need to compare against (or shift past) every other element in the worst case, giving n multiplied by n comparisons or shifts.

**Q: As a UTA, how would you handle a student who does not understand binary search?**

**A:** Start with the dictionary or phone book analogy before writing any code, draw the sorted array on the board, physically point at the middle element for two or three iterations by hand, and only introduce the mid-formula and code once the elimination idea is visually clear.

## **Final checklist before the interview**

* Can you code all five algorithms from memory in under 3 minutes each?

* Can you state best/average/worst time complexity and space for each without pausing?

* Can you trace binary search and insertion sort by hand on a fresh example on the spot?

* Can you explain each topic the way you would to a first-year student seeing it for the first time, not the way you would explain it to another engineer?

* Remember: as a UTA you are being evaluated on teaching ability as much as on technical correctness.