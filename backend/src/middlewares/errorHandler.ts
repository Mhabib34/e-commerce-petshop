import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.ts";
import { ValidationError } from "../errors/ValidationError.ts";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "root";
      if (!errors[key]) errors[key] = [];
      errors[key]!.push(issue.message);
    }
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // ValidationError (custom)
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // AppError (custom)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Unknown error
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}