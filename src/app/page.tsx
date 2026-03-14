import { PokerTable } from '@/components/PokerTable';
import { TrainerTooltip } from '@/components/TrainerTooltip';
import { CheatSheet } from '@/components/CheatSheet';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] overflow-hidden relative">
      <CheatSheet />

      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center max-w-6xl mx-auto px-6">
        <PokerTable />
        <TrainerTooltip />
      </div>
    </main>
  );
}
