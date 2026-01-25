import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GDPRPage() {
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
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Landmark className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GDPR Compliance</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Statement on Data Protection</p>
                    </div>

                    <div className="p-8 prose prose-emerald dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Commitment to GDPR</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                WeekPragueR is committed to protecting the privacy and security of our users' personal data. We comply with the General Data Protection Regulation (GDPR) for all users in the European Economic Area (EEA) and beyond.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Protection Principles</h2>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                <li><strong>Lawfulness, fairness, and transparency:</strong> We process data based on legal grounds and are transparent about our practices.</li>
                                <li><strong>Purpose limitation:</strong> Data is collected for specific, explicit, and legitimate purposes.</li>
                                <li><strong>Data minimization:</strong> We only collect data that is strictly necessary.</li>
                                <li><strong>Accuracy:</strong> We keep data up to date and correct inaccuracies.</li>
                                <li><strong>Storage limitation:</strong> Data is kept no longer than necessary.</li>
                                <li><strong>Integrity and confidentiality:</strong> We use appropriate security measures.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights Under GDPR</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                You have the right to access your data, rectify errors, erase data ("right to be forgotten"), restrict processing, and data portability. To exercise these rights, please contact our Data Protection Officer.
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                Contact our DPO: dpo@weekpragueR.com
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
