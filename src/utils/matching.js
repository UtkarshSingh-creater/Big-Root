export function calculateMatchScore(user, other) {
  let score = 0;

  const common = user.domain?.filter(d =>
    other.domain?.includes(d)
  );

  score += (common?.length || 0) * 5;

  if (user.branch === other.branch) score += 10;

  if (user.year && other.year) {
    const diff = Math.abs(user.year - other.year);
    score += Math.max(0, 10 - diff);
  }

  return score;
}