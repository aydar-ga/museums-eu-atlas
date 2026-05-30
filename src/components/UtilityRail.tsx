import type { User } from "../types";
import { UserIcon } from "./Icons";
import { ThemeSwitcher } from "./ThemeSwitcher";

type UtilityRailProps = {
  user: User | null;
  onSignInOpen: () => void;
  onAccountOpen: () => void;
};

export function UtilityRail({ user, onSignInOpen, onAccountOpen }: UtilityRailProps) {
  return (
    <aside className="utility-rail" aria-label="Account and theme" data-testid="utility-rail">
      {user ? (
        <button
          type="button"
          className="utility-button"
          data-testid="account-link"
          aria-label="Account"
          title="Account"
          onClick={onAccountOpen}
        >
          <UserIcon />
        </button>
      ) : (
        <button
          type="button"
          className="utility-button"
          data-testid="login-link"
          aria-label="Sign in"
          title="Sign in"
          onClick={onSignInOpen}
        >
          <UserIcon />
        </button>
      )}
      <ThemeSwitcher />
    </aside>
  );
}
