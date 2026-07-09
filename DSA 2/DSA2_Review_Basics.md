  
**DSA 2**

**Review: C++ Fundamentals, STL Containers, Recursion**

*UTA Interview Preparation Notes*

Covers Weeks 1-2: For Loops, Structures, Functions, Strings, Vector/Stack/Queue/Map/Set, Recursion Review

# **Part 1: C++ Programming Fundamentals Review**

This is foundational material, but as a UTA you will likely be asked to explain even these basics clearly to first-year students, so the focus here is on clean explanations and common misconceptions, not just syntax.

## **1.1 For Loop and Nested For Loop**

**How to teach it**

A for loop repeats a block of code a known number of times, controlled by three parts: initialisation (runs once), condition (checked before every iteration), and update (runs after every iteration). Analogy: setting a countdown timer, you set the start value, check if time remains before each tick, and decrement after each tick.

| for (int i \= 0; i \< 5; i++) {     cout \<\< i \<\< " "; } // Output: 0 1 2 3 4 |
| :---- |

A nested for loop is a loop inside another loop. The inner loop runs completely for every single iteration of the outer loop. Analogy: reading every seat in every row of a cinema, the outer loop picks the row, the inner loop walks every seat in that row before moving to the next row.

| for (int i \= 0; i \< 3; i++) {     for (int j \= 0; j \< 3; j++) {         cout \<\< "(" \<\< i \<\< "," \<\< j \<\< ") ";     }     cout \<\< endl; } // Prints a 3x3 grid of coordinate pairs |
| :---- |

**Interview Q\&A**

**Q: What is the time complexity of a nested loop where both loops run n times?**

**A:** O(n^2), because the inner loop executes n times for each of the n iterations of the outer loop, giving n multiplied by n total iterations. This is the same reasoning that explains why bubble, selection, and insertion sort are all O(n^2).

**Q: What is the difference between a for loop and a while loop, and when would you choose one over the other?**

**A:** A for loop is preferred when the number of iterations is known in advance (iterating a fixed range or array). A while loop is preferred when the stopping condition depends on something computed during the loop itself, such as reading input until a sentinel value appears.

## **1.2 Structures (struct)**

**How to teach it**

A struct groups multiple related variables of possibly different types under one name, so they can be passed around and accessed together. Analogy: a student record card that holds a name, a roll number, and a CGPA all in one place, rather than as three separate loose variables.

| struct Student {     string name;     int rollNumber;     float cgpa; };   Student s1; s1.name \= "Fardeen"; s1.rollNumber \= 101; s1.cgpa \= 3.89; cout \<\< s1.name \<\< " " \<\< s1.cgpa; |
| :---- |

*In C++, struct and class are almost identical, the only default difference is that struct members are public by default, while class members are private by default.*

**Interview Q\&A**

**Q: What is the difference between a struct and a class in C++?**

**A:** The only functional default difference is member visibility: struct members and inheritance default to public, while class members and inheritance default to private. Both can have constructors, methods, and access specifiers, C++ struct is essentially a class with a different default.

## **1.3 Functions**

**How to teach it**

A function is a named, reusable block of code that takes inputs (parameters), performs a task, and optionally returns a value. Analogy: a vending machine, you provide inputs (coin, selection code), it performs an internal process, and it returns an output (the snack), without you needing to know its internal mechanism.

| int add(int a, int b) {     return a \+ b; }   int result \= add(3, 4);  // result \= 7 |
| :---- |

Pass by value vs pass by reference is a critical distinction: pass by value copies the argument, so changes inside the function do not affect the original variable. Pass by reference (using &) gives the function direct access to the original variable.

| void incrementByValue(int x) { x++; }         // caller's variable unchanged void incrementByRef(int& x) { x++; }          // caller's variable is modified   int a \= 5; incrementByValue(a);  // a is still 5 incrementByRef(a);    // a is now 6 |
| :---- |

**Interview Q\&A**

**Q: Why would you pass a large object (like a big struct or vector) by reference instead of by value?**

**A:** Passing by value copies the entire object, which costs time and memory proportional to its size. Passing by reference (or by const reference if it should not be modified) avoids that copy, giving direct access to the original data at O(1) cost regardless of the object's size.

**Q: What does 'const' mean when used in a function parameter like 'const vector\<int\>& arr'?**

**A:** It means the function receives the argument by reference (avoiding a copy) but promises not to modify it, the compiler will produce an error if the function body tries to change arr. This is the standard way to pass large read-only arguments efficiently and safely.

## **1.4 Strings**

**How to teach it**

A string in C++ (std::string) is a sequence of characters with built-in support for concatenation, comparison, and many convenient operations, unlike raw C-style character arrays which require manual memory and null-terminator handling.

| string s \= "Hello"; s \+= " World";           // concatenation \-\> "Hello World" cout \<\< s.length();       // 11 cout \<\< s\[0\];              // 'H', strings support indexing like arrays cout \<\< s.substr(0, 5);   // "Hello" cout \<\< (s.find("World") \!= string::npos);  // true, substring exists reverse(s.begin(), s.end());  // reverses the string in place |
| :---- |

**Common string interview patterns**

* Check palindrome: compare the string to its reverse, or use two pointers from both ends moving inward.

* Count character frequency: use an array of size 26 (for lowercase letters) or an unordered\_map\<char,int\>.

* Check anagram: sort both strings and compare, or compare character frequency counts.

**Interview Q\&A**

**Q: How would you check if a string is a palindrome, and what is the time complexity?**

**A:** Use two pointers, one starting at the front and one at the back, moving toward the centre and comparing characters at each step; if all pairs match, it is a palindrome. This runs in O(n) time and O(1) extra space.

**Q: Why is std::string generally preferred over C-style char arrays in modern C++?**

**A:** std::string manages its own memory automatically (no manual allocation or null-terminator bugs), supports operators like \+ for concatenation and \== for comparison directly, and provides built-in methods (substr, find, length) that would otherwise need to be written manually.

# **Part 2: STL Containers Review (Vector, Stack, Queue, Map, Set)**

Each container exists to solve a specific access pattern efficiently. The interview skill being tested here is not "can you use the syntax" but "can you justify which container fits a given problem, and say why the others do not."

## **2.1 Vector**

**What problem it solves**

A vector is a dynamic array: it grows and shrinks automatically while still giving O(1) random access by index, unlike a plain fixed-size C-style array.

**When to use it**

* You need indexed access (arr\[i\]) and the size may change at runtime.

* You mostly add/remove elements at the end.

* Default choice for "just give me a list of items" unless another container's special property is specifically needed.

**When you cannot / should not use it**

* Frequent insertions or deletions at the front or middle, each such operation is O(n) because all following elements must shift.

* You need fast membership checking (contains x?), that is O(n) on a vector, a set or unordered\_set is O(log n) or O(1) instead.

| \#include \<vector\> vector\<int\> v \= {1, 2, 3}; v.push\_back(4);      // O(1) amortised v.pop\_back();         // O(1) v.insert(v.begin(), 0);  // O(n), shifts everything right v\[1\] \= 99;             // O(1) random access |
| :---- |

## **2.2 Stack (STL adapter)**

**What problem it solves**

Provides LIFO access: the most recently added element is always the first one removed. It solves problems where you need to "undo" back to the most recent state or match nested structures (see Part 3 of the DSA 1 Stack/Queue/Graph notes for the full derivation).

**When to use it**

* Matching nested/paired structures: parentheses, tags, nested function calls.

* You need to reverse the order of processing, or backtrack to the most recent decision point.

**When you cannot / should not use it**

* You need access to anything other than the most recent element, a stack physically cannot give you that without popping everything above it first.

| \#include \<stack\> stack\<int\> st; st.push(10); st.push(20); cout \<\< st.top();  // 20 st.pop();            // removes 20 |
| :---- |

## **2.3 Queue (STL adapter)**

**What problem it solves**

Provides FIFO access: the first element added is the first one removed. It solves ordering-by-arrival problems and is the required data structure for BFS-style level-by-level processing.

**When to use it**

* Anything "first come, first served": task scheduling, BFS traversal, request handling.

* You need to process items in the exact order they arrived.

**When you cannot / should not use it**

* You need access to the most recently added element quickly, a queue only exposes the front and the back, not arbitrary recent history.

| \#include \<queue\> queue\<int\> q; q.push(10); q.push(20); cout \<\< q.front();  // 10 q.pop();              // removes 10 |
| :---- |

## **2.4 Map (std::map / std::unordered\_map)**

**What problem it solves**

A map stores key-value pairs and solves the problem of fast lookup by a meaningful key rather than a numeric index, for example counting word frequency, or storing a student's roll number to their grade.

**When to use it**

* You need to associate a value with a key and look it up quickly, use unordered\_map for average O(1) access when order does not matter.

* You need the keys to stay sorted, or need range queries (all keys between X and Y), use map (ordered, tree-based, O(log n)).

**When you cannot / should not use it**

* Very small, fixed key sets where a plain array indexed directly would be simpler and faster (for example, counting 26 lowercase letters, a size-26 array beats an unordered\_map).

* unordered\_map has no guaranteed order and worst-case O(n) if hash collisions are bad, if strict worst-case guarantees matter, prefer map.

| \#include \<unordered\_map\> unordered\_map\<string, int\> freq; freq\["apple"\]++;      // insert if missing, then increment: O(1) average freq\["apple"\]++; cout \<\< freq\["apple"\];   // 2 cout \<\< freq.count("banana");  // 0, key not present |
| :---- |

## **2.5 Set (std::set / std::unordered\_set)**

**What problem it solves**

A set stores unique elements and solves the problem of fast membership testing and automatic duplicate removal. It is a map without values, only keys.

**When to use it**

* You need to check "have I seen this before?" quickly, for example a visited set during graph traversal.

* You need a collection with automatically enforced uniqueness.

* You need elements maintained in sorted order (use set) or need the fastest possible average lookup and do not care about order (use unordered\_set).

**When you cannot / should not use it**

* You need to store duplicate values, sets silently discard them, use a vector or multiset instead.

* You need indexed positional access (give me the 3rd element), sets do not support O(1) random access by position.

| \#include \<set\> set\<int\> s \= {5, 2, 8, 2};   // stored as {2, 5, 8}, duplicate silently dropped s.insert(3);                   // {2, 3, 5, 8} cout \<\< s.count(5);           // 1 (present) cout \<\< s.count(100);         // 0 (absent) |
| :---- |

## **2.6 Container comparison table**

| Container | Access pattern | Insert | Search | Ordered? | Duplicates? |
| :---- | :---- | :---- | :---- | :---- | :---- |
| vector | By index | O(1) at end, O(n) elsewhere | O(n) | Insertion order | Yes |
| stack | LIFO, top only | O(1) | N/A (top only) | LIFO order | Yes |
| queue | FIFO, front/back only | O(1) | N/A (front only) | FIFO order | Yes |
| map | By key | O(log n) | O(log n) | Sorted by key | Unique keys |
| unordered\_map | By key | O(1) avg | O(1) avg | No order | Unique keys |
| set | By value | O(log n) | O(log n) | Sorted | Unique values |
| unordered\_set | By value | O(1) avg | O(1) avg | No order | Unique values |

## **2.7 Interview Q\&A**

**Q: You need to count the frequency of words in a large document. Which container do you use and why?**

**A:** unordered\_map\<string,int\>, since it gives average O(1) insertion and lookup per word, and order does not matter for a frequency count, only fast accumulation does.

**Q: You need to print the frequency count from the previous question in alphabetical order. Does your container choice change?**

**A:** Either switch to map\<string,int\>, which keeps keys sorted automatically at the cost of O(log n) operations instead of O(1), or keep the unordered\_map for fast counting and copy its contents into a vector of pairs to sort once at the end, which is often faster overall if counting dominates the work.

**Q: Why can't you efficiently insert at the front of a vector, but you can efficiently insert at the front of a queue?**

**A:** A vector stores elements contiguously in memory, so inserting at the front requires shifting every existing element one position to the right, an O(n) operation. A queue is designed only to expose and modify its two ends, its underlying implementation (often a deque) supports O(1) insertion at both ends without shifting the middle.

## **2.8 Tips and tricks**

* When asked "which data structure would you use", always answer with the justification, not just the name, that is what is actually being evaluated.

* Default to unordered\_map/unordered\_set unless you specifically need sorted order or worst-case guarantees, then explicitly say why you are switching to the ordered version.

* Remember: stack and queue in the STL are adapters, by default built on top of deque, not a raw array or linked list, mention this if asked how they are implemented internally.

# **Part 3: Review of Recursive Functions**

A recursive function is a function that calls itself to solve smaller instances of the same problem, until it reaches a base case simple enough to answer directly.

## **3.1 How to teach it**

Use the analogy of Russian nesting dolls (matryoshka): to open the whole set, you open the outer doll, which reveals a smaller doll, which you handle the exact same way, until you reach the smallest doll that does not open any further (the base case). Every recursive function needs exactly two parts: a base case that stops the recursion, and a recursive case that reduces the problem and calls itself again.

* Base case: the simplest version of the problem, answered directly without further recursive calls. Without this, the function recurses forever (stack overflow).

* Recursive case: does a small amount of work, then calls itself on a smaller/simpler version of the problem.

* Every recursive call is pushed onto the call stack, and unwinds (pops) as each call returns, this is exactly the stack data structure from Part 2, applied by the language runtime itself.

## **3.2 Worked example: factorial**

| int factorial(int n) {     if (n \<= 1\) return 1;         // base case     return n \* factorial(n \- 1);  // recursive case }   // factorial(4) // \= 4 \* factorial(3) // \= 4 \* (3 \* factorial(2)) // \= 4 \* (3 \* (2 \* factorial(1))) // \= 4 \* (3 \* (2 \* 1)) // \= 24 |
| :---- |

## **3.3 Worked example: Fibonacci (and why naive recursion can be slow)**

| int fib(int n) {     if (n \<= 1\) return n;               // base case     return fib(n \- 1\) \+ fib(n \- 2);     // recursive case } |
| :---- |

This naive version recomputes the same values repeatedly (fib(3) is computed separately inside both fib(5) and fib(4)), giving exponential O(2^n) time. This is the standard motivating example for memoisation and Dynamic Programming, which you will cover later in this course (Weeks 8-9), it is worth mentioning that connection proactively in an interview.

## **3.4 Recursion vs Iteration**

| Aspect | Recursion | Iteration |
| :---- | :---- | :---- |
| Readability for naturally recursive problems | Often much cleaner (trees, backtracking, divide and conquer) | Can become complex, needs manual stack simulation |
| Memory usage | O(depth) extra, due to the call stack | O(1) extra, typically |
| Risk | Stack overflow on very deep recursion | No stack overflow risk |
| Speed | Slightly slower, function call overhead per step | Generally faster, no call overhead |

## **3.5 When to use recursion, and when not to**

**Use recursion when**

* The problem is naturally self-similar: trees, graphs (DFS), divide and conquer (merge sort, quick sort, next course topic), backtracking.

* The recursive solution is significantly clearer than the iterative equivalent, and the recursion depth is bounded and reasonably small.

**Avoid or convert to iteration when**

* The input size could cause very deep recursion (thousands of levels), risking stack overflow, for example processing a huge linked list recursively instead of iteratively.

* The naive recursive solution recomputes the same subproblems repeatedly (like naive Fibonacci), in which case add memoisation or convert to an iterative Dynamic Programming solution instead.

* Performance is critical and the overhead of repeated function calls matters.

## **3.6 Interview Q\&A**

**Q: What are the two required components of any correct recursive function?**

**A:** A base case that terminates the recursion without a further recursive call, and a recursive case that reduces the problem toward the base case with each call. Missing either one causes infinite recursion and a stack overflow.

**Q: Why does naive recursive Fibonacci run in exponential time?**

**A:** Because it recomputes the same subproblems many times, for example fib(n-2) is computed independently as part of both the fib(n-1) branch and the fib(n-2) branch, and this duplication compounds at every level, producing roughly 2^n total calls.

**Q: Can every recursive function be rewritten iteratively?**

**A:** Yes, any recursive function can be converted to an iterative one using an explicit stack to simulate the call stack manually, exactly as shown in the iterative DFS from the DSA 1 graph notes. Some conversions are simple (tail recursion), others require carefully managing the state that would otherwise live on the call stack.

**Q: What is tail recursion, and why does it matter?**

**A:** A recursive call is in tail position when it is the very last operation in the function, with no pending work left to do after it returns. Some compilers can optimise tail-recursive calls into a loop internally (tail call optimisation), avoiding call stack growth, though this is not guaranteed in standard C++ the way it is in some other languages.

## **3.7 Tips and tricks**

* Always state the base case first when explaining any recursive function, out loud, before touching the recursive case, it is the part most likely to be missing or wrong.

* If asked to trace a recursive call, draw the call stack explicitly, box by box, showing which call is waiting on which.

* Proactively mention the naive-Fibonacci-to-memoisation story, it is a strong bridge to this course's upcoming Dynamic Programming weeks and shows you see the syllabus as connected, not isolated topics.

# **Part 4: General Notes**

## **Final checklist before the interview**

* Can you explain pass-by-value vs pass-by-reference with a concrete example and state why it matters for performance?

* For any given problem, can you name the right STL container and justify it against at least one alternative you rejected?

* Can you write factorial and Fibonacci recursively from memory, and explain why naive Fibonacci is slow?

* Can you state, in one sentence, the two required parts of every recursive function?

* Can you explain any of these topics starting from an everyday analogy, the way you would teach a first-year student, not straight from code?