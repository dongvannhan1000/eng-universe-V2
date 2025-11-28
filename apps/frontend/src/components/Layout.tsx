"use client";

import type React from "react";
import { useEffect } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { verifyAuth } from "@/features/auth/slices/authSlice";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { AuthDialog } from "@/features/auth/components/AuthDialog";
import { Button } from "@/components/ui/button";
import vocabLogo from "../../assets/learning_lab_1.jpg";
import { openAuthDialog, closeAuthDialog } from "@/features/auth/slices/authDialogSlice";

// (Optional) nếu có lucide-react:
import { Sparkles, Rocket } from "lucide-react";
import FeedbackWidget from "./FeedbackWidget";

export const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { authDialogOpen } = useSelector((state: RootState) => state.authDialog);

  useEffect(() => {
    dispatch(verifyAuth());
  }, [dispatch]);

  const navLinkBase =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
  const navLinkActive = "bg-primary text-primary-foreground";
  const navLinkIdle = "text-muted-foreground hover:text-foreground hover:bg-accent";

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-primary-foreground px-3 py-2 rounded"
      >
        Skip to content
      </a>

      {/* Top Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand + Tagline */}
            <div className="flex items-center gap-8">
              <Link
                to="/vocabs"
                className="flex items-center gap-3 group transition-all"
                aria-label="EngUniverse home"
                title="EngUniverse — Chart your English galaxy"
              >
                <img
                  src={vocabLogo}
                  alt="EngUniverse Logo"
                  className="h-12 w-12 object-cover rounded-full transition-transform motion-safe:group-hover:scale-110"
                />
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-foreground/80 transition-colors">
                    EngUniverse
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground -mt-1">
                    Chart your English galaxy
                  </span>
                </div>
              </Link>

              {/* Primary Nav */}
              <div className="hidden md:flex gap-1">
                {/* Word Observatory link hidden - decks feature disabled */}

                <NavLink
                  to="/vocabs"
                  className={({ isActive }) =>
                    `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
                  }
                  aria-label="My Constellation — Curate and organize your stars"
                  title="My Constellation — Curate and organize your stars"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  My Constellation
                </NavLink>

                <NavLink
                  to="/review"
                  className={({ isActive }) =>
                    `${navLinkBase} ${isActive ? navLinkActive : navLinkIdle}`
                  }
                  aria-label="Training Mission — Complete today's review flight"
                  title="Training Mission — Complete today's review flight"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Training Mission
                </NavLink>
              </div>
            </div>

            {/* Auth / User */}
            <div className="flex items-center gap-2">
              {!isLoading &&
                (isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <Button
                    onClick={() => dispatch(openAuthDialog({ tab: "login" }))}
                    aria-label="Sign in to start your journey"
                    title="Sign in to start your journey"
                  >
                    Sign In
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Optional sub-header for page-level context (can hide on small screens) */}
      <div className="border-b border-border bg-background/60">
        <div className="container mx-auto px-4 py-2 text-xs sm:text-sm text-muted-foreground">
          <span className="align-middle">🚀 Ready for today's Training Mission? </span>
          <Link to="/review" className="ml-2 underline underline-offset-4 hover:text-foreground">
            Start now
          </Link>
        </div>
      </div>

      {/* Main */}
      <main id="main" className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={(open) =>
          open ? dispatch(openAuthDialog({ tab: "login" })) : dispatch(closeAuthDialog())
        }
      />

      <FeedbackWidget formUrl="https://forms.gle/JsFTfG5Wt4BJSyRk6" />
    </div>
  );
};
