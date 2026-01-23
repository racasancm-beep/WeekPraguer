"use client";

import { SpaceForm } from "@/components/owner/space-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateListingPage() {
    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <Link href="/owner/dashboard">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Add New Space</h1>
                <p className="text-gray-500 mt-2">
                    Fill in the details below to list your office space for weekend rentals.
                </p>
            </div>

            <SpaceForm />
        </div>
    );
}
