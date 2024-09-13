import Link from "next/link";
import { Demo } from "./components/Demo";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="mt-32 text-center">
        <h1 className="text-5xl font-bold">Highlight Popover for React</h1>
        <Demo />
      </div>

      <section className="mt-16 flex items-center gap-3">
        <Link className="px-4 py-3 rounded-lg bg-zinc-900 text-white font-medium" href="/docs">
          Documentation
        </Link>

        <div className="text-zinc-800 bg-zinc-50/50 rounded-lg shadow-sm border px-4 py-3 ">
          <p>
            npm install{" "}
            <span className="font-semibold">
              @omsimos/react-highlight-popover
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
