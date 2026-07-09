  
**DSA 1**

**Trees & Set Operations**

*UTA Interview Preparation Notes*

Covers Weeks 10-11: Tree Traversal, Binary Tree, Binary Search Tree, Set Operations

# **Part 1: Trees, Traversal, and Binary Search Trees**

A tree is a hierarchical data structure made of nodes connected by edges, with one designated root node and no cycles. Every node except the root has exactly one parent, and can have any number of children. A binary tree restricts each node to at most two children, conventionally called left and right.

## **1.1 How to teach it**

Use the analogy of a family tree or a company org chart: one person at the top (the root/CEO), and each person can have subordinates (children), but exactly one manager (parent), except the person at the very top who has none.

* Root: the topmost node, no parent.

* Leaf: a node with no children.

* Height of a tree: the number of edges on the longest path from root to a leaf.

* Depth of a node: the number of edges from the root to that node.

* Binary tree: each node has at most two children, left and right.

## **1.2 Node structure (C++)**

| struct Node {     int data;     Node\* left;     Node\* right;     Node(int val) : data(val), left(nullptr), right(nullptr) {} };   Node\* root \= nullptr;  // empty tree |
| :---- |

**C**

| struct Node {     int data;     struct Node\* left;     struct Node\* right; };   struct Node\* root \= NULL; |
| :---- |

## **1.3 Tree traversal techniques**

There are three depth-first traversal orders for a binary tree, distinguished only by when the current node's data is processed relative to its two subtrees, plus one breadth-first traversal (level order).

**Inorder (Left, Root, Right)**

How to teach it: visit the entire left subtree first, then the node itself, then the entire right subtree. Key fact: for a Binary Search Tree, inorder traversal always produces the values in sorted ascending order, this is the single most important fact to know about inorder traversal.

| void inorder(Node\* root) {     if (root \== nullptr) return;     inorder(root-\>left);     cout \<\< root-\>data \<\< " ";     inorder(root-\>right); } |
| :---- |

**Preorder (Root, Left, Right)**

How to teach it: visit the node itself first, before either subtree. Useful for creating a copy of the tree, since the root is processed before its children exist in the traversal, preserving the structure needed to rebuild it.

| void preorder(Node\* root) {     if (root \== nullptr) return;     cout \<\< root-\>data \<\< " ";     preorder(root-\>left);     preorder(root-\>right); } |
| :---- |

**Postorder (Left, Right, Root)**

How to teach it: visit both subtrees completely before the node itself. Useful whenever children must be fully processed before the parent, for example deleting a tree node by node (delete children first, so you never lose the pointer to a subtree), or evaluating an expression tree.

| void postorder(Node\* root) {     if (root \== nullptr) return;     postorder(root-\>left);     postorder(root-\>right);     cout \<\< root-\>data \<\< " "; } |
| :---- |

**Level order (breadth-first, using a queue)**

How to teach it: identical idea to BFS on a graph. Visit the root, then all nodes at depth 1, then all nodes at depth 2, and so on, using a queue to remember which nodes to visit next.

| void levelOrder(Node\* root) {     if (root \== nullptr) return;     queue\<Node\*\> q;     q.push(root);       while (\!q.empty()) {         Node\* curr \= q.front(); q.pop();         cout \<\< curr-\>data \<\< " ";         if (curr-\>left) q.push(curr-\>left);         if (curr-\>right) q.push(curr-\>right);     } } |
| :---- |

**Worked example**

*Tree:*

|         4       /   \\      2     6     / \\   / \\    1   3 5   7 |
| :---- |

* Inorder:    1 2 3 4 5 6 7  (sorted, confirms this is a valid BST)

* Preorder:   4 2 1 3 6 5 7

* Postorder:  1 3 2 5 7 6 4

* Level order: 4 2 6 1 3 5 7

## **1.4 Binary Search Tree (BST)**

A BST is a binary tree with one extra ordering property: for every node, all values in its left subtree are smaller, and all values in its right subtree are larger (assuming no duplicates). This property is what makes search, insertion, and deletion efficient, O(log n) on average, by allowing you to discard half the remaining tree at every step, the same idea as binary search on an array.

**Search**

| Node\* search(Node\* root, int target) {     if (root \== nullptr || root-\>data \== target) return root;     if (target \< root-\>data) return search(root-\>left, target);     return search(root-\>right, target); } |
| :---- |

**Insertion**

| Node\* insert(Node\* root, int val) {     if (root \== nullptr) return new Node(val);     if (val \< root-\>data) root-\>left \= insert(root-\>left, val);     else if (val \> root-\>data) root-\>right \= insert(root-\>right, val);     return root;  // duplicates ignored here } |
| :---- |

**Deletion (the tricky one, three cases)**

How to teach it: there are three cases. (1) The node is a leaf, simply remove it. (2) The node has one child, replace it with that child. (3) The node has two children, find its inorder successor (the smallest value in its right subtree), copy that value into the node, then delete the successor from the right subtree, which is now guaranteed to be a simpler case.

| Node\* findMin(Node\* root) {     while (root-\>left \!= nullptr) root \= root-\>left;     return root; }   Node\* deleteNode(Node\* root, int val) {     if (root \== nullptr) return root;     if (val \< root-\>data) {         root-\>left \= deleteNode(root-\>left, val);     } else if (val \> root-\>data) {         root-\>right \= deleteNode(root-\>right, val);     } else {         // found the node to delete         if (root-\>left \== nullptr) {             Node\* temp \= root-\>right;             delete root;             return temp;         } else if (root-\>right \== nullptr) {             Node\* temp \= root-\>left;             delete root;             return temp;         }         // two children: get inorder successor         Node\* successor \= findMin(root-\>right);         root-\>data \= successor-\>data;         root-\>right \= deleteNode(root-\>right, successor-\>data);     }     return root; } |
| :---- |

## **1.5 Complexity summary**

| Operation | Average (balanced) | Worst case (skewed) |
| :---- | :---- | :---- |
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Traversal (any order) | O(n) | O(n) |

*The worst case happens when the tree becomes skewed (essentially a linked list), for example when values are inserted in already-sorted order into a plain BST. Self-balancing trees (AVL, Red-Black) solve this by guaranteeing O(log n) height, but are typically beyond an undergraduate DSA 1 syllabus, mention them only as a bonus fact if asked "how would you fix this".*

## **1.6 Interview Q\&A**

**Q: Why does inorder traversal of a BST always produce sorted output?**

**A:** Because inorder visits the entire left subtree (all smaller values) before the node itself, then the entire right subtree (all larger values) after, and this holds recursively at every level, so the overall visiting order is strictly increasing.

**Q: Why is deleting a node with two children the hardest case, and how do you handle it?**

**A:** Because removing the node directly would disconnect both of its subtrees, and there is no single child to promote in its place. The fix is to replace its value with its inorder successor (the smallest value in the right subtree), then delete that successor instead, which is guaranteed to have at most one child.

**Q: What is the worst-case time complexity of BST operations, and when does it occur?**

**A:** O(n), when the tree becomes skewed, essentially degenerating into a linked list. This happens when elements are inserted in sorted (or reverse sorted) order into a plain, unbalanced BST.

**Q: How would you check if a given binary tree is a valid BST?**

**A:** Run an inorder traversal and check that the resulting sequence is strictly increasing, or equivalently, recursively verify each node's value falls within a valid (min, max) range inherited from its ancestors, rather than only comparing a node to its immediate children.

**Q: How would you find the height of a binary tree?**

**A:** Recursively: height(node) \= 1 \+ max(height(node-\>left), height(node-\>right)), with height(nullptr) \= \-1 or 0 depending on convention, this must be stated explicitly since both conventions exist.

## **1.7 Tips and tricks**

* Always draw the tree before coding any traversal, and trace the recursive calls on the drawing, it makes the Left/Root/Right ordering intuitive rather than something to memorise.

* The mnemonic "inorder gives sorted order" is the single most useful fact for BST interview questions, state it early.

* For BST deletion, always name the three cases explicitly (leaf, one child, two children) before writing any code, it shows structured thinking.

* Mention that a plain BST degrades to O(n) on skewed input, and that AVL/Red-Black trees exist to fix this, as a strong bonus point.

# **Part 2: Set Operations**

A set is a collection of distinct elements with no duplicates and, in the mathematical sense, no defined order. The core operations mirror set theory from mathematics: union, intersection, difference, and subset checking.

## **2.1 How to teach it**

Use the classic Venn diagram analogy directly: draw two overlapping circles, A and B. Union is everything inside either circle. Intersection is only the overlapping region. Difference (A \- B) is the part of A that does not overlap with B.

* Union (A ∪ B): all elements that are in A, or in B, or in both.

* Intersection (A ∩ B): only elements that are in both A and B.

* Difference (A \- B): elements in A that are not in B.

* Symmetric difference (A Δ B): elements in exactly one of the two sets, not both, equivalent to (A \- B) ∪ (B \- A).

* Subset check (A ⊆ B): true if every element of A is also in B.

## **2.2 Using the C++ STL set (implemented as a balanced BST internally)**

| \#include \<set\> set\<int\> A \= {1, 2, 3, 4}; set\<int\> B \= {3, 4, 5, 6};   A.insert(10);       // O(log n) A.erase(2);          // O(log n) bool found \= A.count(3);  // O(log n), returns 0 or 1 |
| :---- |

*Note: std::set keeps elements sorted automatically and stores only unique values, both properties come from its internal balanced BST (typically a Red-Black tree) implementation. This directly connects back to Part 1: a set is one of the most common real-world uses of a BST.*

## **2.3 Union, intersection, and difference using STL algorithms**

The \<algorithm\> header provides set operations that work on sorted ranges (a std::set is already sorted, so these apply directly).

| \#include \<algorithm\> \#include \<vector\>   set\<int\> A \= {1, 2, 3, 4}; set\<int\> B \= {3, 4, 5, 6}; vector\<int\> result;   set\_union(A.begin(), A.end(), B.begin(), B.end(), back\_inserter(result)); // result \= {1, 2, 3, 4, 5, 6}   result.clear(); set\_intersection(A.begin(), A.end(), B.begin(), B.end(), back\_inserter(result)); // result \= {3, 4}   result.clear(); set\_difference(A.begin(), A.end(), B.begin(), B.end(), back\_inserter(result)); // result \= {1, 2}  (elements in A but not in B) |
| :---- |

## **2.4 Implementing set operations manually (what an interviewer often wants to see)**

If asked to implement these from scratch rather than call a library function, the two standard approaches are hashing (unordered\_set) for O(n) average time, or sorting plus a two-pointer sweep for O(n log n) time but no extra hashing overhead.

**Using a hash set (average O(n \+ m))**

| vector\<int\> unionSets(vector\<int\>& a, vector\<int\>& b) {     unordered\_set\<int\> s(a.begin(), a.end());     s.insert(b.begin(), b.end());     return vector\<int\>(s.begin(), s.end()); }   vector\<int\> intersectSets(vector\<int\>& a, vector\<int\>& b) {     unordered\_set\<int\> s(a.begin(), a.end());     vector\<int\> result;     for (int x : b) {         if (s.count(x)) result.push\_back(x);     }     return result; } |
| :---- |

**Using sorted arrays and two pointers (O(n log n) total, with sorting)**

| vector\<int\> intersectSorted(vector\<int\>& a, vector\<int\>& b) {     sort(a.begin(), a.end());     sort(b.begin(), b.end());     vector\<int\> result;     int i \= 0, j \= 0;     while (i \< (int)a.size() && j \< (int)b.size()) {         if (a\[i\] \< b\[j\]) i++;         else if (a\[i\] \> b\[j\]) j++;         else { result.push\_back(a\[i\]); i++; j++; }     }     return result; } |
| :---- |

## **2.5 Subset check**

| bool isSubset(vector\<int\>& a, vector\<int\>& b) {     // returns true if a is a subset of b     unordered\_set\<int\> s(b.begin(), b.end());     for (int x : a) {         if (\!s.count(x)) return false;     }     return true; } |
| :---- |

## **2.6 Complexity summary**

| Operation | Hash set (average) | Sorted array / std::set |
| :---- | :---- | :---- |
| Insert | O(1) | O(log n) |
| Search / contains | O(1) | O(log n) |
| Union of two sets (size n, m) | O(n \+ m) | O(n \+ m) merge, needs sorted input |
| Intersection | O(n \+ m) | O(n \+ m) with two pointers on sorted input |
| Maintains sorted order? | No | Yes |

## **2.7 Applications**

* Removing duplicates from a collection.

* Checking membership quickly, for example a visited set in graph traversal (this connects directly back to BFS/DFS from the previous topic).

* Finding common elements between two datasets, for example mutual friends between two users.

* Database-style operations: SQL's UNION, INTERSECT, and EXCEPT clauses are set operations.

## **2.8 Interview Q\&A**

**Q: What is the difference between std::set and std::unordered\_set in C++?**

**A:** std::set is implemented as a balanced BST (typically Red-Black tree), keeps elements in sorted order, and gives O(log n) insert/search/erase. std::unordered\_set is implemented as a hash table, does not maintain order, and gives average O(1) insert/search/erase but O(n) worst case if many hash collisions occur.

**Q: When would you choose a hash-based set over a tree-based set?**

**A:** When you need the fastest possible average-case lookup and do not care about iterating the elements in sorted order. Choose the tree-based set when you need elements sorted, need range queries (like finding all elements between two values), or need worst-case guarantees rather than average-case.

**Q: How would you find the intersection of two very large arrays that might not fit comfortably in memory alongside a hash set?**

**A:** Sort both arrays first (or read them in sorted order if already sorted, such as from a database index), then use a two-pointer sweep, which needs only O(1) extra space beyond the arrays themselves, no hash table required.

**Q: How is a set related to what we covered about binary search trees?**

**A:** std::set is a direct real-world application of a self-balancing BST: it uses the same in-order-gives-sorted-values property and the same O(log n) search/insert/delete guarantees, just with automatic balancing to avoid the worst-case skewed tree.

## **2.9 Tips and tricks**

* If asked to implement set operations "from scratch", clarify whether hashing is allowed, if not, default to the sort-plus-two-pointer approach.

* Explicitly connect std::set back to BSTs, and unordered\_set back to hashing, interviewers like seeing you link topics together rather than treating them as isolated facts.

* Remember the STL algorithm names (set\_union, set\_intersection, set\_difference) require sorted ranges as input, a common mistake is calling them on unsorted vectors.

# **Part 3: General Notes**

## **Traversal quick-reference**

| Traversal | Order | Typical use |
| :---- | :---- | :---- |
| Inorder | Left, Root, Right | Get sorted values from a BST |
| Preorder | Root, Left, Right | Copy/serialize a tree |
| Postorder | Left, Right, Root | Delete a tree, evaluate expression trees |
| Level order | Breadth-first, by depth | Print tree level by level, shortest structural distance |

## **Structuring your answer when asked to "explain" a tree or set concept**

* 1\. Draw a small tree or Venn diagram on the board first.

* 2\. State the defining property in one sentence (BST ordering rule, or the set operation's definition).

* 3\. Trace the operation live on your drawing.

* 4\. Write the code.

* 5\. State time/space complexity, including the worst case and when it occurs.

## **Frequently repeated cross-cutting questions**

**Q: Why do BST operations and hash set operations both claim roughly O(log n) or O(1), yet interviewers still ask which one to use?**

**A:** Because the guarantees differ in nature: a hash set gives average O(1) but can degrade to O(n) on adversarial input or poor hash functions, while a balanced BST guarantees O(log n) even in the worst case and additionally preserves sorted order, which a hash set cannot provide at all.

**Q: As a UTA, how would you help a student who has memorised the traversal code but does not understand why the orders differ?**

**A:** Have them physically act out the recursion using a drawn tree and three sticky notes labelled L, Root, R, moving a token according to each traversal's order, seeing the token visit nodes in a different sequence for the same tree makes the distinction concrete rather than something to memorise as three separate code snippets.

## **Final checklist before the interview**

* Can you code all four traversals (inorder, preorder, postorder, level order) from memory in under 2 minutes each?

* Can you code BST search, insert, and delete, including all three deletion cases, without hesitation?

* Can you state why inorder traversal of a BST is sorted, in one sentence, without looking it up?

* Can you implement union/intersection/difference both with a hash set and with sorted arrays plus two pointers?

* Can you connect std::set back to BSTs and unordered\_set back to hashing when asked to compare them?

* Can you explain each topic starting from a drawing, the way you would teach a first-year student, not straight from code?