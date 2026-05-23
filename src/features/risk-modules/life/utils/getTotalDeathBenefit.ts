function toNonNegative(value: number | undefined): number {
  return Math.max(0, value ?? 0);
}

export function getTotalDeathBenefit(
  groupLifeCoverage?: number,
  privateLifeCoverage?: number
): number {
  return toNonNegative(groupLifeCoverage) + toNonNegative(privateLifeCoverage);
}
