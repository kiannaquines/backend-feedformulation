import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
// Old SidebarLayout removed. This file is now empty and ready for new implementation.
export default function SidebarLayout({ children }) {
  return null;
}
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon name={icon} size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="font-semibold text-sm truncate">{user.username}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <Icon name="expand_more" size={18} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <Icon name="logout" size={16} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={24} />
            </Button>
            <h2 className="text-lg font-semibold hidden sm:block">
              {NAV.find(n => pathname === n.to)?.label || 'Dashboard'}
            </h2>
          </div>

          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <Icon name="logout" size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          © 2025 Feed Formulation System · Powered by Groq AI
        </footer>
      </div>
    </div>
  )
}
