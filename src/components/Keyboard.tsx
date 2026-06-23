// src/components/Keyboard.tsx
import { KeyState } from '@/game/types'
import { Delete, CornerDownLeft } from 'lucide-react'

type FigmaKeyState = "default" | "correct" | "present" | "absent";

const PITACO_COLORS = {
  correct: 'bg-[#00B2A9]',
  present: 'bg-[#E3C275]',
  absent: 'bg-[#243447]',
  default: 'bg-[#2A4060]',
  hcCorrect: 'bg-[#E25F38]',
  hcPresent: 'bg-[#00B2A9]',
} as const

const PITACO_HEX = {
  correct: '#00B2A9',
  present: '#E3C275',
  absent: '#243447',
  default: '#2A4060',
  hcCorrect: '#E25F38',
  hcPresent: '#00B2A9',
} as const

const PITACO_TEXT = {
  onCorrect: 'text-[#1A2C40]',
  onPresent: 'text-[#1A2C40]',
  onDefault: 'text-white',
} as const

interface KeyProps {
  letter: string;
  state?: FigmaKeyState;
  states?: FigmaKeyState[];
  wide?: boolean;
  onClick?: () => void;
  gameMode?: "uno" | "duo" | "quadra";
  isHighContrast?: boolean;
  disabled?: boolean;
}

function Key({
  letter,
  state = "default",
  states,
  wide = false,
  onClick,
  gameMode = "uno",
  isHighContrast = false,
  disabled = false,
}: KeyProps) {
  const hasGradient = states && states.length > 1;

  const getStateColor = (s: FigmaKeyState) => {
    switch (s) {
      case "correct":
        return isHighContrast ? PITACO_COLORS.hcCorrect : PITACO_COLORS.correct;
      case "present":
        return isHighContrast ? PITACO_COLORS.hcPresent : PITACO_COLORS.present;
      case "absent":
        return PITACO_COLORS.absent;
      default:
        return PITACO_COLORS.default;
    }
  };

  const getStateTextColor = (s: FigmaKeyState) => {
    if (isHighContrast) return PITACO_TEXT.onDefault;
    if (s === "correct" || s === "present") return PITACO_TEXT.onCorrect;
    return PITACO_TEXT.onDefault;
  };

  const getGradientClass = () => {
    if (!states) return "";

    if (gameMode === "duo" && states.length === 2) {
      const color1 = getStateColor(states[0]);
      const color2 = getStateColor(states[1]);

      const gradientMap: Record<string, string> = {
        [`${PITACO_COLORS.correct}_${PITACO_COLORS.correct}`]: 'bg-gradient-to-r from-[#00B2A9] from-50% to-[#00B2A9] to-50%',
        [`${PITACO_COLORS.correct}_${PITACO_COLORS.present}`]: 'bg-gradient-to-r from-[#00B2A9] from-50% to-[#E3C275] to-50%',
        [`${PITACO_COLORS.correct}_${PITACO_COLORS.hcCorrect}`]: 'bg-gradient-to-r from-[#00B2A9] from-50% to-[#E25F38] to-50%',
        [`${PITACO_COLORS.correct}_${PITACO_COLORS.absent}`]: 'bg-gradient-to-r from-[#00B2A9] from-50% to-[#243447] to-50%',
        [`${PITACO_COLORS.correct}_${PITACO_COLORS.default}`]: 'bg-gradient-to-r from-[#00B2A9] from-50% to-[#2A4060] to-50%',
        [`${PITACO_COLORS.present}_${PITACO_COLORS.correct}`]: 'bg-gradient-to-r from-[#E3C275] from-50% to-[#00B2A9] to-50%',
        [`${PITACO_COLORS.present}_${PITACO_COLORS.present}`]: 'bg-gradient-to-r from-[#E3C275] from-50% to-[#E3C275] to-50%',
        [`${PITACO_COLORS.present}_${PITACO_COLORS.hcCorrect}`]: 'bg-gradient-to-r from-[#E3C275] from-50% to-[#E25F38] to-50%',
        [`${PITACO_COLORS.present}_${PITACO_COLORS.absent}`]: 'bg-gradient-to-r from-[#E3C275] from-50% to-[#243447] to-50%',
        [`${PITACO_COLORS.present}_${PITACO_COLORS.default}`]: 'bg-gradient-to-r from-[#E3C275] from-50% to-[#2A4060] to-50%',
        [`${PITACO_COLORS.hcCorrect}_${PITACO_COLORS.correct}`]: 'bg-gradient-to-r from-[#E25F38] from-50% to-[#00B2A9] to-50%',
        [`${PITACO_COLORS.hcCorrect}_${PITACO_COLORS.present}`]: 'bg-gradient-to-r from-[#E25F38] from-50% to-[#E3C275] to-50%',
        [`${PITACO_COLORS.hcCorrect}_${PITACO_COLORS.hcCorrect}`]: 'bg-gradient-to-r from-[#E25F38] from-50% to-[#E25F38] to-50%',
        [`${PITACO_COLORS.hcCorrect}_${PITACO_COLORS.absent}`]: 'bg-gradient-to-r from-[#E25F38] from-50% to-[#243447] to-50%',
        [`${PITACO_COLORS.hcCorrect}_${PITACO_COLORS.default}`]: 'bg-gradient-to-r from-[#E25F38] from-50% to-[#2A4060] to-50%',
        [`${PITACO_COLORS.absent}_${PITACO_COLORS.correct}`]: 'bg-gradient-to-r from-[#243447] from-50% to-[#00B2A9] to-50%',
        [`${PITACO_COLORS.absent}_${PITACO_COLORS.present}`]: 'bg-gradient-to-r from-[#243447] from-50% to-[#E3C275] to-50%',
        [`${PITACO_COLORS.absent}_${PITACO_COLORS.hcCorrect}`]: 'bg-gradient-to-r from-[#243447] from-50% to-[#E25F38] to-50%',
        [`${PITACO_COLORS.absent}_${PITACO_COLORS.absent}`]: 'bg-gradient-to-r from-[#243447] from-50% to-[#243447] to-50%',
        [`${PITACO_COLORS.absent}_${PITACO_COLORS.default}`]: 'bg-gradient-to-r from-[#243447] from-50% to-[#2A4060] to-50%',
        [`${PITACO_COLORS.default}_${PITACO_COLORS.correct}`]: 'bg-gradient-to-r from-[#2A4060] from-50% to-[#00B2A9] to-50%',
        [`${PITACO_COLORS.default}_${PITACO_COLORS.present}`]: 'bg-gradient-to-r from-[#2A4060] from-50% to-[#E3C275] to-50%',
        [`${PITACO_COLORS.default}_${PITACO_COLORS.hcCorrect}`]: 'bg-gradient-to-r from-[#2A4060] from-50% to-[#E25F38] to-50%',
        [`${PITACO_COLORS.default}_${PITACO_COLORS.absent}`]: 'bg-gradient-to-r from-[#2A4060] from-50% to-[#243447] to-50%',
        [`${PITACO_COLORS.default}_${PITACO_COLORS.default}`]: 'bg-gradient-to-r from-[#2A4060] from-50% to-[#2A4060] to-50%',
      };

      const key = `${color1}_${color2}`;
      return gradientMap[key] || color1;
    }

    if (gameMode === "quadra" && states.length === 4) {
      return "keyboard-quadra-gradient";
    }

    return "";
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (
      gameMode === "quadra" &&
      states &&
      states.length === 4
    ) {
      const colors = states.map((s) => {
        switch (s) {
          case "correct":
            return isHighContrast ? PITACO_HEX.hcCorrect : PITACO_HEX.correct;
          case "present":
            return isHighContrast ? PITACO_HEX.hcPresent : PITACO_HEX.present;
          case "absent":
            return PITACO_HEX.absent;
          default:
            return PITACO_HEX.default;
        }
      });
      return {
        background: `conic-gradient(from 0deg, ${colors[1]} 0deg 90deg, ${colors[3]} 90deg 180deg, ${colors[2]} 180deg 270deg, ${colors[0]} 270deg 360deg)`,
      };
    }
    return {};
  };

  const stateClass = hasGradient
    ? getGradientClass()
    : getStateColor(state);

  const textColorClass = hasGradient
    ? PITACO_TEXT.onDefault
    : getStateTextColor(state);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={getBackgroundStyle()}
      className={`
        ${wide ? "px-4 sm:px-6 md:px-7" : "px-2 sm:px-3 md:px-4"}
        py-2 sm:py-3.5 md:py-4
        rounded
        transition-all duration-200
        flex items-center justify-center
        min-w-[28px] sm:min-w-[36px] md:min-w-[44px]
        text-xs sm:text-base md:text-lg
        font-bold
        hover:brightness-110 active:scale-95
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${!hasGradient || gameMode !== "quadra" ? stateClass : ""}
        ${textColorClass}
      `}
    >
      {letter === "BACKSPACE" ? (
        <Delete className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      ) : letter === "ENTER" ? (
        <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      ) : (
        <span className="uppercase">{letter}</span>
      )}
    </button>
  );
}

interface KeyboardProps {
  keyStates: Record<string, KeyState[]>
  onKeyPress: (key: string) => void
  highContrast?: boolean
  disabled?: boolean
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACKSPACE'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'],
]

export function Keyboard({
  keyStates,
  onKeyPress,
  highContrast = false,
  disabled = false
}: KeyboardProps) {
  const boardCount = Object.keys(keyStates).length > 0
    ? keyStates[Object.keys(keyStates)[0]]?.length || 1
    : 1;

  const gameMode: "uno" | "duo" | "quadra" =
    boardCount === 1 ? "uno" : boardCount === 2 ? "duo" : "quadra";

  const convertToFigmaState = (state: KeyState): FigmaKeyState => {
    if (state === 'unused') return 'default';
    return state as FigmaKeyState;
  };

  const getFigmaKeyStates = (key: string): FigmaKeyState | FigmaKeyState[] | undefined => {
    const states = keyStates[key.toLowerCase()];

    if (!states || !Array.isArray(states) || states.length === 0) {
      return undefined;
    }

    const figmaStates = states.map(convertToFigmaState);

    const uniqueStates = [...new Set(figmaStates)];
    if (uniqueStates.length === 1) {
      return uniqueStates[0];
    }

    return figmaStates;
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5 z-10">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1.5 sm:gap-1.5 md:gap-2 justify-center"
        >
          {row.map((letter) => {
            const keyState = getFigmaKeyStates(letter);
            const isArray = Array.isArray(keyState);

            return (
              <Key
                key={letter}
                letter={letter}
                state={
                  isArray
                    ? "default"
                    : (keyState as FigmaKeyState) || "default"
                }
                states={
                  isArray ? (keyState as FigmaKeyState[]) : undefined
                }
                wide={letter === "ENTER" || letter === "BACKSPACE"}
                gameMode={gameMode}
                isHighContrast={highContrast}
                onClick={() => onKeyPress(letter)}
                disabled={disabled}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
