import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketFormComponent } from './tickets/ticket-form/ticket-form.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryFormComponent } from './inventory/inventory-form/inventory-form.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientFormComponent } from './clients/client-form/client-form.component';

export const routes: Routes = [
    {
        path: '',
        component: DashboardComponent, title: 'Panel principal'
    },
    {
        path: 'tickets',
        component: TicketsComponent, title: 'Tickets'
    },
    {
        path: 'tickets/nuevo',
        component: TicketFormComponent, title: 'Nuevo Ticket'
    },
    {
        path: 'tickets/:id',
        component: TicketFormComponent, title: 'Detalle de Ticket'
    },
    {
        path: 'inventario',
        component: InventoryComponent, title: 'Inventario'
    },
    {
        path: 'inventario/nuevo',
        component: InventoryFormComponent, title: 'Alta de Componente'
    },
    {
        path: 'inventario/:id',
        component: InventoryFormComponent, title: 'Detalle de Componente'
    },
    {
        path: 'clientes',
        component: ClientsComponent, title: 'Clientes'
    },
    {
        path: 'clientes/nuevo',
        component: ClientFormComponent, title: 'Alta de Cliente'
    },
    {
        path: 'clientes/:id',
        component: ClientFormComponent, title: 'Detalle de Cliente'
    }
];
