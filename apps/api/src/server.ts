import "dotenv/config";
import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { analysisRouter, projectAnalysesRouter } from "./modules/analysis/analysis.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { contextEntryRouter, projectContextRouter } from "./modules/context/context.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { projectRulesRouter, ruleRouter } from "./modules/rules/rules.routes";
import { teamsRouter } from "./modules/teams/teams.routes";
import { errorHandler } from "./infra/error-handler";

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

function isAllowedOrigin(origin: string): boolean {
  if (origin === WEB_ORIGIN) return true;
  // Em desenvolvimento, o Vite pode subir em outra porta se a padrão estiver ocupada;
  // aceitar qualquer localhost evita CORS quebrar só por causa disso.
  if (process.env.NODE_ENV !== "production" && LOCALHOST_ORIGIN.test(origin)) return true;
  return false;
}

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/teams", teamsRouter);
app.use("/projects", projectsRouter);
app.use("/projects/:projectId/rules", projectRulesRouter);
app.use("/rules", ruleRouter);
app.use("/projects/:projectId/context", projectContextRouter);
app.use("/context", contextEntryRouter);
app.use("/projects/:projectId/analyses", projectAnalysesRouter);
app.use("/analyses", analysisRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
