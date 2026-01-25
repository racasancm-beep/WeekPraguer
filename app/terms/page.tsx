import Link from "next/link";
import { ArrowLeft, ScrollText, ShieldAlert, BadgePercent, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <div className="text-sm text-gray-500">Last Updated: January 25, 2026</div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-violet-500/5 to-purple-500/5 text-center">
                        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ScrollText className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legal Documents</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Terms of Service, Cancellation Policy & Service Fees</p>
                    </div>

                    {/* Navigation Tabs (Anchor Links) */}
                    <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto">
                        <a href="#terms" className="px-6 py-4 text-sm font-medium text-violet-600 border-b-2 border-violet-600 whitespace-nowrap">Terms of Service</a>
                        <a href="#cancellation" className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-violet-600 whitespace-nowrap">Cancellation Policy</a>
                        <a href="#fees" className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-violet-600 whitespace-nowrap">Service Fees</a>
                    </div>

                    <div className="p-8 lg:p-12 space-y-12">
                        {/* Section: Terms of Service */}
                        <section id="terms" className="scroll-mt-20">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <ScrollText className="w-6 h-6 text-violet-500" />
                                1. Terms of Service
                            </h2>
                            <div className="prose prose-violet dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                                <p>
                                    These Terms of Service ("Terms") form a binding legal agreement between you and [Your Company Name] ("Company," "we," "us," or "our"), a company organized under the laws of the Czech Republic with its principal place of business at [Company Address]. The Terms govern your access to and use of the Weekend Space Booker platform (the "Platform" or "App"), including our websites, mobile apps, and other offerings (collectively, the "Platform").
                                </p>
                                <p>
                                    The Platform connects Owners/ property managers (suppliers) (who list spaces) with Renters (who book spaces) for weekend-only rentals of empty office spaces in Prague, Czechia (Friday 18:00 to Sunday 20:00), along with related services such as Cleaning and administration.
                                </p>
                                <p>
                                    By accessing or using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy, Payments Terms of Service, Cancellation Policy, Service Fees Policy, Taxes Policy, Reviews Policy, Content Policy, Non-discrimination Policy, and any other policies or standards posted on the Platform or incorporated by reference (collectively, the "Additional Policies"). If you do not agree, you may not access or use the Platform.
                                </p>
                                <p>
                                    If you are using the Platform on behalf of a business or entity, you represent that you have authority to bind that entity to these Terms, and "you" will refer to that entity. The Platform is not intended for users under 18 years old. If you are under 18, you may not use the Platform.
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    We do not own, control, offer, or manage any Listings or Services. We are not a party to the contracts concluded directly between Owners and Renters, nor are we a real estate broker, agent, or insurer.
                                </p>

                                <div className="space-y-8 mt-10">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-violet-500 pl-4 uppercase tracking-wide text-sm">Renter Terms</h3>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">1. Searching and Booking on the Platform</h4>
                                        <p><strong>1.1 Searching.</strong> You can search for Listings by using criteria like location (Prague districts), dates (weekend-only), capacity, price, and amenities. Results are based on their relevance to your search.</p>
                                        <p><strong>1.2 Booking.</strong> When you book a Listing, you are agreeing to pay all charges including the Listing price, applicable fees, offline fees, taxes, and any other items (collectively, "Total Price"). When you receive the booking confirmation, a contract is formed directly between you and the Owner.</p>
                                        <p><strong>1.3 Reservations for Listings.</strong> A reservation is a limited license granted to you by the Owner to enter, occupy, and use the space for the duration of your stay. Temporary access codes are provided via integrations like Salto KS.</p>
                                        <p><strong>1.4 Cancellations and Modifications.</strong> If you cancel a reservation or decide not to participate, any refund will depend upon the cancellation policy that applies to that reservation.</p>

                                        <h4 className="font-bold text-gray-900 dark:text-white mt-6">2. Your Responsibilities</h4>
                                        <p>You are responsible for your own acts and omissions and are also responsible for the acts and omissions of anyone you invite. For example: (i) you are responsible for leaving a space in the condition it was in when you arrived, and (ii) you must act with integrity and treat others with respect.</p>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-violet-500 pl-4 mt-12 uppercase tracking-wide text-sm">Owner Terms</h3>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">3. Owners on the Platform</h4>
                                        <p>As an Owner, you are in control—set your price, availability (weekend-only), and rules for each Listing. When you accept a booking, you enter into a contract directly with the Renter.</p>
                                        <h4 className="font-bold text-gray-900 dark:text-white">4. Managing Your Listing</h4>
                                        <p>Your Listing must include accurate information. You are responsible for understanding and complying with any local laws, rules, and regulations that apply to your Listing (e.g., zoning laws, rent control).</p>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-violet-500 pl-4 mt-12 uppercase tracking-wide text-sm">Cleaner Terms</h3>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">5. Cleaning on the Platform</h4>
                                        <p>As a Cleaner, you provide mandatory cleaning services. Cleaners are selected by Owners or the Platform based on ratings and availability. The cleaning add-on is up to 15% of the rental price.</p>
                                        <h4 className="font-bold text-gray-900 dark:text-white">6. Performing Services</h4>
                                        <p>For each job, you must upload geo-tagged, time-stamped check-in (before) and check-out (after) photos via the App. Report any issues immediately to the Owner and Platform.</p>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-violet-500 pl-4 mt-12 uppercase tracking-wide text-sm">General Terms</h3>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">9. Reviews</h4>
                                        <p>After each Service, Renters and Owners will have an opportunity to review each other. Reviews must be accurate and truthful.</p>
                                        <h4 className="font-bold text-gray-900 dark:text-white">11. Fees</h4>
                                        <p>We charge a 25% commission from Renters. Additional details are in our Service Fees section below.</p>
                                        <h4 className="font-bold text-gray-900 dark:text-white">12. Platform Rules</h4>
                                        <p>Users must act with integrity, not scrape or hack the platform, and only use the platform as authorized. Off-platform bookings are strictly prohibited.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Section: Cancellation Policy */}
                        <section id="cancellation" className="scroll-mt-20">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <XCircle className="w-6 h-6 text-red-500" />
                                2. Cancellation Policy
                            </h2>
                            <div className="prose prose-red dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                                <p>
                                    Given the weekend-only nature of bookings (Friday 18:00 to Sunday 20:00), cancellation policies balance flexibility for Renters with protection for Owners.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Flexible Policy</h4>
                                        <p className="text-sm">Full refund if cancelled at least 24 hours before check-in (Friday 18:00).</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Moderate Policy</h4>
                                        <p className="text-sm">Full refund ≥5 days before; 50% refund if 2-5 days before; No refund if &lt;2 days.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Firm Policy</h4>
                                        <p className="text-sm">Full refund ≥7 days before; 50% if 2-7 days before; No refund if &lt;2 days.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Super Strict</h4>
                                        <p className="text-sm">50% refund if cancelled at least 7 days before check-in; no refund otherwise.</p>
                                    </div>
                                </div>
                                <p className="text-sm italic mt-4">
                                    Cleaning fees and insurance add-ons may vary in refundability. Service fees (25%) are generally non-refundable.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        {/* Section: Service Fees */}
                        <section id="fees" className="scroll-mt-20">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <BadgePercent className="w-6 h-6 text-emerald-500" />
                                3. Service Fees Policy
                            </h2>
                            <div className="prose prose-emerald dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                        <div>
                                            <div className="font-bold text-emerald-700 dark:text-emerald-400">Renter Service Fee</div>
                                            <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Commission on the booking subtotal</div>
                                        </div>
                                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">25%</div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">Owner Service Fee</div>
                                            <div className="text-sm">Deducted from Owner payout</div>
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">5%</div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">Cleaning Add-On</div>
                                            <div className="text-sm">Mandatory post-booking cleaning</div>
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">Up to 15%</div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <div>
                                            <div className="font-bold text-blue-700 dark:text-blue-400">Insurance Fee</div>
                                            <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Mandatory coverage for damages/liability</div>
                                        </div>
                                        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">50% of Total</div>
                                    </div>
                                </div>
                                <p className="text-sm font-medium mt-6">
                                    All fees are disclosed during checkout. Payouts to Owners and Cleaners are typically processed within 3-5 business days post-checkout.
                                </p>
                            </div>
                        </section>

                        <div className="mt-12 p-8 bg-violet-600 rounded-2xl text-white text-center shadow-lg shadow-violet-500/20">
                            <h3 className="text-xl font-bold mb-2">Have questions about our legal documents?</h3>
                            <p className="text-violet-100 mb-6">Our team is here to help you understand your rights and responsibilities.</p>
                            <a href="mailto:legal@weekpraguer.com">
                                <Button variant="secondary" className="px-8 font-semibold">Contact Legal Support</Button>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                    <p>© 2026 Weekend Space Booker. All rights reserved. Weekend Space Booker and the Weekend Space Booker logo are trademarks of [Your Company Name].</p>
                </div>
            </div>
        </div>
    );
}
