import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { MOCK_DASHBOARD_STATS, DashboardStats } from '../models/mock-data/dashboard.mock';
import { AttachmentType, Attachment } from '../models/attachment.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FileFolder {
    name: string;
    path: string;
    subfolders: FileFolder[];
    files: Attachment[];
}

interface Breadcrumb {
    name: string;
    path: string;
}

interface FileViewMode {
    mode: 'grid' | 'list';
    icon: string;
    label: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class DashboardComponent {
    stats = signal<DashboardStats>(MOCK_DASHBOARD_STATS);
    searchQuery = signal('');
    selectedFileType = signal<AttachmentType | 'all'>('all');
    viewMode = signal<'grid' | 'list'>('grid');
    showAllFiles = signal(true);
    currentPath = signal('/');
    fileStructure = signal<FileFolder>({
        name: 'Root',
        path: '/',
        subfolders: [
            {
                name: 'Tickets',
                path: '/tickets',
                subfolders: [],
                files: []
            },
            {
                name: 'Contratos',
                path: '/contracts',
                subfolders: [],
                files: []
            },
            {
                name: 'Facturas',
                path: '/invoices',
                subfolders: [],
                files: []
            }
        ],
        files: []
    });
    
    viewModes: FileViewMode[] = [
        { mode: 'grid', icon: '◫', label: 'Cuadrícula' },
        { mode: 'list', icon: '≡', label: 'Lista' }
    ];

    fileTypes = {
        'all': { icon: '📁', label: 'Todos' },
        'photo': { icon: '📷', label: 'Fotos' },
        'contract': { icon: '📄', label: 'Contratos' },
        'invoice': { icon: '🧾', label: 'Facturas' },
        'other': { icon: '📎', label: 'Otros' }
    };

    // Computar archivos filtrados
    filteredFiles = computed(() => {
        let files: Attachment[];
        
        if (this.showAllFiles()) {
            files = this.stats().recentFiles;
        } else {
            const currentFolder = this.findFolder(this.currentPath());
            files = currentFolder?.files || [];
        }

        const search = this.searchQuery().toLowerCase();
        const type = this.selectedFileType();

        if (search) {
            files = files.filter(f => 
                f.filename.toLowerCase().includes(search)
            );
        }

        if (type !== 'all') {
            files = files.filter(f => f.fileType === type);
        }

        return files;
    });

    // Obtener la carpeta actual
    currentFolder = computed(() => {
        return this.findFolder(this.currentPath()) || this.fileStructure();
    });

    // Encontrar una carpeta por su ruta
    private findFolder(path: string): FileFolder | null {
        if (path === '/') return this.fileStructure();

        const parts = path.split('/').filter(p => p);
        let current = this.fileStructure();

        for (const part of parts) {
            const next = current.subfolders.find(f => f.name.toLowerCase() === part.toLowerCase());
            if (!next) return null;
            current = next;
        }

        return current;
    }

    // Obtener las migas de pan para la navegación
    getBreadcrumbs(): Breadcrumb[] {
        const parts = this.currentPath().split('/').filter(p => p);
        const breadcrumbs: Breadcrumb[] = [{ name: 'Root', path: '/' }];
        let currentPath = '';

        for (const part of parts) {
            currentPath += '/' + part;
            breadcrumbs.push({
                name: part,
                path: currentPath
            });
        }

        return breadcrumbs;
    }

    // Calcular el color para cada estado de ticket
    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'received': '#64B5F6',    // Azul claro
            'diagnosing': '#FFB74D',  // Naranja claro
            'waiting_parts': '#81C784', // Verde claro
            'repairing': '#FF8A65',   // Rojo claro
            'repaired': '#4CAF50',    // Verde
            'returned': '#9575CD',     // Violeta
            'cancelled': '#E57373'     // Rojo
        };
        return colors[status] || '#999';
    }

    // Manejo de archivos
    getFileTypeIcon(type: AttachmentType): string {
        return this.fileTypes[type]?.icon || this.fileTypes['other'].icon;
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Navegación
    navigateTo(path: string) {
        this.currentPath.set(path);
    }

    toggleAllFiles() {
        this.showAllFiles.update(current => !current);
        if (this.showAllFiles()) {
            this.currentPath.set('/');
        }
    }

    toggleViewMode() {
        this.viewMode.update(current => current === 'grid' ? 'list' : 'grid');
    }

    // Formatear números grandes
    formatNumber(num: number): string {
        return new Intl.NumberFormat('es-AR').format(num);
    }

    previewFile(fileType: AttachmentType) {
        // Aquí iría la lógica de preview
        console.log('Preview file of type:', fileType);
    }
}