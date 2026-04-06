import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  BACKUP_MANIFEST_VERSION,
  DEFAULT_BACKUP_IMPORT_MAX_COMPRESSION_RATIO,
  DEFAULT_BACKUP_IMPORT_MAX_ENTRY_BYTES,
  DEFAULT_BACKUP_IMPORT_MAX_ENTRY_COUNT,
  DEFAULT_BACKUP_IMPORT_MAX_UNCOMPRESSED_BYTES,
} from '../backups.constants';
import {
  readZipArchiveFromSource,
  ZipArchiveValidationError,
} from '../utils/zip-reader.util';
import type { FunctionalBackupManifest } from './functional-backup-archive.service';
import type {
  FunctionalBackupImportDataset,
  ImportedBalanceTransactionRecord,
  ImportedClientPaymentRecord,
  ImportedClientRecord,
  ImportedRidePresetRecord,
  ImportedRideRecord,
  ParsedFunctionalBackupArchive,
} from './functional-backup-import.types';

@Injectable()
export class FunctionalBackupImportArchiveParserService {
  private readonly requiredFiles = [
    'manifest.json',
    'clients.json',
    'rides.json',
    'client-payments.json',
    'balance-transactions.json',
    'ride-presets.json',
  ] as const;

  async parseArchiveSource(
    source: AsyncIterable<Buffer | Uint8Array | string>,
    onChunk?: (chunk: Buffer) => Promise<void> | void,
  ): Promise<ParsedFunctionalBackupArchive> {
    try {
      const archiveHash = createHash('sha256');
      let sizeBytes = 0;
      const parsedEntries = this.createParsedEntriesState();

      await readZipArchiveFromSource(source, {
        allowedEntryNames: this.requiredFiles,
        blockNestedZip: true,
        maxCompressionRatio: DEFAULT_BACKUP_IMPORT_MAX_COMPRESSION_RATIO,
        maxEntries: DEFAULT_BACKUP_IMPORT_MAX_ENTRY_COUNT,
        maxEntryBytes: DEFAULT_BACKUP_IMPORT_MAX_ENTRY_BYTES,
        maxTotalUncompressedBytes: DEFAULT_BACKUP_IMPORT_MAX_UNCOMPRESSED_BYTES,
        onChunk: async (chunk) => {
          archiveHash.update(chunk);
          sizeBytes += chunk.length;

          if (onChunk) {
            await onChunk(chunk);
          }
        },
        onEntry: async (entry) => {
          this.assignParsedEntry(parsedEntries, entry.name, entry.content);
        },
      });

      return {
        dataset: this.buildDataset(parsedEntries),
        archiveChecksum: archiveHash.digest('hex'),
        sizeBytes,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ZipArchiveValidationError
      ) {
        throw error;
      }

      throw error;
    }
  }

  private createParsedEntriesState() {
    return {
      manifest: null as FunctionalBackupManifest | null,
      clients: null as ImportedClientRecord[] | null,
      rides: null as ImportedRideRecord[] | null,
      clientPayments: null as ImportedClientPaymentRecord[] | null,
      balanceTransactions: null as ImportedBalanceTransactionRecord[] | null,
      ridePresets: null as ImportedRidePresetRecord[] | null,
    };
  }

  private assignParsedEntry(
    parsedEntries: ReturnType<
      FunctionalBackupImportArchiveParserService['createParsedEntriesState']
    >,
    entryName: string,
    content: Buffer,
  ) {
    switch (entryName) {
      case 'manifest.json':
        parsedEntries.manifest = this.parseManifest(content);
        return;
      case 'clients.json':
        parsedEntries.clients = this.parseJsonArray<ImportedClientRecord>(
          content,
          entryName,
        );
        return;
      case 'rides.json':
        parsedEntries.rides = this.parseJsonArray<ImportedRideRecord>(
          content,
          entryName,
        );
        return;
      case 'client-payments.json':
        parsedEntries.clientPayments =
          this.parseJsonArray<ImportedClientPaymentRecord>(content, entryName);
        return;
      case 'balance-transactions.json':
        parsedEntries.balanceTransactions =
          this.parseJsonArray<ImportedBalanceTransactionRecord>(
            content,
            entryName,
          );
        return;
      case 'ride-presets.json':
        parsedEntries.ridePresets =
          this.parseJsonArray<ImportedRidePresetRecord>(content, entryName);
        return;
      default:
        throw new BadRequestException(`Arquivo inesperado no ZIP: ${entryName}.`);
    }
  }

  private buildDataset(
    parsedEntries: ReturnType<
      FunctionalBackupImportArchiveParserService['createParsedEntriesState']
    >,
  ): FunctionalBackupImportDataset {
    for (const fileName of this.requiredFiles) {
      if (this.getParsedEntry(parsedEntries, fileName) === null) {
        throw new BadRequestException(`Arquivo ausente no ZIP: ${fileName}.`);
      }
    }

    return {
      manifest: parsedEntries.manifest!,
      clients: parsedEntries.clients!,
      rides: parsedEntries.rides!,
      clientPayments: parsedEntries.clientPayments!,
      balanceTransactions: parsedEntries.balanceTransactions!,
      ridePresets: parsedEntries.ridePresets!,
    };
  }

  private getParsedEntry(
    parsedEntries: ReturnType<
      FunctionalBackupImportArchiveParserService['createParsedEntriesState']
    >,
    fileName: (typeof this.requiredFiles)[number],
  ) {
    switch (fileName) {
      case 'manifest.json':
        return parsedEntries.manifest;
      case 'clients.json':
        return parsedEntries.clients;
      case 'rides.json':
        return parsedEntries.rides;
      case 'client-payments.json':
        return parsedEntries.clientPayments;
      case 'balance-transactions.json':
        return parsedEntries.balanceTransactions;
      case 'ride-presets.json':
        return parsedEntries.ridePresets;
    }
  }

  private parseJsonArray<T>(value: Buffer, fileName: string): T[] {
    let parsed: unknown;

    try {
      parsed = JSON.parse(value.toString('utf8')) as unknown;
    } catch {
      throw new BadRequestException(`Conteudo JSON invalido em ${fileName}.`);
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException(`${fileName} deve conter um array JSON.`);
    }

    return parsed as T[];
  }

  private parseManifest(value: Buffer): FunctionalBackupManifest {
    let parsed: unknown;

    try {
      parsed = JSON.parse(value.toString('utf8')) as unknown;
    } catch {
      throw new BadRequestException('manifest.json invalido.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new BadRequestException('manifest.json invalido.');
    }

    const manifest = parsed as FunctionalBackupManifest;

    if (manifest.version !== BACKUP_MANIFEST_VERSION) {
      throw new BadRequestException(
        `Versao de backup nao suportada: ${manifest.version}.`,
      );
    }

    return manifest;
  }
}
