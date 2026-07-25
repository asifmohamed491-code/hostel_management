// FloatingCards.tsx
import { featureCards } from "@/lib/features";
import { FeatureCard } from "@/components/FeatureCard";

export function FloatingCards() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {featureCards.map((card) => (
        <FeatureCard key={card.id} card={card} />
      ))}
    </div>
  );
}