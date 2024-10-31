// app/page.tsx
import ClientSketch from "@/components/ClientSketch";

export default function HomePage() {
  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <ClientSketch />
    </main>
  );
}
