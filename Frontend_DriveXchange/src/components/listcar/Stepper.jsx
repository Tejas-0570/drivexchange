// src/components/listcar/Stepper.jsx
import { Icons } from "../dashboard/ui";

export default function Stepper({ steps, current, maxReached, onJump }) {
  return (
    <ol className="flex items-start" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = i <= maxReached && i !== current;
        const last = i === steps.length - 1;

        return (
          <li key={s.id} className={`flex items-start ${last ? "" : "flex-1"}`}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onJump(i)}
              aria-current={active ? "step" : undefined}
              className="group flex flex-col items-center gap-2 disabled:cursor-default"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                  done
                    ? "border-[#1a6bff] bg-[#1a6bff] text-white"
                    : active
                    ? "border-[#1a6bff] bg-white text-[#1a6bff] shadow-[0_0_0_5px_rgba(26,107,255,0.14)]"
                    : "border-[#e1ddd4] bg-white text-[#a8a59e]"
                } ${clickable ? "group-hover:scale-105" : ""}`}
              >
                {done ? <Icons.check width={16} height={16} /> : i + 1}
              </span>
              <span
                className={`hidden text-xs font-semibold sm:block ${
                  active ? "text-[#1a6bff]" : done ? "text-[#1c1c1e]" : "text-[#a8a59e]"
                }`}
              >
                {s.label}
              </span>
            </button>

            {!last && (
              <span className="mx-2 mt-[19px] h-[3px] flex-1 overflow-hidden rounded-full bg-[#ece8e0] sm:mx-3">
                <span
                  className="block h-full rounded-full bg-[#1a6bff] transition-all duration-500"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}