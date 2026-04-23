export type AdminNavigationMatchMode = "exact" | "prefix";

export interface AdminNavigationItemInput {
  href: string;
  matchMode: AdminNavigationMatchMode;
  activePrefix?: string;
}

export interface AdminNavigationItem extends AdminNavigationItemInput {
  label: string;
}

export interface AdminResolvedNavigationItem extends AdminNavigationItem {
  isActive: boolean;
}

interface AdminNavigationGroup {
  title: string;
  items: AdminNavigationItem[];
}

const ADMIN_PRIMARY_NAVIGATION: AdminNavigationItem[] = [
  {
    label: "Visão Geral",
    href: "/admin/overview",
    matchMode: "exact",
  },
  {
    label: "Usuários",
    href: "/admin/users",
    matchMode: "prefix",
    activePrefix: "/admin/users",
  },
  {
    label: "Faturamento",
    href: "/admin/billing",
    matchMode: "prefix",
    activePrefix: "/admin/billing",
  },
  {
    label: "Sistema",
    href: "/admin/system/global",
    matchMode: "prefix",
    activePrefix: "/admin/system",
  },
];

const ADMIN_SUB_NAVIGATION_GROUPS: AdminNavigationGroup[] = [
  {
    title: "Faturamento",
    items: [
      {
        label: "Resumo",
        href: "/admin/billing",
        matchMode: "exact",
      },
      {
        label: "Planos",
        href: "/admin/billing/plans",
        matchMode: "exact",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        label: "Global",
        href: "/admin/system/global",
        matchMode: "exact",
      },
      {
        label: "Segurança",
        href: "/admin/system/security",
        matchMode: "exact",
      },
      {
        label: "Backups",
        href: "/admin/system/backups",
        matchMode: "exact",
      },
    ],
  },
];

function normalizeAdminPath(pathname: string | null | undefined) {
  if (!pathname) {
    return "/admin";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isAdminNavigationItemActive(
  pathname: string | null | undefined,
  item: AdminNavigationItemInput,
) {
  const normalizedPath = normalizeAdminPath(pathname);
  const normalizedHref = normalizeAdminPath(item.href);

  if (item.matchMode === "exact") {
    return normalizedPath === normalizedHref;
  }

  const prefix = normalizeAdminPath(item.activePrefix ?? normalizedHref);
  return (
    normalizedPath === normalizedHref || normalizedPath.startsWith(`${prefix}/`)
  );
}

function resolveNavigationItems(
  pathname: string | null | undefined,
  items: AdminNavigationItem[],
): AdminResolvedNavigationItem[] {
  return items.map((item) => ({
    ...item,
    isActive: isAdminNavigationItemActive(pathname, item),
  }));
}

export function getAdminShellNavigation(pathname: string | null | undefined) {
  const primaryNavigation = resolveNavigationItems(
    pathname,
    ADMIN_PRIMARY_NAVIGATION,
  );
  const primaryActiveItem =
    primaryNavigation.find((item) => item.isActive) ?? primaryNavigation[0];

  const subNavigationGroup = ADMIN_SUB_NAVIGATION_GROUPS.find(
    (group) => group.title === primaryActiveItem.label,
  );

  return {
    primaryNavigation,
    primaryActiveItem,
    subNavigation: subNavigationGroup
      ? {
          title: subNavigationGroup.title,
          items: resolveNavigationItems(pathname, subNavigationGroup.items),
        }
      : null,
  };
}
