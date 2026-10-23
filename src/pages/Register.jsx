import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export default function Register() {
  return (
    <AuthLayout
      icon={UserX}
      title="Rejestracja jest wyłączona"
      subtitle="Nowe konta są tworzone wyłącznie przez administratora, przez zaproszenie."
    >
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Jeśli masz już konto, przejdź do strony logowania.
        </p>
        <Link to="/login">
          <Button className="w-full h-12 font-medium">Przejdź do logowania</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}