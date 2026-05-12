export const siteConfig = {
  name: "NorthStar GAP Tool",
  url: "https://northstar.example.com",
  description: "Advisor income gap analysis and risk visualization workspace.",
  advisor: {
    name: "Elliott Miller",
    initials: "EM",
    email: "elliott.miller@northstar.com",
    firm: "North Star Resource Group",
  },
  baseLinks: {
    home: "/",
    dashboard: "/",
    clients: "/clients",
    settings: {
      general: "/settings",
      billing: "/settings/billing",
      users: "/settings/users",
    },
  },
}

export type SiteConfig = typeof siteConfig
