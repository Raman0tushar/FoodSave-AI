import { RefreshCw } from "lucide-react";

function Loading({
  message = "Loading...",
}) {
  return (
    <div className="flex min-h-60 items-center justify-center">
      <div className="text-center">
        <RefreshCw
          size={30}
          className="mx-auto animate-spin text-green-600"
        />

        <p className="mt-3 text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Loading;