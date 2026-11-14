import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { extractReferralCode } from "@/lib/referral";

// Validation schema
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["OWNER", "RENTER"], {
        errorMap: () => ({ message: "Invalid user role" }),
    }),
    phone: z.string().optional(),
    referralCode: z.string().optional(),
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

        const { password, name, role, phone, referralCode } = result.data;
        const email = result.data.email.trim().toLowerCase();

        // Validate single-use referral QR code if provided
        let validReferralCodeRecord: any = null;
        if (referralCode && referralCode.trim()) {
            const cleanRefCode = extractReferralCode(referralCode);
            validReferralCodeRecord = await prisma.referralCode.findUnique({
                where: { code: cleanRefCode },
            });

            if (!validReferralCodeRecord) {
                return NextResponse.json(
                    { message: "Codul QR / de recomandare nu este valid." },
                    { status: 400 }
                );
            }

            if (validReferralCodeRecord.used) {
                return NextResponse.json(
                    { message: "Acest cod QR a fost deja utilizat pentru crearea unui cont (utilizare unică)." },
                    { status: 400 }
                );
            }
        }

        // Check if user already exists (case-insensitive)
        const existingUser = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: "insensitive",
                },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and link single-use referral in a transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    name: name.trim(),
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

            if (validReferralCodeRecord) {
                // Mark referral code as consumed (used once)
                await tx.referralCode.update({
                    where: { id: validReferralCodeRecord.id },
                    data: {
                        used: true,
                        usedAt: new Date(),
                        usedById: newUser.id,
                    },
                });

                // Record pending referral linking referrer and referee
                await tx.referral.create({
                    data: {
                        referrerId: validReferralCodeRecord.referrerId,
                        refereeId: newUser.id,
                        referralCodeId: validReferralCodeRecord.id,
                        status: "PENDING",
                    },
                });
            }

            return newUser;
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
