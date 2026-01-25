import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Last Updated: January 15, 2026</p>
                    </div>

                    <div className="p-8 prose prose-blue dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Data Collection</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                We collect information that you provide directly to us, such as when you create an account, make a booking, or communicate with us. This includes your name, email address, phone number, and payment information.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                We use the information we collect to operate and improve our platform, process transactions, send notifications about bookings, and communicate with you about our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Data Sharing</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                We only share your information with third parties (like payment processors or owners/renters involved in a booking) as necessary to provide our services. We do not sell your personal information.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Your Data Rights</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting us.
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                Questions about privacy? Contact us at privacy@weekpragueR.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
