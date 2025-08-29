"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Target, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", link: "/dashboard" },
  { name: "Focus", link: "/focus" },
  { name: "Tasks", link: "/tasks" },
  { name: "Analytics", link: "/stats" },
  { name: "Settings", link: "/settings" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback redirect
      window.location.href = "/";
    }
  };

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navigation} />
        
        {/* User Avatar */}
        <div className="flex items-center space-x-2 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-lg hover:bg-white/10 transition-all duration-300 p-0"
              >
                <Avatar className="h-8 w-8 border-2 border-white/20 shadow-lg">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium">
                    {session?.user?.name ? (
                      getInitials(session.user.name)
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white/10 backdrop-blur-xl border-white/20 rounded-xl shadow-2xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-gray-300">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem
                asChild
                className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10 rounded-lg"
              >
                <Link
                  href="/settings"
                  className="flex items-center cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10 rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center space-x-2">
            {/* Mobile User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-lg hover:bg-white/10 transition-all duration-300 p-0"
                >
                  <Avatar className="h-8 w-8 border-2 border-white/20 shadow-lg">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || ""}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium">
                      {session?.user?.name ? (
                        getInitials(session.user.name)
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white/10 backdrop-blur-xl border-white/20 rounded-xl shadow-2xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-gray-300">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  asChild
                  className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10 rounded-lg"
                >
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10 rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Navigation Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 md:hidden hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 rounded-lg"
                >
                  <MobileNavToggle
                    isOpen={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 sm:w-96 bg-white/10 backdrop-blur-xl border-white/20"
              >
                <SheetHeader className="pb-6">
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      Flowdoro
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.link;
                    return (
                      <div key={item.name}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-12 px-4 text-base font-medium transition-all duration-300 rounded-xl",
                            "hover:bg-white/10 hover:text-white",
                            "text-gray-300",
                            isActive && "bg-white/10 text-white"
                          )}
                          asChild
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href={item.link}>
                            {item.name}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-r-full" />
                            )}
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </nav>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                        {session?.user?.name ? (
                          getInitials(session.user.name)
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-300 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </MobileNavHeader>
      </MobileNav>
    </Navbar>
  );
}
