export default function Header() {
  return (
    <div className="flex justify-between items-center mb-10">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Agentic AI Clinical System
        </h1>

        <p className="text-white/70">
          AI Powered Medical Decision Platform
        </p>
      </div>

      <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl text-white">
        AI Diagnosis
      </div>

    </div>
  );
}