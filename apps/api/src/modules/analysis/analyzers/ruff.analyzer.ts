import { spawn } from "node:child_process";
import type { Analyzer, AnalysisCategory, StaticFinding } from "./analyzer.interface";

interface RuffMessage {
  code: string | null;
  message: string;
  location: { row: number; column: number };
}

function categoryForRuffCode(code: string | null): AnalysisCategory {
  if (!code) return "boas_praticas";
  if (code.startsWith("S")) return "seguranca";
  if (code.startsWith("F") || code.startsWith("E")) return "bugs";
  if (code.startsWith("C9") || code.startsWith("PERF")) return "performance";
  if (code.startsWith("N")) return "legibilidade";
  return "boas_praticas";
}

function runRuff(code: string): Promise<RuffMessage[]> {
  return new Promise((resolve, reject) => {
    const child = spawn("ruff", ["check", "--output-format=json", "--stdin-filename=snippet.py", "-"]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode !== 0 && exitCode !== 1) {
        reject(new Error(`ruff exited with code ${exitCode}: ${stderr}`));
        return;
      }
      try {
        resolve(stdout.trim() ? JSON.parse(stdout) : []);
      } catch (err) {
        reject(err);
      }
    });

    child.stdin.write(code);
    child.stdin.end();
  });
}

export class RuffAnalyzer implements Analyzer {
  language = "python";

  async analyze(code: string): Promise<StaticFinding[]> {
    let messages: RuffMessage[];
    try {
      messages = await runRuff(code);
    } catch {
      return [];
    }

    return messages.map((message) => ({
      location: `linha ${message.location.row}, coluna ${message.location.column}`,
      description: message.message,
      evidence: `Regra Ruff "${message.code ?? "desconhecida"}" na linha ${message.location.row}.`,
      ruleId: message.code ?? "unknown",
      category: categoryForRuffCode(message.code),
      severity: message.code?.startsWith("S") ? "ALTA" : "MEDIA",
    }));
  }
}
