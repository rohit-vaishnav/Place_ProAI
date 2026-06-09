import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#000000",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "linear-gradient(135deg, #000000 0%, #000000 100%)", // soft academic mint as background
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <style>
          {`
            @keyframes shimmer-slide {
              0% {
                transform: translate3d(-100%, 0, 0);
              }
              100% {
                transform: translate3d(100%, 0, 0);
              }
            }
            @keyframes spin-around {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
            .shimmer-bg-sparkle {
              animation: spin-around 6s linear infinite;
            }
          `}
        </style>
        <button
          style={
            {
              "--spread": "90deg",
              "--shimmer-color": shimmerColor,
              "--radius": borderRadius,
              "--speed": shimmerDuration,
              "--cut": shimmerSize,
              "--bg": background,
            } as CSSProperties
          }
          className={cn(
            "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-neutral-300/30 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)] font-medium shadow-[0_4px_12px_rgba(165,200,158,0.35)] hover:shadow-[0_6px_16px_rgba(165,200,158,0.5)] transition-all duration-300",
            "transform-gpu hover:-translate-y-px active:translate-y-px",
            className
          )}
          ref={ref}
          {...props}
        >
          {/* spark container */}
          <div
            className={cn(
              "-z-30 blur-[2px]",
              "absolute inset-0 overflow-hidden"
            )}
          >
            {/* spark */}
            <div className="absolute inset-0 aspect-[1] h-full rounded-none [mask:none]">
              {/* spark before */}
              <div className="shimmer-bg-sparkle absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
            </div>
          </div>
          <span className="relative z-10 flex items-center gap-2">{children}</span>

          {/* Highlight */}
          <div
            className={cn(
              "absolute inset-0 size-full pointer-events-none",
              "rounded-full px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
              // transition
              "transform-gpu transition-all duration-300 ease-in-out",
              // on hover
              "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
              // on click
              "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
            )}
          />

          {/* backdrop */}
          <div
            className={cn(
              "absolute inset-[2px] -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
            )}
          />
        </button>
      </>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
