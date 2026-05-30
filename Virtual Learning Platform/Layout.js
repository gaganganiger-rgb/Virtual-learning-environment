
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import {
  Home, BookOpen, Users, Award, User as UserIcon,
  Settings, Sun, Moon, GraduationCap, Shield, LogOut,
  CreditCard, Library
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// User navigation items - Updated sidebar
const userNavigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Courses",
    url: createPageUrl("Courses"),
    icon: BookOpen,
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIChat"),
    icon: GraduationCap,
  },
  {
    title: "Library",
    url: createPageUrl("Library"),
    icon: Library,
  },
  {
    title: "Certificates",
    url: createPageUrl("Certificates"),
    icon: Award,
  },
];

// Admin navigation items - Updated to remove separate quiz management
const adminNavigationItems = [
  {
    title: "Admin Dashboard",
    url: createPageUrl("Admin"),
    icon: Shield,
  },
  {
    title: "User Management",
    url: createPageUrl("AdminUsers"),
    icon: Users,
  },
  {
    title: "Course Management",
    url: createPageUrl("AdminCourses"),
    icon: BookOpen,
  },
  {
    title: "Library Management",
    url: createPageUrl("AdminLibrary"),
    icon: Library,
  },
  {
    title: "Payment Management",
    url: createPageUrl("AdminPayments"),
    icon: CreditCard,
  },
  {
    title: "System Settings",
    url: createPageUrl("AdminSettings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      // Ensure user has a library card number, if not, assign their ID.
      if (!userData.library_card_number) {
        await User.updateMyUserData({ library_card_number: userData.id });
        userData.library_card_number = userData.id;
      }
      setUser(userData);
      setIsAdmin(userData.role === 'admin' || userData.is_admin);
      setTheme(userData.theme_preference || "light");
    } catch (error) {
      console.log("User not authenticated");
    }
    setIsLoading(false);
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (user) {
      await User.updateMyUserData({ theme_preference: newTheme });
    }
  };

  const handleLogin = async () => {
    await User.login();
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  useEffect(() => {
    document.title = "VirtEnv";
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Conditionally render based on page
  const isHomePage = currentPageName === 'Home';

  // Show public home page if user is not authenticated OR if it's the home page for an authenticated user
  if (!user || isHomePage) {
    return (
      <div className={theme}>
        <style>{`
          :root[data-theme="dark"] {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
          }
          body { transition: all 0.3s ease; }
        `}</style>
        {children}
      </div>
    );
  }

  // Admin interface
  if (isAdmin && (location.pathname.includes('/Admin') || currentPageName?.includes('Admin'))) {
    return (
      <div className={`${theme} min-h-screen bg-slate-900`}>
        <style>{`
          :root[data-theme="dark"] {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
          }
          body { transition: all 0.3s ease; }
        `}</style>

        <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900">
          <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">VirtEnv Admin</h1>
                  <p className="text-sm text-slate-400">Administrative Dashboard</p>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-2">
                  {adminNavigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === item.url
                          ? 'bg-red-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                </nav>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-slate-700">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profile_picture} />
                        <AvatarFallback className="bg-red-600 text-white">
                          {user?.full_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2">{user?.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem
                      onClick={() => window.location.href = createPageUrl("Dashboard")}
                      className="text-slate-300 hover:text-white"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      User Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleTheme} className="text-slate-300 hover:text-white">
                      {theme === "light" ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // User interface (for all pages except Home)
  return (
    <div className={theme}>
      <style>{`
        :root[data-theme="dark"] {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
        }
        body { transition: all 0.3s ease; }
        
        /* Enhanced light mode sidebar styles */
        .sidebar-enhanced {
          background: linear-gradient(180deg, rgb(248, 250, 252) 0%, rgb(241, 245, 249) 100%);
          border-right: 2px solid rgb(203, 213, 225);
        }
        
        .sidebar-header-enhanced {
          background: linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%);
          border-bottom: 1px solid rgb(191, 219, 254);
        }
        
        .sidebar-nav-item {
          color: rgb(51, 65, 85);
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .sidebar-nav-item:hover {
          background: linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%);
          color: rgb(255, 255, 255);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgb(34 197 94 / 0.3);
        }
        
        .sidebar-nav-item-active {
          background: linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%);
          color: rgb(255, 255, 255);
          box-shadow: 0 4px 12px rgb(34 197 94 / 0.4), 0 0 0 3px rgb(34 197 94 / 0.1);
          font-weight: 600;
        }
        
        .sidebar-progress-card {
          background: linear-gradient(135deg, rgb(240, 249, 255) 0%, rgb(224, 242, 254) 100%);
          border: 2px solid rgb(59, 130, 246);
          box-shadow: 0 4px 6px rgb(59 130 246 / 0.15);
        }
        
        .sidebar-progress-card h3 {
          color: rgb(30, 58, 138);
        }
        
        .sidebar-progress-card .progress-label {
          color: rgb(51, 65, 85);
          font-weight: 500;
        }
        
        .sidebar-footer-enhanced {
          background: linear-gradient(180deg, rgb(241, 245, 249) 0%, rgb(248, 250, 252) 100%);
          border-top: 2px solid rgb(203, 213, 225);
        }
        
        /* Enhanced dark mode sidebar styles */
        .dark .sidebar-enhanced {
          background: linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%);
          border-right: 1px solid rgb(51, 65, 85);
        }
        
        .dark .sidebar-header-enhanced {
          background: linear-gradient(135deg, rgb(22, 78, 99) 0%, rgb(30, 58, 138) 100%);
          border-bottom: 1px solid rgb(51, 65, 85);
        }
        
        .dark .sidebar-nav-item {
          color: rgb(203, 213, 225);
          transition: all 0.2s ease;
        }
        
        .dark .sidebar-nav-item:hover {
          background: linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(29, 78, 216) 100%);
          color: rgb(255, 255, 255);
          transform: translateX(4px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
        }
        
        .dark .sidebar-nav-item-active {
          background: linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%);
          color: rgb(255, 255, 255);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 0 0 3px rgb(34 197 94 / 0.2);
        }
        
        .dark .sidebar-progress-card {
          background: linear-gradient(135deg, rgb(21, 94, 117) 0%, rgb(13, 148, 136) 100%);
          border: 1px solid rgb(45, 212, 191);
          box-shadow: 0 0 20px rgb(20 184 166 / 0.2);
        }
        
        .dark .sidebar-footer-enhanced {
          background: linear-gradient(180deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%);
          border-top: 1px solid rgb(51, 65, 85);
        }
      `}</style>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-900 dark:to-green-900">
          <Sidebar className="sidebar-enhanced border-r border-slate-200 dark:border-slate-700">
            <SidebarHeader className="sidebar-header-enhanced border-b border-slate-200 dark:border-slate-700 p-6">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg">VirtEnv</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Learning Platform</p>
                </div>
              </Link>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <nav className="space-y-2">
                {userNavigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`sidebar-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-green-50 dark:hover:bg-green-900/50 ${
                      location.pathname === item.url
                        ? 'sidebar-nav-item-active bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="mt-6 p-4 sidebar-progress-card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-100 dark:border-green-800">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Progress</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="progress-label text-slate-700 dark:text-slate-300 font-medium">Points</span>
                      <Badge variant="secondary" className="bg-blue-600 text-white dark:bg-slate-700 dark:text-slate-200 font-semibold">{user.points || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="progress-label text-slate-700 dark:text-slate-300 font-medium">Streak</span>
                      <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50 dark:border-slate-600 dark:text-slate-300 dark:bg-transparent font-semibold">{user.streak_days || 0} days</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="progress-label text-slate-700 dark:text-slate-300 font-medium">Library Card</span>
                      <Badge className="bg-indigo-600 dark:bg-blue-600 text-xs font-mono text-white font-semibold shadow-sm">
                        {user.library_card_number || 'Not Assigned'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </SidebarContent>

            <SidebarFooter className="sidebar-footer-enhanced border-t border-slate-200 dark:border-slate-700 p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 h-auto dark:hover:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8 ring-2 ring-green-500/20 dark:ring-green-400/20">
                          <AvatarImage src={user.profile_picture} />
                          <AvatarFallback className="dark:bg-slate-700 dark:text-slate-200">{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 truncate">
                          Online
                        </p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                  <DropdownMenuItem 
                    onClick={() => {
                      window.location.href = createPageUrl("Profile");
                    }}
                    className="dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="dark:bg-slate-700" />
                      <DropdownMenuItem onClick={() => window.location.href = createPageUrl("Admin")} className="dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
                        <Shield className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-medium">Admin Panel</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={toggleTheme} className="dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer">
                    {theme === "light" ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-slate-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors" />
                <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">VirtEnv</h1>
                </Link>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
