import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SecurityCardProps {
  onChangePassword: () => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  onChangePassword,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Update your password to keep your account secure.
        </p>
        <Button variant="outline" onClick={onChangePassword}>
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
};
