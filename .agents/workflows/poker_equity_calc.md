---
description: How to calculate Win Probability (Equity) for 1-card Texas Hold'em using exact combinatorics
---

# Exact Combinatorics Poker Equity

When building poker trainers or game simulations where players only have 1 hole card and no community cards, you can calculate the exact $Equity$ (Expected Share of the Pot) mathematically rather than using Monte Carlo simulations.

## The Formula

$$Equity = P(\text{Win}) + \sum_{k=1}^{\min(n, M)} \left( \frac{P(\text{Tie with } k \text{ others})}{k+1} \right)$$

Where $n$ is the number of opponents, and $M$ is the number of remaining cards of the exact same rank as the hero's card (which equates to 3 for standard 52-card decks).

## Implementation (TypeScript)

Use the following highly-efficient exact logic:

```typescript
function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < k; i++) {
    c = (c * (n - i)) / (i + 1);
  }
  return c;
}

export function calculateEquity(myRank: number, numOpponents: number): number {
  if (numOpponents === 0) return 1;

  // We hold 1 card of `myRank`.
  const M = 3; // Remaining cards of the exact same rank
  const L = (myRank - 2) * 4; // Lower cards
  const totalCards = 51;

  // The total subset of hands our opponents can hold.
  const totalCombinations = choose(totalCards, numOpponents);

  // Case 1: All opponents draw from L (lower cards). We win outright.
  const winCombinations = choose(L, numOpponents);
  let equity = winCombinations / totalCombinations;

  // Case 2: `k` opponents draw from M, and the remaining draw from L. 
  // We tie with `k` opponents and split the pot `k + 1` ways.
  const maxTies = Math.min(numOpponents, M);
  for (let k = 1; k <= maxTies; k++) {
    const tieCombinations = choose(M, k) * choose(L, numOpponents - k);
    equity += (tieCombinations / totalCombinations) / (k + 1);
  }

  return equity;
}
```

## How to use this workflow
- If building a similar simulation, copy this module verbatim.
- The `choose` function prevents recursive stack explosions and handles symmetry naturally.
- The `calculateEquity` runs in $O(M)$ where $M$ is 3, making it virtually $O(1)$ constant time.
