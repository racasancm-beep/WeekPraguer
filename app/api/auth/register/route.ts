import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Validation schema
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["OWNER", "RENTER", "CLEANER"], {
        errorMap: () => ({ message: "Invalid user role" }),
    }),
    phone: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { message: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email, password, name, role, phone } = result.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                phone,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong during registration" },
            { status: 500 }
        );
    }
}
