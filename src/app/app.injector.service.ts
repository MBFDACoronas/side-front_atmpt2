import { Injector, Injectable } from '@angular/core';
/**
 * Holds shared services
 */
@Injectable({
  providedIn: 'root'
})
export class AppInjector {
  private static injector: Injector;

  static setInjector(injector: Injector) {
    AppInjector.injector = injector;
  }

  static getInjector(): Injector {
    return AppInjector.injector;
  }

}
