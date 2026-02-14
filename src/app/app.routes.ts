import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketFormComponent } from './tickets/ticket-form/ticket-form.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryFormComponent } from './inventory/inventory-form/inventory-form.component';
import { ClientsComponent } from './clients/clients.component';
import { ClientFormComponent } from './clients/client-form/client-form.component';
import { authGuard, guestGuard } from './service/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard],
        title: 'Login'
    },
    {
        path: '',
        component: DashboardComponent,
        canActivate: [authGuard],
        title: 'Panel principal'
    },
    {
        path: 'tickets',
        component: TicketsComponent,
        canActivate: [authGuard],
        title: 'Tickets'
    },
    {
        path: 'tickets/nuevo',
        component: TicketFormComponent,
        canActivate: [authGuard],
        title: 'Nuevo Ticket'
    },
    {
        path: 'tickets/:id',
        component: TicketFormComponent,
        canActivate: [authGuard],
        title: 'Detalle de Ticket'
    },
    {
        path: 'inventario',
        component: InventoryComponent,
        canActivate: [authGuard],
        title: 'Inventario'
    },
    {
        path: 'inventario/nuevo',
        component: InventoryFormComponent,
        canActivate: [authGuard],
        title: 'Alta de Componente'
    },
    {
        path: 'inventario/:id',
        component: InventoryFormComponent,
        canActivate: [authGuard],
        title: 'Detalle de Componente'
    },
    {
        path: 'clientes',
        component: ClientsComponent,
        canActivate: [authGuard],
        title: 'Clientes'
    },
    {
        path: 'clientes/nuevo',
        component: ClientFormComponent,
        canActivate: [authGuard],
        title: 'Alta de Cliente'
    },
    {
        path: 'clientes/:id',
        component: ClientFormComponent,
        canActivate: [authGuard],
        title: 'Detalle de Cliente'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
