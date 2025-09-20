export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-zinc max-w-(--breakpoint-md) mx-auto py-24">
      {children}
    </div>
  );
}
