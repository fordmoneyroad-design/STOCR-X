import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PaymentMethodSelector({ onSelect, selectedMethod }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState(null);

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    
    return null;
  };

  const handleCardNumberChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
    
    const type = detectCardType(cleaned);
    setCardType(type);
    
    if (type) {
      onSelect(type === 'credit' ? 'credit_card' : 'debit_card');
    }
  };

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'debit_card', name: 'Debit Card', icon: CreditCard, description: 'Bank debit card' },
    { id: 'apple_pay', name: 'Apple Pay', icon: Smartphone, description: 'Quick & secure' },
    { id: 'google_pay', name: 'Google Pay', icon: Smartphone, description: 'Quick & secure' },
    { id: 'cash_app', name: 'Cash App', icon: DollarSign, description: 'Pay with Cash App' },
    { id: 'zelle', name: 'Zelle', icon: DollarSign, description: 'Direct bank transfer' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Select Payment Method</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedMethod === method.id
                ? 'border-2 border-blue-500 bg-blue-50'
                : 'border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <method.icon className={`w-8 h-8 ${
                selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div>
                <p className="font-semibold text-gray-900">{method.name}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Card Number Input with Detection */}
      {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Card Number</Label>
            <div className="relative">
              <Input
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="pr-24"
              />
              
              {/* Card Type Badge */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                {cardType === 'visa' && (
                  <Badge className="bg-blue-600">
                    <svg className="w-8 h-5" viewBox="0 0 48 32" fill="white">
                      <text x="4" y="20" fontSize="16" fontWeight="bold">VISA</text>
                    </svg>
                  </Badge>
                )}
                {cardType === 'mastercard' && (
                  <Badge className="bg-red-600">
                    <svg className="w-8 h-5" viewBox="0 0 48 32" fill="white">
                      <circle cx="12" cy="16" r="8" opacity="0.8" />
                      <circle cx="24" cy="16" r="8" opacity="0.8" />
                    </svg>
                  </Badge>
                )}
                {cardType === 'amex' && (
                  <Badge className="bg-blue-500">AMEX</Badge>
                )}
                {cardType === 'discover' && (
                  <Badge className="bg-orange-500">DISCOVER</Badge>
                )}
                {!cardType && cardNumber.length > 4 && (
                  <span className="text-gray-400 text-sm">Unknown</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Expiry Date</Label>
              <Input placeholder="MM/YY" maxLength={5} />
            </div>
            <div>
              <Label className="mb-2 block">CVV</Label>
              <Input placeholder="123" maxLength={4} type="password" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Cardholder Name</Label>
            <Input placeholder="John Doe" />
          </div>
        </div>
      )}

      {/* Digital Payment Instructions */}
      {selectedMethod === 'apple_pay' && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700">
            Click "Pay Now" to complete payment with Apple Pay on your device.
          </p>
        </Card>
      )}

      {selectedMethod === 'google_pay' && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700">
            Click "Pay Now" to complete payment with Google Pay.
          </p>
        </Card>
      )}

      {selectedMethod === 'cash_app' && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700 mb-2">
            Send payment to: <strong>$STOCRX</strong>
          </p>
          <p className="text-xs text-gray-600">Include your email in the note</p>
        </Card>
      )}

      {selectedMethod === 'zelle' && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700 mb-2">
            Send payment to: <strong>payments@stocrx.com</strong>
          </p>
          <p className="text-xs text-gray-600">Include your name and subscription ID</p>
        </Card>
      )}
    </div>
  );
}