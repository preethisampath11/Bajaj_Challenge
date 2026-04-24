/**
 * Core data processor module for hierarchical tree analysis.
 * Handles validation, deduplication, cycle detection, and tree construction.
 */

// Processor module — validates edge strings, deduplicates, detects cycles,
// builds nested tree structures, and computes hierarchy summaries.
// All graph traversal uses iterative (non-recursive) approaches.

/**
 * Validates a single edge string.
 * Returns true only for format X->Y where X and Y are different uppercase letters.
 * @param {string} rawStr - Edge string to validate
 * @returns {boolean}
 */
function isValidEdge(rawStr) {
  const trimmed = rawStr.trim();
  
  if (trimmed === '') {
    return false;
  }
  
  const match = /^([A-Z])->([A-Z])$/.test(trimmed);
  
  if (!match) {
    return false;
  }
  
  const parts = trimmed.split('->');
  const source = parts[0];
  const target = parts[1];
  
  if (source === target) {
    return false;
  }
  
  return true;
}

/**
 * Separates first-seen edges from repeated ones.
 * Each duplicate string appears at most once in the duplicates array.
 * @param {string[]} edgeArray - Array of edge strings
 * @returns {{uniqueEdges: string[], duplicates: string[]}}
 */
function removeDuplicates(edgeArray) {
  const edgeTally = new Map();
  
  // First pass: count occurrences
  for (const edge of edgeArray) {
    const count = edgeTally.get(edge) || 0;
    edgeTally.set(edge, count + 1);
  }
  
  // Second pass: separate unique from duplicates
  const uniqueEdges = [];
  const duplicates = [];
  const seenDuplicate = new Set();
  
  for (const edge of edgeArray) {
    if (edgeTally.get(edge) === 1) {
      uniqueEdges.push(edge);
    } else {
      if (!seenDuplicate.has(edge)) {
        duplicates.push(edge);
        seenDuplicate.add(edge);
      }
    }
  }
  
  return { uniqueEdges, duplicates };
}

/**
 * Builds adjacency list.
 * First-encountered parent wins for any child node.
 * @param {string[]} edgeArray - Array of edge strings
 * @returns {{childMap: object, childSet: Set}}
 */
function buildChildMap(edgeArray) {
  const childMap = {};
  const childSet = new Set();
  const parentOf = {};
  
  for (const edge of edgeArray) {
    const [parentLabel, childLabel] = edge.split('->');
    
    // Skip if this child already has a parent (multi-parent rule)
    if (parentOf.hasOwnProperty(childLabel)) {
      continue;
    }
    
    parentOf[childLabel] = parentLabel;
    childSet.add(childLabel);
    
    // Ensure parent key exists in childMap
    if (!childMap.hasOwnProperty(parentLabel)) {
      childMap[parentLabel] = [];
    }
    
    childMap[parentLabel].push(childLabel);
  }
  
  return { childMap, childSet };
}

/**
 * Collects every unique node label from all edges.
 * @param {string[]} edgeArray - Array of edge strings
 * @returns {Set<string>}
 */
function collectAllNodeLabels(edgeArray) {
  const labelSet = new Set();
  
  for (const edge of edgeArray) {
    const [source, target] = edge.split('->');
    labelSet.add(source);
    labelSet.add(target);
  }
  
  return labelSet;
}

/**
 * Groups nodes into connected components using iterative BFS treating graph as undirected.
 * @param {Set<string>} labelSet - Set of all node labels
 * @param {object} childMap - Adjacency list (parent -> children)
 * @returns {Set<string>[]}
 */
function findConnectedGroups(labelSet, childMap) {
  const groups = [];
  const seenLabels = new Set();
  
  for (const label of labelSet) {
    if (seenLabels.has(label)) {
      continue;
    }
    
    // Start BFS for this component
    const currentGroup = new Set();
    const frontier = [label];
    
    while (frontier.length > 0) {
      const current = frontier.shift();
      
      if (seenLabels.has(current)) {
        continue;
      }
      
      currentGroup.add(current);
      seenLabels.add(current);
      
      // Find all neighbors (children from childMap)
      if (childMap.hasOwnProperty(current)) {
        for (const childLabel of childMap[current]) {
          if (!seenLabels.has(childLabel)) {
            frontier.push(childLabel);
          }
        }
      }
      
      // Find all neighbors (parents that have this node as child)
      for (const ancestorLabel of Object.keys(childMap)) {
        const children = childMap[ancestorLabel];
        if (children.includes(current) && !seenLabels.has(ancestorLabel)) {
          frontier.push(ancestorLabel);
        }
      }
    }
    
    groups.push(currentGroup);
  }
  
  return groups;
}

/**
 * Detects cycles using iterative DFS with explicit path tracking.
 * No recursion.
 * @param {string} startLabel - Starting node for DFS
 * @param {object} childMap - Adjacency list
 * @returns {boolean}
 */
function hasCycleInGroup(startLabel, childMap) {
  const callStack = [];
  callStack.push({ label: startLabel, pathSet: new Set([startLabel]) });
  
  while (callStack.length > 0) {
    const { label, pathSet } = callStack.pop();
    
    // Get children for this label
    const children = childMap[label] || [];
    
    for (const childLabel of children) {
      if (pathSet.has(childLabel)) {
        // Cycle detected
        return true;
      }
      
      const newPath = new Set([...pathSet, childLabel]);
      callStack.push({ label: childLabel, pathSet: newPath });
    }
  }
  
  return false;
}

/**
 * Builds a plain nested object representing the tree.
 * Uses BFS — no recursion.
 * @param {string} rootLabel - Root node label
 * @param {object} childMap - Adjacency list
 * @returns {object}
 */
function buildNestedTree(rootLabel, childMap) {
  const result = {};
  result[rootLabel] = {};
  
  const frontier = [{ label: rootLabel, ref: result[rootLabel] }];
  
  while (frontier.length > 0) {
    const { label, ref } = frontier.shift();
    
    const children = childMap[label] || [];
    
    for (const childLabel of children) {
      ref[childLabel] = {};
      frontier.push({ label: childLabel, ref: ref[childLabel] });
    }
  }
  
  return result;
}

/**
 * Returns node count on longest root-to-leaf path using BFS level tracking.
 * @param {string} rootLabel - Root node label
 * @param {object} childMap - Adjacency list
 * @returns {number}
 */
function calculateDepth(rootLabel, childMap) {
  const frontier = [{ label: rootLabel, level: 1 }];
  let maxDepth = 0;
  
  while (frontier.length > 0) {
    const { label, level } = frontier.shift();
    maxDepth = Math.max(maxDepth, level);
    
    const children = childMap[label] || [];
    
    for (const childLabel of children) {
      frontier.push({ label: childLabel, level: level + 1 });
    }
  }
  
  return maxDepth;
}

/**
 * Picks best root for a group.
 * Prefers natural roots; falls back to lex-smallest for pure cycles.
 * @param {Set<string>} groupSet - Set of node labels in group
 * @param {Set<string>} childSet - Set of all nodes that are children
 * @returns {string}
 */
function pickGroupRoot(groupSet, childSet) {
  // Find natural roots (nodes that are not children)
  const naturalRoots = [];
  
  for (const label of groupSet) {
    if (!childSet.has(label)) {
      naturalRoots.push(label);
    }
  }
  
  if (naturalRoots.length > 0) {
    // Return lexicographically smallest natural root
    naturalRoots.sort();
    return naturalRoots[0];
  }
  
  // No natural roots found, return lex-smallest from entire group
  const sortedGroup = Array.from(groupSet).sort();
  return sortedGroup[0];
}

/**
 * Computes summary stats across all hierarchy entries.
 * @param {object[]} hierarchies - Array of hierarchy objects
 * @returns {object}
 */
function buildSummary(hierarchies) {
  const nonCyclicTrees = hierarchies.filter(h => h.has_cycle !== true);
  
  const totalTrees = nonCyclicTrees.length;
  const totalCycles = hierarchies.length - totalTrees;
  
  let largestTreeRoot = '';
  
  if (nonCyclicTrees.length > 0) {
    // Sort by depth (descending), then by root (ascending) for tiebreak
    nonCyclicTrees.sort((a, b) => {
      if (b.depth !== a.depth) {
        return b.depth - a.depth;
      }
      return a.root.localeCompare(b.root);
    });
    largestTreeRoot = nonCyclicTrees[0].root;
  }
  
  return {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot
  };
}

/**
 * Main entry point: processes array of edge strings and returns structured analysis.
 * @param {string[]} dataArray - Array of edge strings (e.g., ["A->B", "B->C"])
 * @returns {object}
 */
function processData(dataArray) {
  const hierarchies = [];
  const invalidEntries = [];
  
  // Step 1: Separate valid from invalid edges
  const validEdges = [];
  for (const item of dataArray) {
    if (isValidEdge(item)) {
      validEdges.push(item.trim());
    } else {
      invalidEntries.push(item);
    }
  }
  
  // Step 2: Remove duplicates
  const { uniqueEdges, duplicates: duplicateEdges } = removeDuplicates(validEdges);
  
  // Step 3: Build child map
  const { childMap, childSet } = buildChildMap(uniqueEdges);
  
  // Step 4: Collect all node labels
  const allLabels = collectAllNodeLabels(uniqueEdges);
  
  // Step 5: Find connected groups
  const groups = findConnectedGroups(allLabels, childMap);
  
  // Step 6: Process each group
  for (const group of groups) {
    const rootLabel = pickGroupRoot(group, childSet);
    const isCyclic = hasCycleInGroup(rootLabel, childMap);
    
    if (isCyclic) {
      hierarchies.push({
        root: rootLabel,
        tree: {},
        has_cycle: true
      });
    } else {
      hierarchies.push({
        root: rootLabel,
        tree: buildNestedTree(rootLabel, childMap),
        depth: calculateDepth(rootLabel, childMap)
      });
    }
  }
  
  // Step 7: Build summary
  const summary = buildSummary(hierarchies);
  
  // Return complete result
  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary
  };
}

module.exports = { processData };
