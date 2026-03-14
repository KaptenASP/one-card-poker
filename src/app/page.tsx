import { PokerTable } from '@/components/PokerTable';
import { TrainerTooltip } from '@/components/TrainerTooltip';
import { CheatSheet } from '@/components/CheatSheet';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-emerald-500/30">
      <CheatSheet />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center max-w-7xl mx-auto px-4">
        <PokerTable />
        <TrainerTooltip />
      </div>
    </main>
  );
}
