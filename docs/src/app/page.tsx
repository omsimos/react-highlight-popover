import { Demo } from "./components/Demo";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="mt-32 text-center">
        <h1 className="text-5xl font-bold">React Highlight Popover</h1>
        <Demo />
      </div>

      <div className="text-zinc-800 bg-zinc-50/50 rounded-lg shadow-sm border px-4 py-3 mt-24">
        <p>
          npm install{" "}
          <span className="font-semibold">
            @omsimos/react-highlight-popover
          </span>
        </p>
      </div>
    </main>
  );
}
