export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="card max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-800">Access suspended</h1>
        <p className="mt-2 text-slate-600">
          This tenant does not exist or the subscription has expired or been suspended. Please contact the platform
          administrator.
        </p>
      </div>
    </div>
  );
}
