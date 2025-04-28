import { Moon, Sun } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { useTheme } from "../theme-provider";

export function DarkMode() {
  const { theme, setTheme } = useTheme();

  return (
    <Toggle
      pressed={theme === "dark"}
      onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="h-10 w-10 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-transform hover:scale-110" />
      ) : (
        <Moon className="h-4 w-4 transition-transform hover:scale-110" />
      )}
    </Toggle>
  );
}
