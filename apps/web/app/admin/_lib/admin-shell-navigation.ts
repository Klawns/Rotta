export type AdminNavigationMatchMode = 'exact' | 'prefix';

export interface AdminNavigationItemInput {
  href: string;
  matchMode: AdminNavigationMatchMode;
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
    label: 'Painel',
    href: '/admin',
    matchMode: 'exact',
  },
  {
    label: 'Faturamento',
    href: '/admin/settings/finance/plans',
    matchMode: 'prefix',
  },
  {
    label: 'Sistema',
    href: '/admin/settings/system/global',
    matchMode: 'prefix',
  },
];

const ADMIN_SUB_NAVIGATION_GROUPS: AdminNavigationGroup[] = [
  {
    title: 'Faturamento',
    items: [
      {
        label: 'Planos',
        href: '/admin/settings/finance/plans',
        matchMode: 'exact',
      },
      {
        label: 'Cupons',
        href: '/admin/settings/finance/coupons',
        matchMode: 'exact',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        label: 'Global',
        href: '/admin/settings/system/global',
        matchMode: 'exact',
      },
      {
        label: 'Seguranca',
        href: '/admin/settings/system/security',
        matchMode: 'exact',
      },
      {
        label: 'Backups',
        href: '/admin/settings/system/backups',
        matchMode: 'exact',
      },
    ],
  },
];

function normalizeAdminPath(pathname: string | null | undefined) {
  if (!pathname) {
    return '/admin';
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function getNavigationPrefix(href: string) {
  return href.slice(0, href.lastIndexOf('/'));
}

export function isAdminNavigationItemActive(
  pathname: string | null | undefined,
  item: AdminNavigationItemInput,
) {
  const normalizedPath = normalizeAdminPath(pathname);
  const normalizedHref = normalizeAdminPath(item.href);

  if (item.matchMode === 'exact') {
    return normalizedPath === normalizedHref;
  }

  const prefix = getNavigationPrefix(normalizedHref);
  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${prefix}/`)
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

  const subNavigationGroup = ADMIN_SUB_NAVIGATION_GROUPS.find((group) =>
    group.title === primaryActiveItem.label,
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
