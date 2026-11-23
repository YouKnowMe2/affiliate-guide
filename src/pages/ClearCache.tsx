import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/queryClient";

const STORAGE_KEY = "ag.rq-cache";
const VERSION_KEY = "ag.cache-version";

function dropAllCache() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch {
    /* noop */
  }
  queryClient.clear();
  queryClient.invalidateQueries();
}

export default function ClearCachePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "clearing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const clear = async () => {
      setStatus("clearing");
      setMessage("Clearing local cache…");

      try {
        // 1) Drop client-side cache
        dropAllCache();

        // 2) Bump the server cache version so other clients also refresh
        const version = Date.now();
        const { error } = await supabase
          .from("cache_version")
          .update({
            version,
            updated_at: new Date().toISOString(),
            reason: "manual-clear-url",
          })
          .eq("id", 1);

        if (error) {
          console.warn("Could not bump server cache version:", error);
          setMessage("Local cache cleared. Server version update skipped.");
        } else {
          setMessage("All caches cleared and data refetched successfully.");
        }

        setStatus("done");
      } catch (err) {
        console.error("Cache clear error:", err);
        setStatus("error");
        setMessage("Something went wrong while clearing the cache.");
      }
    };

    clear();
  }, []);

  const handleBackHome = () => navigate("/");
  const handleRetry = () => window.location.reload();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Cache Clear</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          {status === "clearing" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === "done" && (
            <>
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={handleBackHome} className="mt-2">
                Back to Home
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="text-muted-foreground">{message}</p>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
                <Button onClick={handleBackHome}>Back to Home</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
