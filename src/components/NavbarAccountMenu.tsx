"use client";
//avatar drop down component on the navbar

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

type NavbarAccountMenuProps = {
  name?: string | null;
  role?: string;
};

function getInitials(name?: string | null, role?: string) {
  if (name) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    if (initials) {
      return initials;
    }
  }

  return role ? role.charAt(0).toUpperCase() : "U";
}

export default function NavbarAccountMenu({ name, role }: NavbarAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false); //tracks whether navbar menu is open
  const avatarText = getInitials(name, role);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="navbar-account">
      <button
        type="button"
        className="navbar-avatar"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {avatarText}
      </button>

      {isOpen && (
        <div className="navbar-account-menu" aria-label="Account menu">
          <div className="navbar-account-summary">
            <strong>{name || "Account"}</strong>
            {role && <span>{role}</span>}
          </div>
          <Link href="/account" onClick={closeMenu}>Profile</Link>
          <Link href="/account/settings" onClick={closeMenu}>Settings</Link>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
