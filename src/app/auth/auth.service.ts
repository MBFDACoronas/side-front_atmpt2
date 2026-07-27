import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, map, tap} from 'rxjs';
import {User} from '../pages/services/user/user.model';
import {UserService} from '../pages/services/user/user.service';

export const ROLE_PEAADMIN = 'Peaadministraator';
export const ROLE_ADMIN = 'Administraator';
export const ROLE_USER = 'Tavakasutaja';
export const USER_ROLES = [ROLE_PEAADMIN, ROLE_ADMIN, ROLE_USER];

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly storageKey = 'currentUser';
    private currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private userService: UserService) {
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    fetchUsers(): Observable<User[]> {
        return this.userService.fetchAllUser();
    }

    loginByCode(code: string): Observable<User | null> {
        const normalizedCode = (code || '').trim();
        return this.fetchUsers().pipe(
            map(users => (users || []).find(user => user.code === normalizedCode) || null),
            tap(user => {
                if (user) {
                    this.setCurrentUser(user);
                }
            })
        );
    }

    loginAs(user: User): void {
        this.setCurrentUser(user);
    }

    logout(): void {
        localStorage.removeItem(this.storageKey);
        this.currentUserSubject.next(null);
    }

    canManageRole(targetRole: string): boolean {
        const currentRole = this.currentUser?.role;
        if (!currentRole) {
            return true;
        }

        if (currentRole === ROLE_PEAADMIN) {
            return targetRole === ROLE_ADMIN || targetRole === ROLE_USER;
        }

        if (currentRole === ROLE_ADMIN) {
            return targetRole === ROLE_USER;
        }

        return false;
    }

    getAssignableRoles(): string[] {
        const currentRole = this.currentUser?.role;
        if (!currentRole) {
            return USER_ROLES;
        }

        if (currentRole === ROLE_PEAADMIN) {
            return [ROLE_ADMIN, ROLE_USER];
        }

        if (currentRole === ROLE_ADMIN) {
            return [ROLE_USER];
        }

        return [];
    }

    private setCurrentUser(user: User): void {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private readStoredUser(): User | null {
        const rawUser = localStorage.getItem(this.storageKey);
        if (!rawUser) {
            return null;
        }

        try {
            return JSON.parse(rawUser);
        } catch {
            localStorage.removeItem(this.storageKey);
            return null;
        }
    }
}
