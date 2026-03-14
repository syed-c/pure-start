import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
}

export const SectionHeader = ({
  label,
  title,
  highlight,
  description,
  align = "center",
  className,
  dark = false
}: SectionHeaderProps) => {
  return (
    <div className={cn(
      "mb-14",
      align === "center" && "text-center",
      className
    )}>
      {label && (
        <span className="text-primary text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      )}
      <h2 className={cn(
        "text-3xl md:text-4xl lg:text-5xl font-black mt-3",
        dark ? "text-background" : "text-foreground"
      )} style={{ fontFamily: "'Outfit', sans-serif" }}>
        {title} {highlight && <span className="text-primary">{highlight}</span>}
      </h2>
      {description && (
        <p className={cn(
          "mt-5 max-w-2xl text-muted-foreground leading-relaxed",
          align === "center" && "mx-auto"
        )}>
          {description}
        </p>
      )}
    </div>
  );
};
