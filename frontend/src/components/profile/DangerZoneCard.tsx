import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const DangerZoneCard: React.FC = () => {
  const { showToast } = useToast();

  const handleDeleteAccount = () => {
    showToast(
      "Account deletion requires confirmation. Feature coming soon.",
      "error"
    );
  };

  return (
    <Card className="border border-red-200 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600 dark:text-red-400">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <div className="mt-4">
          <Button
            variant="danger"
            data-testid="delete-account-button"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
