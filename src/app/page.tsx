// app/page.tsx

// Import the ClientSketchWrapper component, which ensures p5.js is rendered only on the client side
import ClientSketchWrapper from "@/components/ClientSketchWrapper";

export default function HomePage() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-slate-600 p-10">
      <ClientSketchWrapper />
    </main>
  );
}
