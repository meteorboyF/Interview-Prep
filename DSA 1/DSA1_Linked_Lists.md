  
**DSA 1**

**Singly & Doubly Linked Lists**

*UTA Interview Preparation Notes*

Covers: Singly Linked List (Insertion, Deletion, Search) and Doubly Linked List (Insertion, Deletion, Search)

# **Part 1: Singly Linked List**

A linked list is a linear data structure where each element (node) holds its data plus a pointer to the next node. Unlike an array, nodes are not stored in contiguous memory, so there is no random access, but insertion and deletion at known positions can be O(1) since no shifting of other elements is required.

## **1.1 How to teach it**

Use the analogy of a treasure hunt or a chain of people holding hands: each person only knows where the next person is standing, not the whole group. To find someone, you must start from the first person and follow the chain one step at a time; you cannot jump directly to the 5th person the way you can jump to arr\[5\] in an array.

* Draw boxes connected by arrows on the board: \[data|next\] \-\> \[data|next\] \-\> \[data|next\] \-\> NULL.

* Always emphasise the head pointer: it is the only entry point into the list, lose it and the whole list becomes unreachable (memory leak).

* The last node's next pointer is NULL, that is how you know you have reached the end.

## **1.2 Array vs Singly Linked List**

| Aspect | Array | Singly Linked List |
| :---- | :---- | :---- |
| Memory layout | Contiguous | Scattered, linked via pointers |
| Access by index | O(1) | O(n) |
| Insertion at front | O(n), shift everything | O(1) |
| Insertion at end | O(1) amortised (dynamic array) | O(1) if tail pointer kept, else O(n) |
| Insertion in middle | O(n) | O(n) to find \+ O(1) to link |
| Extra memory per element | None | One pointer (4 or 8 bytes) |
| Cache performance | Better (contiguous) | Worse (pointer chasing) |

## **1.3 Node structure**

**C++**

| struct Node {     int data;     Node\* next;     Node(int val) : data(val), next(nullptr) {} };   Node\* head \= nullptr;  // empty list |
| :---- |

**C**

| struct Node {     int data;     struct Node\* next; };   struct Node\* head \= NULL;  // empty list |
| :---- |

## **1.4 Traversal (print the list)**

The universal pattern for every linked list operation: start a temp pointer at head, move it forward with temp \= temp-\>next until it becomes NULL, and never move the head pointer itself.

| void printList(Node\* head) {     Node\* temp \= head;     while (temp \!= nullptr) {         cout \<\< temp-\>data \<\< " \-\> ";         temp \= temp-\>next;     }     cout \<\< "NULL" \<\< endl; } |
| :---- |

## **1.5 Insertion**

**Insert at head**

How to teach it: create the new node, point its next to the current head, then move head to the new node. Order matters, if you move head first you lose the rest of the list.

| Node\* insertAtHead(Node\* head, int val) {     Node\* newNode \= new Node(val);     newNode-\>next \= head;     head \= newNode;     return head; } |
| :---- |

*Complexity: O(1), constant regardless of list size, since no traversal is needed.*

**Insert at tail**

How to teach it: walk the pointer all the way to the last node (the one whose next is NULL), then attach the new node there. If the list is empty, the new node simply becomes the head.

| Node\* insertAtTail(Node\* head, int val) {     Node\* newNode \= new Node(val);     if (head \== nullptr) return newNode;     Node\* temp \= head;     while (temp-\>next \!= nullptr) temp \= temp-\>next;     temp-\>next \= newNode;     return head; } |
| :---- |

*Complexity: O(n), because the whole list must be traversed to find the last node, unless a separate tail pointer is maintained, which brings it down to O(1).*

**Insert at a given position (0-indexed)**

| Node\* insertAtPosition(Node\* head, int val, int pos) {     if (pos \== 0\) {         Node\* newNode \= new Node(val);         newNode-\>next \= head;         return newNode;     }     Node\* temp \= head;     for (int i \= 0; i \< pos \- 1 && temp \!= nullptr; i++)         temp \= temp-\>next;     if (temp \== nullptr) return head;  // position out of range     Node\* newNode \= new Node(val);     newNode-\>next \= temp-\>next;     temp-\>next \= newNode;     return head; } |
| :---- |

*Complexity: O(n) in the worst case, O(pos) precisely, since you must walk to the node just before the target position.*

## **1.6 Deletion**

**Delete from head**

| Node\* deleteAtHead(Node\* head) {     if (head \== nullptr) return nullptr;     Node\* temp \= head;     head \= head-\>next;     delete temp;     return head; } |
| :---- |

*Complexity: O(1). Always mention that the old head node must be freed/deleted to avoid a memory leak in C++.*

**Delete from tail**

| Node\* deleteAtTail(Node\* head) {     if (head \== nullptr || head-\>next \== nullptr) {         delete head;         return nullptr;     }     Node\* temp \= head;     while (temp-\>next-\>next \!= nullptr) temp \= temp-\>next;     delete temp-\>next;     temp-\>next \= nullptr;     return head; } |
| :---- |

*Complexity: O(n), since you need the second-to-last node, which requires a full traversal in a singly linked list (this is a key weakness compared to a doubly linked list).*

**Delete by value**

| Node\* deleteByValue(Node\* head, int val) {     if (head \== nullptr) return nullptr;     if (head-\>data \== val) {         Node\* temp \= head;         head \= head-\>next;         delete temp;         return head;     }     Node\* curr \= head;     while (curr-\>next \!= nullptr && curr-\>next-\>data \!= val)         curr \= curr-\>next;     if (curr-\>next \== nullptr) return head;  // value not found     Node\* toDelete \= curr-\>next;     curr-\>next \= curr-\>next-\>next;     delete toDelete;     return head; } |
| :---- |

*Complexity: O(n), you must search for the value first, exactly like linear search.*

## **1.7 Search**

| bool search(Node\* head, int target) {     Node\* temp \= head;     while (temp \!= nullptr) {         if (temp-\>data \== target) return true;         temp \= temp-\>next;     }     return false; } |
| :---- |

Complexity: O(n). This is the same linear search idea from Week 3, applied to a linked list instead of an array, this connection is worth pointing out explicitly in an interview.

## **1.8 Classic interview extensions**

**Reverse a singly linked list (iterative)**

How to teach it: walk through the list once, and at each node flip its next pointer to point backwards instead of forwards, using three pointers: prev, curr, and next (to save the rest of the list before you overwrite curr-\>next).

| Node\* reverseList(Node\* head) {     Node\* prev \= nullptr;     Node\* curr \= head;     while (curr \!= nullptr) {         Node\* nextTemp \= curr-\>next;         curr-\>next \= prev;         prev \= curr;         curr \= nextTemp;     }     return prev;  // new head } |
| :---- |

**Reverse a singly linked list (recursive)**

| Node\* reverseListRecursive(Node\* head) {     if (head \== nullptr || head-\>next \== nullptr) return head;     Node\* newHead \= reverseListRecursive(head-\>next);     head-\>next-\>next \= head;     head-\>next \= nullptr;     return newHead; } |
| :---- |

**Detect a cycle (Floyd's slow/fast pointer)**

How to teach it: use two runners on a track, one slow (one step at a time) and one fast (two steps at a time). If the track is a loop, the fast runner eventually laps the slow one and they meet. If the track has an end, the fast runner simply reaches NULL first.

| bool hasCycle(Node\* head) {     Node\* slow \= head;     Node\* fast \= head;     while (fast \!= nullptr && fast-\>next \!= nullptr) {         slow \= slow-\>next;         fast \= fast-\>next-\>next;         if (slow \== fast) return true;     }     return false; } |
| :---- |

## **1.9 Complexity summary**

| Operation | Time | Notes |
| :---- | :---- | :---- |
| Insert at head | O(1) | \- |
| Insert at tail | O(n) / O(1)\* | \*O(1) if a tail pointer is maintained |
| Insert at position | O(n) | O(pos) precisely |
| Delete at head | O(1) | \- |
| Delete at tail | O(n) | Needs the second-to-last node |
| Delete by value | O(n) | Search \+ unlink |
| Search | O(n) | Same idea as linear search |
| Reverse | O(n) | Single pass, O(1) extra space (iterative) |

## **1.10 Interview Q\&A**

**Q: Why is inserting at the head O(1) for a linked list but O(n) for an array?**

**A:** In an array, inserting at the front requires shifting every existing element one position to the right to make room. In a linked list, you only need to create a new node and redirect the head pointer, no existing node has to move.

**Q: Why is deleting the last node O(n) in a singly linked list?**

**A:** Because you need access to the second-to-last node to set its next pointer to NULL, and a singly linked list only has forward pointers, so the only way to find that node is to traverse from the head.

**Q: What happens if you lose the head pointer?**

**A:** The entire list becomes unreachable, since the head is the only entry point. In a language like C++ without garbage collection, this also causes a memory leak because the nodes are never freed.

**Q: How do you detect a cycle in a linked list, and what is its time and space complexity?**

**A:** Floyd's cycle detection algorithm (slow and fast pointer). It runs in O(n) time and O(1) space, which is better than the alternative of storing visited nodes in a hash set, which would need O(n) extra space.

**Q: Can you reverse a linked list in place, and what is the space complexity of your approach?**

**A:** Yes, the iterative three-pointer approach reverses the list in a single O(n) pass using O(1) extra space. The recursive version is also O(n) time but uses O(n) space due to the call stack.

## **1.11 Tips and tricks**

* Always check for the empty list (head \== nullptr) and the single-node list as edge cases before writing the main loop logic.

* Draw the pointers on the whiteboard before coding, this is exactly what you would do as a UTA to teach a student, and interviewers want to see that instinct.

* The three-pointer reversal pattern (prev, curr, next) is the single most reused pattern in linked list interview problems, memorise it cold.

* State time and space complexity for every operation immediately after coding it, do not wait to be asked.

# **Part 2: Doubly Linked List**

A doubly linked list is a linked list where each node stores two pointers, one to the next node and one to the previous node. This allows traversal in both directions and makes several operations that were O(n) in a singly linked list drop to O(1), at the cost of extra memory per node and slightly more pointer bookkeeping.

## **2.1 How to teach it**

Extend the singly linked list analogy: now each person in the chain holds hands with the person both in front of and behind them. This means you can walk the chain backwards as well as forwards, and if you are standing at any person, you can immediately identify their neighbour on either side without walking from the start.

* Draw it as: NULL \<- \[prev|data|next\] \<-\> \[prev|data|next\] \<-\> \[prev|data|next\] \-\> NULL.

* The first node's prev is NULL, and the last node's next is NULL.

* Every insertion or deletion touches up to four pointers instead of two, this is the main source of bugs, so trace each pointer update carefully.

## **2.2 Node structure**

**C++**

| struct DNode {     int data;     DNode\* next;     DNode\* prev;     DNode(int val) : data(val), next(nullptr), prev(nullptr) {} };   DNode\* head \= nullptr; |
| :---- |

**C**

| struct DNode {     int data;     struct DNode\* next;     struct DNode\* prev; };   struct DNode\* head \= NULL; |
| :---- |

## **2.3 Insertion**

**Insert at head**

| DNode\* insertAtHead(DNode\* head, int val) {     DNode\* newNode \= new DNode(val);     newNode-\>next \= head;     if (head \!= nullptr) head-\>prev \= newNode;     return newNode;  // new head } |
| :---- |

*Complexity: O(1). Notice the extra step versus a singly linked list: the old head's prev pointer must be updated to point back at the new node.*

**Insert at tail**

| DNode\* insertAtTail(DNode\* head, int val) {     DNode\* newNode \= new DNode(val);     if (head \== nullptr) return newNode;     DNode\* temp \= head;     while (temp-\>next \!= nullptr) temp \= temp-\>next;     temp-\>next \= newNode;     newNode-\>prev \= temp;     return head; } |
| :---- |

*Complexity: O(n) without a tail pointer, O(1) if a tail pointer is maintained, exactly as in the singly linked list case.*

**Insert after a given node**

This is where the doubly linked list shines: inserting after a known node is O(1), you do not need the previous node at all, unlike in a singly linked list where you would need to traverse from the head to find it.

| void insertAfter(DNode\* prevNode, int val) {     if (prevNode \== nullptr) return;     DNode\* newNode \= new DNode(val);     newNode-\>next \= prevNode-\>next;     newNode-\>prev \= prevNode;     if (prevNode-\>next \!= nullptr) prevNode-\>next-\>prev \= newNode;     prevNode-\>next \= newNode; } |
| :---- |

## **2.4 Deletion**

**Delete from head**

| DNode\* deleteAtHead(DNode\* head) {     if (head \== nullptr) return nullptr;     DNode\* temp \= head;     head \= head-\>next;     if (head \!= nullptr) head-\>prev \= nullptr;     delete temp;     return head; } |
| :---- |

**Delete from tail**

This is the key advantage over a singly linked list: with a tail pointer, deleting the last node is O(1), since tail-\>prev directly gives the second-to-last node without any traversal.

| DNode\* deleteAtTail(DNode\* head, DNode\* tail) {     if (tail \== nullptr) return head;     if (tail-\>prev \!= nullptr) tail-\>prev-\>next \= nullptr;     else head \= nullptr;  // list had only one node     delete tail;     return head; } |
| :---- |

**Delete a given node directly (by pointer)**

Another advantage: if you already hold a pointer to the node to delete (not just its value), deletion is O(1), because prev and next are both directly accessible, no search needed.

| void deleteNode(DNode\*& head, DNode\* node) {     if (node \== nullptr) return;     if (node-\>prev \!= nullptr) node-\>prev-\>next \= node-\>next;     else head \= node-\>next;  // deleting the head node     if (node-\>next \!= nullptr) node-\>next-\>prev \= node-\>prev;     delete node; } |
| :---- |

## **2.5 Search and traversal**

Search is still O(n), identical in idea to the singly linked list and to linear search, the only new capability is that you can also traverse from the tail backwards, which is useful for operations like "find the last occurrence" or implementing a browser back button.

| bool search(DNode\* head, int target) {     DNode\* temp \= head;     while (temp \!= nullptr) {         if (temp-\>data \== target) return true;         temp \= temp-\>next;     }     return false; }   void printReverse(DNode\* tail) {     DNode\* temp \= tail;     while (temp \!= nullptr) {         cout \<\< temp-\>data \<\< " \-\> ";         temp \= temp-\>prev;     }     cout \<\< "NULL" \<\< endl; } |
| :---- |

## **2.6 Complexity summary**

| Operation | Singly Linked List | Doubly Linked List |
| :---- | :---- | :---- |
| Insert at head | O(1) | O(1) |
| Insert at tail (with tail pointer) | O(1) | O(1) |
| Insert after a known node | O(1) | O(1) |
| Delete at head | O(1) | O(1) |
| Delete at tail (with tail pointer) | O(n) | O(1) |
| Delete a known node (by pointer) | O(n)\* | O(1) |
| Search | O(n) | O(n) |
| Traverse backwards | Not possible | O(n) |
| Extra memory per node | 1 pointer | 2 pointers |

*\* Even holding a pointer to the node, a singly linked list still needs O(n) to find the previous node to relink, since there is no prev pointer.*

## **2.7 Real-world applications (good talking points)**

* Browser back/forward history: each page is a node, prev goes back, next goes forward.

* LRU (Least Recently Used) cache: a doubly linked list combined with a hash map gives O(1) access, insertion, and eviction, the classic reason doubly linked lists appear in system design interviews.

* Undo/redo functionality in editors.

* The C++ STL std::list is implemented as a doubly linked list internally.

## **2.8 Interview Q\&A**

**Q: What is the main advantage of a doubly linked list over a singly linked list?**

**A:** O(1) deletion of a node when you already have a pointer to it, and O(1) deletion at the tail when a tail pointer is maintained, because the previous node is directly accessible via the prev pointer instead of requiring a full traversal.

**Q: What is the trade-off for that advantage?**

**A:** Extra memory, one additional pointer per node, and more pointer updates (and therefore more chances for bugs) on every insertion and deletion, since both the next and prev links must be kept consistent.

**Q: Why is a doubly linked list used in an LRU cache implementation instead of a singly linked list?**

**A:** An LRU cache needs to move a node to the front (mark as recently used) and evict the node at the back in O(1). Doing this requires unlinking an arbitrary node in O(1), which needs access to both its previous and next neighbours, only possible directly in a doubly linked list.

**Q: How would you convert a singly linked list into a doubly linked list?**

**A:** Traverse the singly linked list once, and while visiting each node, set its prev pointer to point back at the previously visited node. This is an O(n) time, O(1) extra space operation.

## **2.9 Tips and tricks**

* On the whiteboard, always update pointers in a safe order: save what you need in a temp variable before overwriting it, this avoids the classic bug of losing access to the rest of the list.

* If asked to code doubly linked list insertion/deletion live, narrate each pointer update out loud, both to reduce your own mistakes and to demonstrate teaching ability.

* Mention the LRU cache use case unprompted if the interview drifts towards "why would you use this in practice", it is the strongest real-world hook for this topic.

# **Part 3: General Notes**

## **Array vs Singly vs Doubly Linked List, at a glance**

| Feature | Array | Singly Linked List | Doubly Linked List |
| :---- | :---- | :---- | :---- |
| Random access | O(1) | O(n) | O(n) |
| Insert/delete at front | O(n) | O(1) | O(1) |
| Insert/delete at back | O(1)\* | O(n) / O(1)\* | O(1)\* |
| Delete a known node | O(n) | O(n) | O(1) |
| Backward traversal | Yes (by index) | No | Yes |
| Memory overhead | None | 1 pointer/node | 2 pointers/node |

*\* Assumes a dynamic array with spare capacity, or a maintained tail pointer where noted.*

## **Structuring your answer when asked to "explain" a linked list operation**

* 1\. Draw the before-state on the board with boxes and arrows.

* 2\. Name the pointers you will need (temp, prev, curr, next) before touching any code.

* 3\. Walk through the pointer updates step by step, explaining why the order matters.

* 4\. Draw the after-state to confirm the list is still fully connected.

* 5\. State time and space complexity, and compare briefly to the array equivalent.

## **Frequently repeated cross-cutting questions**

**Q: Why would you choose a linked list over an array in general?**

**A:** When the size of the collection is not known in advance and changes frequently, and when insertions/deletions at the front or in the middle are common, since a linked list avoids the O(n) shifting cost an array would incur.

**Q: Why would you choose an array over a linked list in general?**

**A:** When you need fast random access by index, better cache locality for performance-critical code, and lower memory overhead since no pointers are stored per element.

**Q: As a UTA, how would you help a student debug a segmentation fault in their linked list code?**

**A:** Ask them to draw the list on paper first and trace their pointer updates line by line against the drawing, most linked list bugs come from dereferencing a NULL pointer or losing a reference before it was used, and this is usually visible immediately once drawn out.

## **Final checklist before the interview**

* Can you code insertion and deletion at head, tail, and an arbitrary position for both list types from memory?

* Can you reverse a singly linked list iteratively and recursively without hesitation?

* Can you explain, in one sentence each, why doubly linked lists trade memory for faster deletion?

* Can you name at least one real-world use case (LRU cache, browser history) unprompted?

* Can you explain any operation the way you would to a first-year student, starting from a drawing, not straight from code?