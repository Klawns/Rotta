import { type Client, type ClientDirectoryEntry } from '@/types/rides';

export function compareClientDirectoryEntries(
  left: Pick<ClientDirectoryEntry, 'id' | 'name' | 'isPinned'>,
  right: Pick<ClientDirectoryEntry, 'id' | 'name' | 'isPinned'>,
) {
  if (left.isPinned !== right.isPinned) {
    return left.isPinned ? -1 : 1;
  }

  const nameComparison = (left.name || '').localeCompare(right.name || '', 'pt-BR', {
    sensitivity: 'base',
  });

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return left.id.localeCompare(right.id);
}

export function toClientDirectoryEntry(
  client: Pick<Client, 'id' | 'name' | 'isPinned'>,
): ClientDirectoryEntry {
  return {
    id: client.id,
    name: client.name,
    isPinned: !!client.isPinned,
  };
}

export function mergeClientDirectoryEntries(
  clients: ClientDirectoryEntry[],
  extra?: ClientDirectoryEntry | null,
) {
  const items = extra ? [...clients, extra] : clients;

  return Array.from(new Map(items.map((item) => [item.id, item])).values()).sort(
    compareClientDirectoryEntries,
  );
}
