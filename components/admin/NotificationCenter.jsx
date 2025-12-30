import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationCenter({ pendingVehicles, pendingKYC, pendingApprovals }) {
  const totalNotifications = pendingVehicles + pendingKYC + pendingApprovals;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative border-gray-600 hover:bg-gray-700">
          <Bell className="w-5 h-5 text-yellow-400" />
          {totalNotifications > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-600 text-white px-2 py-1">
              {totalNotifications}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-800 border-gray-700">
        <div className="space-y-4">
          <h3 className="font-bold text-white">Notifications</h3>
          
          {totalNotifications === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No pending notifications
            </p>
          ) : (
            <>
              {pendingVehicles > 0 && (
                <Card className="p-3 bg-orange-900/30 border-orange-700">
                  <p className="text-orange-200 text-sm">
                    <strong>{pendingVehicles}</strong> vehicles awaiting approval
                  </p>
                </Card>
              )}
              
              {pendingKYC > 0 && (
                <Card className="p-3 bg-purple-900/30 border-purple-700">
                  <p className="text-purple-200 text-sm">
                    <strong>{pendingKYC}</strong> KYC verifications pending
                  </p>
                </Card>
              )}
              
              {pendingApprovals > 0 && (
                <Card className="p-3 bg-yellow-900/30 border-yellow-700">
                  <p className="text-yellow-200 text-sm">
                    <strong>{pendingApprovals}</strong> account approvals needed
                  </p>
                </Card>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}