import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  BoxIcon,
  FolderIcon,
  ShootingStarIcon,
  TaskIcon,
  UserCircleIcon,
  DollarLineIcon,
  ChatIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <BoxIcon />,
    name: "Products",
    subItems: [
      { name: "Add product", path: "/product/add", pro: false },
      { name: "Attribute Management", path: "/product/attributes", pro: false },
      { name: "Manage Product", path: "/product/manage", pro: false }
    ]
  },
  {
    icon: <FolderIcon />,
    name: "Categories",
    subItems: [
      { name: "Add Category", path: "/category/add", pro: false },
      { name: "Category List", path: "/category/list", pro: false },
      { name: "Category Order", path: "/category/order", pro: false }
    ],
  },
  {
    icon: <ShootingStarIcon />,
    name: "Brands",
    subItems: [{ name: "Add brand", path: "/brand/add", pro: false }],
  },
  {
    icon: <UserCircleIcon />,
    name: "Customers",
    subItems: [
      { name: "Customer List", path: "/customer/list", pro: false },
      { name: "Add Customer", path: "/customer/add", pro: false },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Orders",
    subItems: [
      { name: "Order List", path: "/order/list", pro: false },
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Transactions",
    subItems: [
      { name: "Transaction List", path: "/transaction/list", pro: false },
    ],
  },
  {
    icon: <ChatIcon />,
    name: "Quote Requests",
    subItems: [
      { name: "Quote List", path: "/quote/list", pro: false },
    ],
  },
  {
    icon: <ShootingStarIcon />,
    name: "Promo Codes",
    subItems: [
      { name: "Promo List", path: "/promo/list", pro: false },
      { name: "Add Promo Code", path: "/promo/add", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Reports",
    path: "/reports",
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/calendar",
  // },
  // {
  //   icon: <UserCircleIcon />,
  //   name: "User Profile",
  //   path: "/profile",
  // },
  // {
  //   name: "Forms",
  //   icon: <ListIcon />,
  //   subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  // },
  // {
  //   name: "Tables",
  //   icon: <TableIcon />,
  //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  // },
  // {
  //   name: "Pages",
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: "Blank Page", path: "/blank", pro: false },
  //     { name: "404 Error", path: "/error-404", pro: false },
  //   ],
  // },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Locations",
    subItems: [
      { name: "State", path: "/location/state", pro: false },
      { name: "Zipcodes", path: "/location/zipcode", pro: false },
      { name: "Countries", path: "/location/country", pro: false },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Sliders",
    path: "/sliders",
  },
  // {
  //   icon: <TaskIcon />,
  //   name: "Loading Demo",
  //   path: "/loading-demo",
  // }
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Enhanced isActive function to handle dynamic routes
  const isActive = useCallback(
    (path: string) => {
      const currentPath = location.pathname;
      
      // Special case for root path - only match exact root
      if (path === "/") {
        return currentPath === "/";
      }
      
      // For exact matches (like main menu items)
      if (currentPath === path) {
        return true;
      }
      
      // Special case: When viewing order details, highlight "Order List" submenu item
      if (path === "/order/list" && currentPath.startsWith("/order/details/")) {
        return true;
      }
      
      // Special case: When viewing customer details, highlight "Customer List" submenu item
      if (path === "/customer/list" && currentPath.startsWith("/customer/") && currentPath !== "/customer/add") {
        return true;
      }
      
      // Special case: When viewing transaction details, highlight "Transaction List" submenu item
      if (path === "/transaction/list" && currentPath.startsWith("/transaction/details/")) {
        return true;
      }
      
      // Handle dynamic routes with parameters
      // Examples: /order/details matches /order/details/2
      //          /customer/list matches /customer/list
      //          /customer/:id matches /customer/123
      
      // Remove trailing slash for comparison
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
      
      // For non-root paths, check if current path starts with the menu path followed by '/'
      if (normalizedPath !== "" && normalizedCurrentPath.startsWith(normalizedPath + '/')) {
        return true;
      }
      
      return false;
    },
    [location.pathname]
  );

  // Helper function to check if a menu section should be active based on current route
  const isMenuSectionActive = useCallback(
    (nav: NavItem) => {
      const currentPath = location.pathname;
      
      // Special handling for Dashboard - only match exact root path
      if (nav.name === "Dashboard") {
        return currentPath === '/';
      }
      
      // Special handling for specific sections that need to include detail routes
      if (nav.name === "Orders") {
        return currentPath.startsWith('/order/');
      }
      
      if (nav.name === "Customers") {
        return currentPath.startsWith('/customer/');
      }
      
      if (nav.name === "Transactions") {
        return currentPath.startsWith('/transaction/');
      }
      
      if (nav.name === "Quote Requests") {
        return currentPath.startsWith('/quote/');
      }
      
      if (nav.name === "Promo Codes") {
        return currentPath.startsWith('/promo/');
      }
      
      if (nav.name === "Products") {
        return currentPath.startsWith('/product/');
      }
      
      if (nav.name === "Categories") {
        return currentPath.startsWith('/category/');
      }
      
      if (nav.name === "Brands") {
        return currentPath.startsWith('/brand/');
      }
      
      if (nav.name === "Locations") {
        return currentPath.startsWith('/location/');
      }
      
      // Check if any submenu item matches for other sections
      if (nav.subItems) {
        return nav.subItems.some(subItem => isActive(subItem.path));
      }
      
      // For single path items
      if (nav.path) {
        return isActive(nav.path);
      }
      
      return false;
    },
    [location.pathname, isActive]
  );

  useEffect(() => {
    let foundActiveMenu: { type: "main" | "others"; index: number } | null = null;
    
    // First check main menu items
    navItems.forEach((nav, index) => {
      if (isMenuSectionActive(nav) && !foundActiveMenu) {
        foundActiveMenu = { type: "main" as const, index };
      }
    });
    
    // If no main menu item is active, check others
    if (!foundActiveMenu) {
      othersItems.forEach((nav, index) => {
        if (isMenuSectionActive(nav) && !foundActiveMenu) {
          foundActiveMenu = { type: "others" as const, index };
        }
      });
    }
    
    // Always set the found active menu (this will automatically expand the section)
    setOpenSubmenu(foundActiveMenu);
  }, [location, isMenuSectionActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                isMenuSectionActive(nav)
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  isMenuSectionActive(nav)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <h1 className="text-2xl font-bold"> Logo</h1>
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        
      </div>
    </aside>
  );
};

export default AppSidebar;
