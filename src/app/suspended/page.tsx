export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="card w-full max-w-md text-center">
        <h1 className="page-title">Access suspended</h1>
        <p className="mt-3 text-sm text-slate-600">
          This tenant does not exist or the subscription has expired or been suspended. Please contact the platform
          administrator.
        </p>
      </div>
    </div>
  );
}
