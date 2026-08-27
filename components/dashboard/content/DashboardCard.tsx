// DashboardCard.tsx
//
// Shared card shell for the "Charts row" and "Bottom row" panels in the
// Figma dashboard (node 136:31): 20px radius, white/79% fill, 30px
// backdrop blur, 10%-white hairline border. Matches those Figma nodes
// 1:1 (e.g. "Attendance Ring Chart" / "Weekly Attendance Bar Chart" /
// "Recent Check-ins" / "Recent Attendance Table" / "Quick Actions").
//
// Forwards its ref to the root <section> so animated cards (e.g. the
// Student dashboard's count-up cards) can use the card itself as a
// GSAP ScrollTrigger trigger/scope instead of adding an extra
// wrapping element around the card's content.
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  // Optional square icon badge rendered to the left of the title (e.g.
  // the Account Details page's section icons). Purely additive — every
  // existing DashboardCard usage omits this and renders exactly as
  // before.
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export const DashboardCard = forwardRef<HTMLElement, DashboardCardProps>(
  function DashboardCard(
    { title, subtitle, icon, action, className, headerClassName, bodyClassName, children },
    ref
  ) {
    return (
      <section
        ref={ref}
        className={cn(
          "rounded-[20px] border border-white/10 bg-white/[0.79] backdrop-blur-[30px]",
          className
        )}
      >
        {(title || action) && (
          <div
            className={cn(
              "flex items-center justify-between gap-3 px-[19px] pt-[19px]",
              headerClassName
            )}
          >
            {title && (
              <div className="flex min-w-0 items-center gap-3">
                {icon && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="text-[16px] leading-6 text-heading">{title}</h2>
                  {subtitle && (
                    <p className="mt-0.5 truncate text-[12.5px] font-medium text-heading/50">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
            {action}
          </div>
        )}
        <div className={bodyClassName}>{children}</div>
      </section>
    );
  }
);