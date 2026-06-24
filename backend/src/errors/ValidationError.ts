import { AppError } from "./AppError.ts";

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public readonly errors?: Record<string, string[]>
  ) {
    super(message, 422, "VALIDATION_ERROR");
  }
}