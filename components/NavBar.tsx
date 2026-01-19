"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FileText, UserCircle, LogOut, Wand2 } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
  const pathname = usePathname();
  if(pathname.startsWith("/auth")) {
    return null;
  }
  const { data: session } = useSession();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="basis-[150px] flex justify-start items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2">
                <Image src="/logo.png" width={32} height={32} alt="Curate Logo" className="w-12 h-12 object-contain" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden h-full flex-1 sm:flex justify-center align-bottom sm:space-x-8">
            <NavLink href="/profile" active={isActive("/profile")} icon={<UserCircle className="w-5 h-5" />}>
              Profile
            </NavLink>
            <NavLink href="/curate" active={isActive("/curate")} icon={<Wand2 className="w-5 h-5" />}>
              Curate
            </NavLink>
          </div>

          {/* User / Sign Out */}
          <div className="basis-[150px] flex justify-end items-center gap-4">
            {session?.user && (
              <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary">
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    width={32}
                    height={32}
                    alt="User" 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-border flex items-center justify-center">
                    <span className="font-semibold text-primary">
                        {session.user.name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => signOut()}
              className="p-2 rounded-full text-text-secondary hover:text-danger hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="sm:hidden flex justify-around border-t border-border bg-white/50">
        <MobileNavLink href="/profile" active={isActive("/profile")} icon={<UserCircle className="w-5 h-5" />} label="Profile" />
        <MobileNavLink href="/curate" active={isActive("/curate")} icon={<Wand2 className="w-5 h-5" />} label="Curate" />
      </div>
    </nav>
  );
}

function NavLink({ href, active, children, icon }: { href: string; active: boolean; children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-text-secondary hover:text-text hover:border-gray-300"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center w-full py-3 ${
                active ? "text-primary bg-surface" : "text-text-secondary"
            }`}
        >
            {icon}
            <span className="text-xs mt-1 font-medium">{label}</span>
        </Link>
    )
}
