import Link from "next/link";

const CONTACT_PHONE = "+252907700949";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Company not found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          There is no tenant registered for this subdomain. If you need access or want to set up your company on the platform, please contact us.
        </p>
        <div className="mt-6">
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-teal-700"
          >
            <span aria-hidden>📞</span>
            {CONTACT_PHONE}
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Call or WhatsApp to get started
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Back to dhisme.so
        </Link>
      </div>
    </div>
  );
}
