import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { firstValueFrom, finalize } from 'rxjs';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';
import {
  Attachment,
  AttachmentType,
  getAttachmentFolderLabel,
  getAttachmentTypeIcon,
  getAttachmentTypeLabel
} from '../models/attachment.model';
import { DashboardSource, DashboardStats, EMPTY_DASHBOARD_STATS, FileFolder } from '../models/dashboard.model';
import { MOCK_FILE_STRUCTURE } from '../models/mock-data/dashboard.mock';
import { AttachmentsService } from '../service/attachments.service';
import { DashboardService } from '../service/dashboard.service';
import { LocaleDateService } from '../service/locale-date.service';
import { UI_ICONS } from '../shared/ui-icons';
import { isEditableShortcutTarget } from '../shared/keyboard-shortcuts';

interface Breadcrumb {
  name: string;
  path: string;
}

interface FileViewMode {
  mode: 'grid' | 'list';
  icon: LucideIconData;
  label: string;
}

type StatsCardKey = 'status' | 'tickets' | 'clients' | 'topClients' | 'storage' | 'parts';
type FileTypeFilter = AttachmentType | 'all';

interface FileTypeOption {
  key: FileTypeFilter;
  icon: LucideIconData;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule]
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly localeDate = inject(LocaleDateService);

  readonly stats = signal<DashboardStats>(EMPTY_DASHBOARD_STATS);
  readonly loading = signal(true);
  readonly source = signal<DashboardSource>('mock');
  readonly sourceMessage = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly selectedFileType = signal<FileTypeFilter>('all');
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showAllFiles = signal(true);
  readonly currentPath = signal('/');
  readonly folderIcon = UI_ICONS.folder;
  readonly statsCards: StatsCardKey[] = ['status', 'tickets', 'clients', 'topClients', 'storage', 'parts'];

  readonly fileStructure = computed(() => this.buildFileStructure());
  readonly currentFolder = computed(() => this.findFolder(this.currentPath()) || this.fileStructure());
  readonly statusChartMax = computed(() => Math.max(1, ...Object.values(this.stats().ticketsByStatus)));
  readonly ticketMonthMax = computed(() => Math.max(1, ...this.stats().ticketsByMonth.map((item) => item.count)));
  readonly clientGrowthMax = computed(() => Math.max(1, ...this.stats().clientGrowth.map((item) => item.total)));
  readonly partsUsageMax = computed(() => Math.max(1, ...this.stats().partsUsage.map((item) => item.count)));
  readonly statsCardRows = computed(() => this.buildStatsCardRows(this.statsCards, 4));
  readonly storageProgress = computed(() => {
    const usagePercent = this.stats().storage.usagePercent;
    if (usagePercent === null) {
      return 0;
    }

    return Math.min(100, Math.max(0, usagePercent));
  });

  readonly viewModes: FileViewMode[] = [
    { mode: 'grid', icon: UI_ICONS.grid, label: 'Grid' },
    { mode: 'list', icon: UI_ICONS.list, label: 'List' }
  ];

  readonly fileTypeOptions: FileTypeOption[] = [
    { key: 'all', icon: UI_ICONS.folders, label: 'Todos' },
    { key: 'image', icon: getAttachmentTypeIcon('image'), label: getAttachmentFolderLabel('image') },
    { key: 'document', icon: getAttachmentTypeIcon('document'), label: getAttachmentFolderLabel('document') },
    { key: 'spreadsheet', icon: getAttachmentTypeIcon('spreadsheet'), label: getAttachmentFolderLabel('spreadsheet') },
    { key: 'archive', icon: getAttachmentTypeIcon('archive'), label: getAttachmentFolderLabel('archive') },
    { key: 'other', icon: getAttachmentTypeIcon('other'), label: getAttachmentFolderLabel('other') }
  ];

  readonly filteredFiles = computed(() => {
    let files = this.showAllFiles() ? this.stats().recentFiles : this.currentFolder().files;
    const search = this.searchQuery().trim().toLowerCase();
    const type = this.selectedFileType();

    if (search) {
      files = files.filter((file) =>
        `${file.filename} ${file.fileFormat} ${file.tag ?? ''}`.toLowerCase().includes(search)
      );
    }

    if (type !== 'all') {
      files = files.filter((file) => file.fileType === type);
    }

    return [...files].sort(this.sortByDateDesc);
  });

  constructor() {
    this.loadDashboard();
  }

  @HostListener('window:keydown.alt.a', ['$event'])
  onToggleFilesShortcut(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (isEditableShortcutTarget(keyboardEvent.target)) {
      return;
    }

    keyboardEvent.preventDefault();
    this.toggleAllFiles();
  }

  getBreadcrumbs(): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [{ name: 'Root', path: '/' }];
    if (this.currentPath() === '/') {
      return breadcrumbs;
    }

    return [...breadcrumbs, ...this.findBreadcrumbs(this.fileStructure(), this.currentPath())];
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      received: '#86cecb',
      diagnosing: '#9ed8d5',
      waiting_parts: '#e12885',
      repairing: '#137a7f',
      repaired: '#59b7b3',
      returned: '#5f7f8a',
      cancelled: '#b55d8e'
    };
    return colors[status] || '#86cecb';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      received: 'Recibido',
      diagnosing: 'Diagnóstico',
      waiting_parts: 'Espera repuesto',
      repairing: 'Reparación',
      repaired: 'Reparado',
      returned: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] ?? status;
  }

  getFileTypeIcon(type: AttachmentType): LucideIconData {
    return getAttachmentTypeIcon(type);
  }

  getFileTypeLabel(type: AttachmentType): string {
    return getAttachmentTypeLabel(type);
  }

  getStatsRowClass(row: StatsCardKey[]): string {
    return `stats-row stats-row-count-${row.length}`;
  }

  getBarHeight(value: number, max: number): number {
    return Math.max(6, (value / max) * 100);
  }

  getPointLeft(index: number, total: number): number {
    if (total <= 1) {
      return 50;
    }
    return (index / (total - 1)) * 100;
  }

  formatDate(date: string): string {
    return this.localeDate.formatDateTime(date);
  }

  formatBytes(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined || bytes < 0) {
      return 'N/D';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  getStorageSourceLabel(): string {
    const source = this.stats().storage.source;
    if (source === 'configured') {
      return 'Cuota declarada';
    }

    if (source === 'filesystem') {
      return 'Disco detectado';
    }

    return 'Uso registrado';
  }

  hasStorageQuota(): boolean {
    return (this.stats().storage.totalBytes ?? 0) > 0;
  }

  navigateTo(path: string): void {
    this.currentPath.set(path);
  }

  toggleAllFiles(): void {
    this.showAllFiles.update((current) => !current);
    if (this.showAllFiles()) {
      this.currentPath.set('/');
    }
  }

  async previewFile(file: Attachment): Promise<void> {
    if (this.attachmentsService.isMockMode()) {
      alert('La previsualización solo está disponible con backend real.');
      return;
    }

    try {
      const fileBlob = await firstValueFrom(this.attachmentsService.downloadAttachment(file.id));
      const objectUrl = URL.createObjectURL(fileBlob);

      if (file.fileType === 'image' || file.fileFormat === 'pdf') {
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        return;
      }

      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = file.filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      alert('No se pudo abrir el archivo.');
    }
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.sourceMessage.set(null);

    this.dashboardService.getSnapshot()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (snapshot) => {
          this.stats.set(snapshot.stats);
          this.source.set(snapshot.source);
          this.sourceMessage.set(snapshot.message ?? null);
          this.currentPath.set('/');
        },
        error: (error) => {
          console.error('Error al cargar dashboard:', error);
          this.stats.set(EMPTY_DASHBOARD_STATS);
          this.source.set('fallback');
          this.sourceMessage.set('No se pudieron cargar datos del dashboard.');
        }
      });
  }

  private buildFileStructure(): FileFolder {
    if (this.source() === 'mock') {
      return {
        name: 'Root',
        path: '/',
        files: [],
        subfolders: MOCK_FILE_STRUCTURE
      };
    }

    const typeFolders = Array.from(
      this.stats().recentFiles.reduce((folders, file) => {
        const typePath = `/${file.fileType}`;
        const typeFolder = folders.get(file.fileType) ?? {
          name: getAttachmentFolderLabel(file.fileType),
          path: typePath,
          files: [] as Attachment[],
          subfolders: [] as FileFolder[]
        };

        typeFolder.files.push(file);
        const normalizedTag = file.tag?.trim();
        if (normalizedTag) {
          const subfolderPath = `${typePath}/${this.slugify(normalizedTag)}`;
          let subfolder = typeFolder.subfolders.find((folder) => folder.path === subfolderPath);

          if (!subfolder) {
            subfolder = {
              name: normalizedTag,
              path: subfolderPath,
              files: [],
              subfolders: []
            };
            typeFolder.subfolders.push(subfolder);
          }

          subfolder.files.push(file);
        }

        folders.set(file.fileType, typeFolder);
        return folders;
      }, new Map<AttachmentType, FileFolder>())
    )
      .map(([, folder]) => ({
        ...folder,
        files: [...folder.files].sort(this.sortByDateDesc),
        subfolders: [...folder.subfolders].sort((left, right) => left.name.localeCompare(right.name))
      }))
      .sort((left, right) => left.name.localeCompare(right.name));

    return {
      name: 'Root',
      path: '/',
      files: [],
      subfolders: typeFolders
    };
  }

  private findFolder(path: string): FileFolder | null {
    return this.findFolderRecursive(this.fileStructure(), path);
  }

  private findFolderRecursive(folder: FileFolder, path: string): FileFolder | null {
    if (folder.path === path) {
      return folder;
    }

    for (const subfolder of folder.subfolders) {
      const match = this.findFolderRecursive(subfolder, path);
      if (match) {
        return match;
      }
    }

    return null;
  }

  private findBreadcrumbs(folder: FileFolder, path: string): Breadcrumb[] {
    for (const subfolder of folder.subfolders) {
      if (subfolder.path === path) {
        return [{ name: subfolder.name, path: subfolder.path }];
      }

      const descendants = this.findBreadcrumbs(subfolder, path);
      if (descendants.length > 0) {
        return [{ name: subfolder.name, path: subfolder.path }, ...descendants];
      }
    }

    return [];
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private buildStatsCardRows(cards: StatsCardKey[], maxPerRow: number): StatsCardKey[][] {
    if (cards.length <= maxPerRow) {
      return [cards];
    }

    const firstRowSize = cards.length % maxPerRow || maxPerRow;
    const rows: StatsCardKey[][] = [cards.slice(0, firstRowSize)];

    for (let index = firstRowSize; index < cards.length; index += maxPerRow) {
      rows.push(cards.slice(index, index + maxPerRow));
    }

    return rows;
  }

  private readonly sortByDateDesc = (left: Attachment, right: Attachment) =>
    new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime();
}
