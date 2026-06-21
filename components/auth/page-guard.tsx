"use client";

import { useAuthorization } from "@/hooks/use-authorization";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PageGuard({
  pagePath,
  children,
}: {
  pagePath: string;
  children: React.ReactNode;
}) {
  const { hasPermission, isLoading } = useAuthorization();
  const router = useRouter();

  const allowed = hasPermission(pagePath, "View");

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace("/dashboard");
    }
  }, [isLoading, allowed, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#64748b]">Loading...</p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
