import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DOCUMENTS = [
  {
    id: 1,
    name: "Tax Return 2024.pdf",
    type: "PDF",
    date: "2024-03-15",
    size: "2.4 MB",
    status: "Approved",
  },
  {
    id: 2,
    name: "Income Statement Q4.docx",
    type: "DOCX",
    date: "2024-02-20",
    size: "1.1 MB",
    status: "Pending",
  },
  {
    id: 3,
    name: "Business Expense Report.xlsx",
    type: "XLSX",
    date: "2024-01-30",
    size: "3.7 MB",
    status: "Approved",
  },
  {
    id: 4,
    name: "VAT Certificate 2023.pdf",
    type: "PDF",
    date: "2023-12-10",
    size: "0.9 MB",
    status: "Rejected",
  },
  {
    id: 5,
    name: "Payroll Summary Jan.pdf",
    type: "PDF",
    date: "2024-01-05",
    size: "1.8 MB",
    status: "Approved",
  },
  {
    id: 6,
    name: "Audit Report 2023.pdf",
    type: "PDF",
    date: "2023-11-22",
    size: "5.2 MB",
    status: "Pending",
  },
  {
    id: 7,
    name: "Asset Register.xlsx",
    type: "XLSX",
    date: "2024-02-14",
    size: "2.1 MB",
    status: "Approved",
  },
  {
    id: 8,
    name: "Directors Resolution.docx",
    type: "DOCX",
    date: "2024-03-01",
    size: "0.6 MB",
    status: "Pending",
  },
];

const DEMO_IMAGES = [
  { id: 1, src: "https://picsum.photos/seed/doc1/400/300", label: "Page 1" },
  { id: 2, src: "https://picsum.photos/seed/doc2/400/300", label: "Page 2" },
  { id: 3, src: "https://picsum.photos/seed/doc3/400/300", label: "Page 3" },
  { id: 4, src: "https://picsum.photos/seed/doc4/400/300", label: "Page 4" },
  { id: 5, src: "https://picsum.photos/seed/doc5/400/300", label: "Page 5" },
  { id: 6, src: "https://picsum.photos/seed/doc6/400/300", label: "Page 6" },
];

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-500/15 text-emerald-400",
  Pending: "bg-amber-500/15 text-amber-400",
  Rejected: "bg-red-500/15 text-red-400",
};

type Document = (typeof DOCUMENTS)[number];

function DocumentModal({
  doc,
  onClose,
}: {
  doc: Document;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 "
      onClick={onClose}
    >
      {/* <div className="absolute inset-0 bg-black/20 backdrop-blur-xs " /> */}

      <div
        className=" relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Document preview
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {doc.name}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {DEMO_IMAGES.map((img) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-muted/60"
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="h-40 w-full object-cover"
                />
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  {img.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
        <div className="border-b border-border/70 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            All files
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Documents
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Size</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((doc, i) => (
                <tr
                  key={doc.id}
                  className={`transition-colors hover:bg-muted/40 ${i !== DOCUMENTS.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.type}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.date}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[doc.status]}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs"
                      onClick={() => setActiveDoc(doc)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {activeDoc && (
        <DocumentModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
      )}
    </section>
  );
}
