import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { currentTos } from "@/lib/tos";

export const dynamic = "force-dynamic";

export default async function TosPage() {
  const t = await currentTos();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <article className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {t.bodyMarkdown}
        </ReactMarkdown>
      </article>
      <p className="mt-8 text-xs text-gray-500">
        Version: <code>{t.version}</code>
      </p>
    </main>
  );
}
