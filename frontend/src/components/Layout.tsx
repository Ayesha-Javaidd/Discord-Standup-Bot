// import { useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { useAuth } from "@/components/AuthProvider";
// import { Button } from "@/components/ui/button";
// import {
//   Calendar,
//   Users,
//   MessageSquare,
//   BarChart3,
//   Menu,
//   X,
//   LogOut,
//   Shield,
// } from "lucide-react";

// const navigation = [
//   { name: "Dashboard", href: "/", icon: BarChart3 },
//   { name: "Check-ins", href: "/checkins", icon: Calendar },
//   { name: "Users", href: "/users", icon: Users },
//   { name: "Responses", href: "/responses", icon: MessageSquare },
// ];

// export const Layout = ({ children }: { children: React.ReactNode }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { logout } = useAuth();
//   const location = useLocation();

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//       `}
//       >
//         <div className="flex h-full flex-col">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-border">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-primary rounded-lg">
//                 <Shield className="w-5 h-5 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="font-bold text-foreground">Check-in Admin</h1>
//                 <p className="text-xs text-muted-foreground">
//                   Discord Bot Dashboard
//                 </p>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setSidebarOpen(false)}
//               className="lg:hidden"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-4 space-y-2">
//             {navigation.map((item) => {
//               const isActive = location.pathname === item.href;
//               return (
//                 <NavLink
//                   key={item.name}
//                   to={item.href}
//                   className={`
//                     flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
//                     ${
//                       isActive
//                         ? "bg-gradient-primary text-primary-foreground shadow-glow"
//                         : "text-muted-foreground hover:text-foreground hover:bg-muted"
//                     }
//                   `}
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   <item.icon className="w-4 h-4" />
//                   <span>{item.name}</span>
//                 </NavLink>
//               );
//             })}
//           </nav>

//           {/* Logout */}
//           <div className="p-4 border-t border-border">
//             <Button
//               variant="ghost"
//               onClick={logout}
//               className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
//             >
//               <LogOut className="w-4 h-4 mr-3" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:ml-64">
//         {/* Top bar */}
//         <div className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
//           <div className="flex items-center justify-between px-4 py-3">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden"
//             >
//               <Menu className="w-4 h-4" />
//             </Button>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-muted-foreground">
//                 Connected to Discord Bot API
//               </div>
//               <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
//             </div>
//           </div>
//         </div>

//         {/* Page content */}
//         <main className="p-6">{children}</main>
//       </div>
//     </div>
//   );
// };

import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  LogOut,
  Shield,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Check-ins", href: "/checkins", icon: Calendar },
  { name: "Users", href: "/users", icon: Users },
  { name: "Responses", href: "/responses", icon: MessageSquare },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-border">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Check-in Admin</h1>
              <p className="text-xs text-muted-foreground">
                Discord Bot Dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};
