export function isBlockingFinding(severity: string, needsClarification: boolean | undefined): boolean {
  return severity === "ALTA" && Boolean(needsClarification);
}
