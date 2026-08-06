// StatCardsRow.tsx
//
// Matches Figma node 149:77 "Stat cards": 6 cards, each with its own
// gradient fill (copied 1:1 from the source node styles in
// lib/dashboard-mock.ts), equal width, single row.
import { STAT_CARDS } from "@/lib/dashboard-mock";

export function StatCardsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:flex xl:gap-4">
      {STAT_CARDS.map((card) => (
        <div
          key={card.id}
          className="flex flex-1 flex-col gap-1 rounded-[20px] border-2 border-white p-4 xl:p-5"
          style={{
            backgroundImage: card.gradient,
            boxShadow: card.shadow,
          }}
        >
          <p className="text-[13px] leading-5 text-heading/70 xl:text-sm">{card.label}</p>
          <p className="text-2xl font-medium text-heading xl:text-[30px]">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
