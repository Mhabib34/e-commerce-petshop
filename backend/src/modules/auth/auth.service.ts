import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.ts";
import { authRepository } from "./auth.repository.ts";
import { ValidationError } from "../../errors/ValidationError.ts";
import { UnauthorizedError } from "../../errors/UnauthorizedError.ts";
import type { RegisterBody, LoginBody, AuthResponse } from "./auth.types.ts";

export const authService = {
  async register(body: RegisterBody): Promise<AuthResponse> {
    const existing = await authRepository.findByEmail(body.email);
    if (existing) {
      throw new ValidationError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await authRepository.create({
      ...body,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user };
  },

  async login(body: LoginBody): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return user;
  },
};