// InitialsAvatar.tsx
//
// Circular initials avatar used in place of the stock photo headshots
// in the Figma export (Recent Check-ins / Recent Attendance Table) —
// avoids embedding real people's photos from an unknown source. Same
// circle size/position as the source, just a generated fill instead
// of an <img>.
export function InitialsAvatar({
  initials,
  size = 36,
}: {
  initials: string;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      <span className="font-semibold">{initials}</span>
    </span>
  );
}
