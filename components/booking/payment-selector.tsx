"use client";

import { CreditCard, Wallet, Banknote } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
    return (
        <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Payment Method</h4>
            <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 gap-3">
                <div className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${value === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 flex items-center cursor-pointer">
                        <CreditCard className="w-5 h-5 mr-3 text-gray-500" />
                        <div className="flex-1">
                            <span className="block font-medium">Credit / Debit Card</span>
                            <span className="block text-xs text-gray-500">Powered by Stripe</span>
                        </div>
                    </Label>
                </div>

                <div className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${value === 'paypal' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 flex items-center cursor-pointer">
                        <Wallet className="w-5 h-5 mr-3 text-gray-500" />
                        <div className="flex-1">
                            <span className="block font-medium">PayPal</span>
                            <span className="block text-xs text-gray-500">Fast and secure</span>
                        </div>
                    </Label>
                </div>

                <div className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${value === 'invoice' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <RadioGroupItem value="invoice" id="invoice" />
                    <Label htmlFor="invoice" className="flex-1 flex items-center cursor-pointer">
                        <Banknote className="w-5 h-5 mr-3 text-gray-500" />
                        <div className="flex-1">
                            <span className="block font-medium">Invoice</span>
                            <span className="block text-xs text-gray-500">Net 30 terms (Approved businesses only)</span>
                        </div>
                    </Label>
                </div>
            </RadioGroup>
        </div>
    );
}
