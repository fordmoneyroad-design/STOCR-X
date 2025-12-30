import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentManagement({ payments, subscriptions }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments?.filter(p => {
    const subscription = subscriptions?.find(s => s.id === p.subscription_id);
    return subscription?.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getCustomerEmail = (subscriptionId) => {
    const subscription = subscriptions?.find(s => s.id === subscriptionId);
    return subscription?.customer_email || 'Unknown';
  };

  return (
    <Card className="p-6 border-none shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-purple-600" />
          Payment Management
        </h2>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by customer email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Platform Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{getCustomerEmail(payment.subscription_id)}</TableCell>
                <TableCell className="capitalize">{payment.payment_type?.replace('_', ' ')}</TableCell>
                <TableCell className="font-bold">${payment.amount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={
                    payment.status === 'completed' ? 'bg-green-500' :
                    payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.created_date && new Date(payment.created_date).toLocaleDateString()}
                </TableCell>
                <TableCell>${payment.platform_fee?.toFixed(2) || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}