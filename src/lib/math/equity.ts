/**
 * Calculates nCr (n choose r)
 */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < k; i++) {
    c = (c * (n - i)) / (i + 1);
  }
  return c;
}

/**
 * Calculates Win Probability (Equity) for 1-card Texas Hold'em.
 * High card wins. Suits do not matter.
 * 
 * @param myRank The rank of the player's card (2-14)
 * @param numOpponents Number of active opponents remaining
 * @returns A decimal between 0 and 1 representing the player's equity
 */
export function calculateEquity(myRank: number, numOpponents: number): number {
  if (numOpponents === 0) return 1;
  if (numOpponents < 0) return 0;

  // Ranks are 2 to 14
  // We hold 1 card of `myRank`.
  const M = 3; // Remaining cards of the exact same rank
  const L = (myRank - 2) * 4; // Lower cards
  const totalCards = 51;

  // The total subset of hands our opponents can hold.
  // We simply choose `numOpponents` cards out of the 51 remaining.
  const totalCombinations = choose(totalCards, numOpponents);

  // If any opponent holds a card from H (higher cards), we lose.
  // Thus, we only accumulate equity when all opponents draw from M + L.

  // Case 1: All opponents draw from L (lower cards). We win outright.
  const winCombinations = choose(L, numOpponents);
  let equity = winCombinations / totalCombinations;

  // Case 2: `k` opponents draw from M, and the remaining draw from L. 
  // We tie with `k` opponents and split the pot `k + 1` ways.
  const maxTies = Math.min(numOpponents, M);
  for (let k = 1; k <= maxTies; k++) {
    const tieCombinations = choose(M, k) * choose(L, numOpponents - k);
    
    // Pot splits (k + 1) ways
    equity += (tieCombinations / totalCombinations) / (k + 1);
  }

  return equity;
}
