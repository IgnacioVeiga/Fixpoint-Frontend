import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttachmentUploaderComponent } from '../../shared/attachment-uploader/attachment-uploader.component';
import { Client } from '../../models/client.model';
import { InventoryItem } from '../../models/inventory.model';
import { CreateTicketLogRequest, TicketLog } from '../../models/ticket-log.model';
import { AddTicketPartRequest, TicketPart } from '../../models/ticket-part.model';
import { SaveTicketRequest, TicketStatus, TicketStatusDefinition } from '../../models/ticket.model';
import { ClientsService } from '../../service/clients.service';
import { InventoryService } from '../../service/inventory.service';
import { TicketLogsService } from '../../service/ticket-logs.service';
import { TicketPartsService } from '../../service/ticket-parts.service';
import { TicketsService } from '../../service/tickets.service';
import { LocaleDateService } from '../../service/locale-date.service';
import { EnterMovesFocusDirective } from '../../shared/enter-moves-focus.directive';

type StatusOption = { value: TicketStatus; label: string };

const STATUS_LABELS: Record<TicketStatus, string> = {
  received: 'Recibido',
  diagnosing: 'Diagnostico',
  waiting_parts: 'Esperando repuesto',
  repairing: 'En reparacion',
  repaired: 'Finalizado',
  returned: 'Devuelto',
  cancelled: 'Cancelado'
};

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AttachmentUploaderComponent, EnterMovesFocusDirective]
})
export class TicketFormComponent {
  private readonly ticketService = inject(TicketsService);
  private readonly localeDate = inject(LocaleDateService);
  private readonly clientService = inject(ClientsService);
  private readonly inventoryService = inject(InventoryService);
  private readonly ticketLogService = inject(TicketLogsService);
  private readonly ticketPartService = inject(TicketPartsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly isEditing = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly clients = signal<Client[]>([]);
  readonly inventoryItems = signal<InventoryItem[]>([]);
  readonly ticketLogs = signal<TicketLog[]>([]);
  readonly ticketParts = signal<TicketPart[]>([]);
  readonly statusDefinitions = signal<TicketStatusDefinition[]>(this.fallbackStatusDefinitions());
  readonly currentTicketStatus = signal<TicketStatus | null>(null);
  readonly deviceTypeSuggestions = ['Televisor', 'Celular', 'Notebook', 'Tablet', 'Impresora', 'Router'];
  readonly authorSuggestions = ['Mostrador', 'Taller', 'Tecnico', 'Recepcion'];
  readonly inventorySuggestions = computed(() =>
    this.inventoryItems()
      .slice()
      .sort((left, right) => right.quantity - left.quantity || left.name.localeCompare(right.name))
  );
  readonly statusOptions = computed<StatusOption[]>(() =>
    this.resolveVisibleStatuses().map((status) => ({
      value: status.value,
      label: STATUS_LABELS[status.value]
    }))
  );

  readonly form: FormGroup = this.formBuilder.group({
    clientId: [null, Validators.required],
    deviceType: ['', Validators.required],
    brand: [''],
    model: [''],
    serialNumber: [''],
    entryDate: [new Date().toISOString().slice(0, 10), Validators.required],
    problemDescription: ['', Validators.required],
    status: ['received', Validators.required],
    needsContract: [false],
    contractSigned: [false],
    createdBy: ['']
  });

  readonly logForm: FormGroup = this.formBuilder.group({
    description: ['', Validators.required],
    author: ['']
  });

  readonly partForm: FormGroup = this.formBuilder.group({
    inventoryId: [null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    note: ['']
  });

  constructor() {
    this.loadStatusDefinitions();
    this.loadClients();
    this.loadInventory();
    this.loadCurrentTicketIfNeeded();
  }

  @HostListener('window:keydown.control.s', ['$event'])
  @HostListener('window:keydown.meta.s', ['$event'])
  onKeyboardSave(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  @HostListener('window:keydown.escape', ['$event'])
  onCancelShortcut(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.defaultPrevented || keyboardEvent.altKey || keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.shiftKey) {
      return;
    }

    keyboardEvent.preventDefault();
    this.cancel();
  }

  cancel(): void {
    const hasPendingChanges = this.form.dirty || this.logForm.dirty || this.partForm.dirty;
    if (hasPendingChanges && !confirm('Hay cambios sin guardar. ¿Querés cancelar igualmente?')) {
      return;
    }

    void this.router.navigate(['/tickets']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toTicketPayload();
    if (this.isEditing()) {
      const id = this.editingId();
      if (!id) return;

      this.ticketService.updateTicket(id, payload).subscribe({
        next: () => void this.router.navigate(['/tickets']),
        error: (error) => {
          console.error('Error al actualizar ticket:', error);
          alert(this.extractErrorMessage(error, 'No se pudo actualizar el ticket.'));
        }
      });
      return;
    }

    this.ticketService.createTicket(payload).subscribe({
      next: (ticket) => void this.router.navigate(['/tickets', ticket.id]),
      error: (error) => {
        console.error('Error al crear ticket:', error);
        alert(this.extractErrorMessage(error, 'No se pudo crear el ticket.'));
      }
    });
  }

  addLog(): void {
    const ticketId = this.getTicketId();
    if (!ticketId) return;

    if (this.logForm.invalid) {
      this.logForm.markAllAsTouched();
      return;
    }

    const payload: CreateTicketLogRequest = {
      description: String(this.logForm.value.description ?? '').trim(),
      author: String(this.logForm.value.author ?? '').trim() || undefined
    };

    this.ticketLogService.createTicketLog(ticketId, payload).subscribe({
      next: (log) => {
        this.ticketLogs.update((current) => [log, ...current]);
        this.logForm.reset({ description: '', author: '' });
      },
      error: (error) => {
        console.error('Error al crear log:', error);
        alert(this.extractErrorMessage(error, 'No se pudo agregar el log técnico.'));
      }
    });
  }

  addPart(): void {
    const ticketId = this.getTicketId();
    if (!ticketId) return;

    if (this.partForm.invalid) {
      this.partForm.markAllAsTouched();
      return;
    }

    const payload: AddTicketPartRequest = {
      inventoryId: Number(this.partForm.value.inventoryId),
      quantity: Number(this.partForm.value.quantity),
      note: String(this.partForm.value.note ?? '').trim() || undefined
    };

    this.ticketPartService.createTicketPart(ticketId, payload).subscribe({
      next: (part) => {
        this.ticketParts.update((current) => [...current, part]);
        this.inventoryItems.update((items) =>
          items.map((item) =>
            item.id === payload.inventoryId
              ? { ...item, quantity: Math.max(0, item.quantity - payload.quantity) }
              : item
          )
        );
        this.partForm.reset({ inventoryId: null, quantity: 1, note: '' });
      },
      error: (error) => {
        console.error('Error al agregar pieza:', error);
        alert(this.extractErrorMessage(error, 'No se pudo agregar la pieza.'));
      }
    });
  }

  formatDateTime(value: string): string {
    return this.localeDate.formatDateTime(value);
  }

  resolvePartInventoryName(part: TicketPart): string {
    if (part.inventoryName) {
      return part.inventoryName;
    }
    return this.inventoryItems().find((item) => item.id === part.inventoryId)?.name ?? `#${part.inventoryId}`;
  }

  private loadCurrentTicketIfNeeded(): void {
    const idParam = this.route.snapshot.params['id'];
    if (!idParam || idParam === 'nuevo') {
      return;
    }

    const ticketId = Number(idParam);
    this.isEditing.set(true);
    this.editingId.set(ticketId);

    this.ticketService.getTicket(ticketId).subscribe({
      next: (ticket) => {
        this.form.patchValue(ticket);
        this.currentTicketStatus.set(ticket.status);
        this.ensureStatusValueIsValid();
      },
      error: (error) => {
        console.error('Error al cargar ticket:', error);
        alert(this.extractErrorMessage(error, 'No se pudo cargar el ticket.'));
      }
    });

    this.loadTicketLogs(ticketId);
    this.loadTicketParts(ticketId);
  }

  private loadClients(): void {
    this.clientService.listClients().subscribe({
      next: (clients) => this.clients.set(clients),
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.clients.set([]);
      }
    });
  }

  private loadInventory(): void {
    this.inventoryService.listInventory().subscribe({
      next: (items) => this.inventoryItems.set(items),
      error: (error) => {
        console.error('Error al cargar inventario:', error);
        this.inventoryItems.set([]);
      }
    });
  }

  private loadStatusDefinitions(): void {
    this.ticketService.listStatusDefinitions().subscribe({
      next: (definitions) => {
        this.statusDefinitions.set(definitions.length > 0 ? definitions : this.fallbackStatusDefinitions());
        this.ensureStatusValueIsValid();
      },
      error: (error) => {
        console.error('Error al cargar estados de ticket:', error);
        this.statusDefinitions.set(this.fallbackStatusDefinitions());
        this.ensureStatusValueIsValid();
      }
    });
  }

  private loadTicketLogs(ticketId: number): void {
    this.ticketLogService.listTicketLogs(ticketId).subscribe({
      next: (logs) => this.ticketLogs.set(logs),
      error: (error) => {
        console.error('Error al cargar logs:', error);
        this.ticketLogs.set([]);
      }
    });
  }

  private loadTicketParts(ticketId: number): void {
    this.ticketPartService.listTicketParts(ticketId).subscribe({
      next: (parts) => this.ticketParts.set(parts),
      error: (error) => {
        console.error('Error al cargar piezas:', error);
        this.ticketParts.set([]);
      }
    });
  }

  private resolveVisibleStatuses(): TicketStatusDefinition[] {
    const definitions = this.statusDefinitions();
    if (!this.isEditing()) {
      return definitions;
    }

    const currentStatus = this.currentTicketStatus();
    if (!currentStatus) {
      return definitions;
    }

    const currentDefinition = definitions.find((definition) => definition.value === currentStatus);
    if (!currentDefinition) {
      return definitions;
    }

    const allowedStatuses = new Set<TicketStatus>([
      currentStatus,
      ...currentDefinition.nextStatuses
    ]);
    return definitions.filter((definition) => allowedStatuses.has(definition.value));
  }

  private ensureStatusValueIsValid(): void {
    const currentValue = this.form.get('status')?.value as TicketStatus | null;
    const options = this.statusOptions();

    if (currentValue && options.some((option) => option.value === currentValue)) {
      return;
    }

    const fallback = options[0]?.value ?? 'received';
    this.form.patchValue({ status: fallback }, { emitEvent: false });
  }

  private fallbackStatusDefinitions(): TicketStatusDefinition[] {
    return [
      { value: 'received', closed: false, nextStatuses: ['diagnosing', 'cancelled'] },
      { value: 'diagnosing', closed: false, nextStatuses: ['waiting_parts', 'repairing', 'cancelled'] },
      { value: 'waiting_parts', closed: false, nextStatuses: ['repairing', 'cancelled'] },
      { value: 'repairing', closed: false, nextStatuses: ['waiting_parts', 'repaired', 'cancelled'] },
      { value: 'repaired', closed: false, nextStatuses: ['returned', 'cancelled'] },
      { value: 'returned', closed: true, nextStatuses: [] },
      { value: 'cancelled', closed: true, nextStatuses: [] }
    ];
  }

  private toTicketPayload(): SaveTicketRequest {
    return {
      clientId: Number(this.form.value.clientId),
      deviceType: String(this.form.value.deviceType ?? '').trim(),
      brand: String(this.form.value.brand ?? '').trim() || undefined,
      model: String(this.form.value.model ?? '').trim() || undefined,
      serialNumber: String(this.form.value.serialNumber ?? '').trim() || undefined,
      entryDate: String(this.form.value.entryDate ?? ''),
      problemDescription: String(this.form.value.problemDescription ?? '').trim() || undefined,
      status: this.form.value.status as TicketStatus,
      needsContract: Boolean(this.form.value.needsContract),
      contractSigned: Boolean(this.form.value.contractSigned),
      createdBy: String(this.form.value.createdBy ?? '').trim() || undefined
    };
  }

  private getTicketId(): number | null {
    return this.isEditing() ? this.editingId() : null;
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const maybeHttpError = error as { error?: { message?: string } };
      if (maybeHttpError.error?.message) {
        return maybeHttpError.error.message;
      }
    }
    return fallback;
  }
}
