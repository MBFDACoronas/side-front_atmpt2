import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from 'primeng/api';
import {User} from './user.model';
import {UserService} from './user.service';
import {InvolvementGroup} from '../involvement-group/involvement-group.model';
import {InvolvementGroupService} from '../involvement-group/involvement-group.service';
import {InvolvementUsers} from '../involvement-users/involvement-users.model';
import {InvolvementUsersService} from '../involvement-users/involvement-users.service';
import {AuthService, USER_ROLES} from '../../../auth/auth.service';

interface UserGroupView extends InvolvementGroup {
    involvementUsers: InvolvementUsers[];
}

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    groups: UserGroupView[] = [];
    filteredGroups: UserGroupView[] = [];
    groupSearch = '';
    groupDialogVisible = false;
    userDialogVisible = false;
    membershipDialogVisible = false;
    selectedGroup: UserGroupView | null = null;
    groupModel: InvolvementGroup = this.createEmptyGroup();
    userModel: User = this.createEmptyUser();
    membershipModel: InvolvementUsers = this.createEmptyMembership();
    selectedUserId: string | null = null;
    loading = false;
    currentUser: User | null = null;
    allRoles = USER_ROLES;
    assignableRoles: string[] = [];
    membershipUserOptions: User[] = [];
    canManageAny = true;

    constructor(
        private usersService: UserService,
        private involvementGroupService: InvolvementGroupService,
        private involvementUsersService: InvolvementUsersService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.updatePermissionState();
        });
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.usersService.fetchAllUser().subscribe(users => {
            this.users = users || [];
            this.updatePermissionState();
            this.loadGroups();
        });
    }

    loadGroups(): void {
        this.involvementGroupService.fetchAllInvolvementGroup().subscribe(groups => {
            this.involvementUsersService.fetchAllInvolvementUsers().subscribe(memberships => {
                this.groups = (groups || []).map(group => ({
                    ...group,
                    involvementUsers: this.enrichMemberships(group.id, memberships || []),
                }));
                this.applyGroupSearch();
                this.loading = false;
            });
        });
    }

    applyGroupSearch(): void {
        const query = this.groupSearch.trim().toLowerCase();
        if (!query) {
            this.filteredGroups = [...this.groups];
            return;
        }

        this.filteredGroups = this.groups.filter(group =>
            group.name?.toLowerCase().includes(query)
            || group.involvementUsers.some(membership => this.getUserDisplayName(membership.user).toLowerCase().includes(query))
        );
    }

    openNewGroupDialog(): void {
        this.groupModel = this.createEmptyGroup();
        this.groupDialogVisible = true;
    }

    openEditGroupDialog(group: UserGroupView): void {
        this.groupModel = {...group};
        this.groupDialogVisible = true;
    }

    saveGroup(): void {
        if (!this.groupModel.name?.trim()) {
            return;
        }

        this.involvementGroupService.saveInvolvementGroup(this.groupModel).subscribe({
            next: () => {
                this.groupDialogVisible = false;
                this.messageService.add({severity: 'success', summary: 'Salvestamine', detail: 'Rühm salvestatud'});
                this.loadData();
            },
            error: () => this.messageService.add({severity: 'error', summary: 'Salvestamine', detail: 'Rühma salvestamine ebaõnnestus'})
        });
    }

    confirmDeleteGroup(group: UserGroupView): void {
        this.confirmationService.confirm({
            message: `Kas eemaldada rühm "${group.name}"?`,
            acceptLabel: 'Eemalda',
            rejectLabel: 'Tühista',
            accept: () => this.deleteGroup(group),
        });
    }

    deleteGroup(group: UserGroupView): void {
        this.involvementGroupService.deleteInvolvementGroup(group.id).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Eemaldamine', detail: 'Rühm eemaldatud'});
            this.loadData();
        });
    }

    openNewUserDialog(): void {
        this.userModel = this.createEmptyUser();
        this.userModel.role = this.assignableRoles[0] || '';
        this.userDialogVisible = true;
    }

    openEditUserDialog(user: User): void {
        if (!this.canManageUser(user)) {
            return;
        }

        this.userModel = {...user};
        this.userDialogVisible = true;
    }

    saveUser(): void {
        if (!this.userModel.name?.trim() || !this.userModel.company?.trim() || !this.canManageRole(this.userModel.role)) {
            return;
        }

        this.usersService.saveUser(this.userModel).subscribe(() => {
            this.userDialogVisible = false;
            this.messageService.add({severity: 'success', summary: 'Salvestamine', detail: 'Kasutaja salvestatud'});
            this.loadData();
        });
    }

    confirmDeleteUser(user: User): void {
        if (!this.canManageUser(user)) {
            return;
        }

        this.confirmationService.confirm({
            message: `Kas eemaldada kasutaja "${this.getUserDisplayName(user)}"?`,
            acceptLabel: 'Eemalda',
            rejectLabel: 'Tühista',
            accept: () => this.deleteUser(user),
        });
    }

    deleteUser(user: User): void {
        this.usersService.deleteUser(user.id).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Eemaldamine', detail: 'Kasutaja eemaldatud'});
            this.loadData();
        });
    }

    openGroupUsers(group: UserGroupView): void {
        this.selectedGroup = group;
        this.membershipDialogVisible = true;
    }

    openAddMembership(group: UserGroupView): void {
        if (!this.canManageAnyUser()) {
            return;
        }

        this.selectedGroup = group;
        this.selectedUserId = null;
        this.membershipModel = {
            ...this.createEmptyMembership(),
            involvementGroupId: group.id,
        };
        this.membershipDialogVisible = true;
    }

    editMembership(membership: InvolvementUsers): void {
        if (!this.canManageUser(membership.user)) {
            return;
        }

        this.membershipModel = {...membership};
        this.selectedUserId = membership.userId;
    }

    saveMembership(): void {
        const selectedUser = this.users.find(user => user.id === this.selectedUserId);
        if (!this.selectedGroup?.id || !this.selectedUserId || !this.canManageUser(selectedUser)) {
            return;
        }

        this.membershipModel.involvementGroupId = this.selectedGroup.id;
        this.membershipModel.userId = this.selectedUserId;
        this.involvementUsersService.saveInvolvementUsers(this.membershipModel).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Salvestamine', detail: 'Kasutaja lisatud rühma'});
            this.membershipModel = this.createEmptyMembership();
            this.selectedUserId = null;
            this.loadData();
        });
    }

    removeMembership(membership: InvolvementUsers): void {
        if (!this.canManageUser(membership.user)) {
            return;
        }

        this.involvementUsersService.deleteInvolvementUsers(membership.id).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Eemaldamine', detail: 'Kasutaja eemaldatud rühmast'});
            this.loadData();
        });
    }

    getUserDisplayName(user: User): string {
        if (!user) {
            return 'Tundmatu kasutaja';
        }

        return [user.name, user.lastName].filter(Boolean).join(' ') || user.email || 'Nimetu kasutaja';
    }

    getGroupPreview(group: UserGroupView): InvolvementUsers[] {
        return group.involvementUsers.slice(0, 5);
    }

    getUserInitials(user: User): string {
        const displayName = this.getUserDisplayName(user);
        return displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }

    canManageRole(role: string): boolean {
        return this.authService.canManageRole(role);
    }

    canManageUser(user: User): boolean {
        if (!user) {
            return false;
        }

        return this.authService.canManageRole(user.role);
    }

    canManageAnyUser(): boolean {
        return this.canManageAny;
    }

    private updatePermissionState(): void {
        this.assignableRoles = this.authService.getAssignableRoles();
        this.membershipUserOptions = this.users.filter(user => this.canManageUser(user));
        this.canManageAny = this.assignableRoles.length > 0;
    }

    private enrichMemberships(groupId: string, memberships: InvolvementUsers[]): InvolvementUsers[] {
        return memberships
            .filter(membership => membership.involvementGroupId === groupId)
            .map(membership => ({
                ...membership,
                user: this.users.find(user => user.id === membership.userId),
            }))
            .filter(membership => !!membership.user);
    }

    private createEmptyUser(): User {
        return {
            id: null,
            name: '',
            lastName: '',
            role: '',
            email: '',
            code: '',
            company: '',
        };
    }

    private createEmptyGroup(): InvolvementGroup {
        return {
            id: null,
            name: '',
            involvementUsers: [],
        };
    }

    private createEmptyMembership(): InvolvementUsers {
        return {
            id: null,
            involvementGroupId: null,
            rights: '',
            user: null,
            userId: null,
            drawingsRights: null,
        };
    }
}
