import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-violet-500/5 to-purple-500/5 text-center">
                        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ScrollText className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Last Updated: January 15, 2026</p>
                    </div>

                    <div className="p-8 prose prose-violet dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Welcome to Weekend Space Booker. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Weekend Space Booker is a marketplace that connects building owners with individuals or organizations looking to rent office spaces specifically for weekend use (Friday 18:00 to Sunday 20:00).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. User Obligations</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Users must provide accurate information during registration and booking. Owners are responsible for the accuracy of their listings and ensuring the space is safe and as described. Renters are responsible for maintaining the space and following the owner's house rules.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Payment Terms</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                All payments are processed securely through our platform. Payouts to owners are typically processed on the Monday following a successful weekend booking, minus our service fees.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Cancellation Policy</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Our cancellation policy varies depending on the timing of the cancellation. Please refer to the specific listing for the owner's chosen cancellation terms.
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
                            <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
                                Have questions about our terms? Contact us at legal@weekpraguer.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
