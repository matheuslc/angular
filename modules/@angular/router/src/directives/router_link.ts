/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {Directive, HostBinding, HostListener, Input, OnChanges} from '@angular/core';

import {Router} from '../router';
import {ActivatedRoute} from '../router_state';
import {UrlTree} from '../url_tree';

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * [{ path: 'user/:name', component: UserCmp }]
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [routerLink]="/user/bob">link to user component</a>
 * ```
 *
 * If you use dynamic values to generate the link, you can pass an array of path
 * segments, followed by the params for each segment.
 *
 * For instance `['/team', teamId, 'user', userName, {details: true}]`
 * means that we want to generate a link to `/team/11/user/bob;details=true`.
 * Multiple static segments can be merged into one (e.g., `['/team/11/user', userName, {details:
 true}]`).
 *
 * The first segment name can be prepended with `/`, `./`, or `../`:
 * * If the first segment begins with `/`, the router will look up the route from the root of the
 app.
 * * If the first segment begins with `./`, or doesn't begin with a slash, the router will
 * instead look in the children of the current activated route.
 * * And if the first segment begins with `../`, the router will go up one level.
 *
 * You can set query params and fragment as follows:
 *
 * ```
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" fragment="education">link to user
 component</a>
 * ```
 *
 * RouterLink will use these to generate this link: `/user/bob#education?debug=true`.
 *
 * @stable
 */
@Directive({selector: '[routerLink]'})
export class RouterLink implements OnChanges {
  @Input() target: string;
  private commands: any[] = [];
  @Input() queryParams: {[k: string]: any};
  @Input() fragment: string;

  // the url displayed on the anchor element.
  @HostBinding() href: string;

  urlTree: UrlTree;

  /**
   * @internal
   */
  constructor(
      private router: Router, private route: ActivatedRoute,
      private locationStrategy: LocationStrategy) {}

  @Input()
  set routerLink(data: any[]|string) {
    if (Array.isArray(data)) {
      this.commands = <any>data;
    } else {
      this.commands = [data];
    }
  }

  ngOnChanges(changes: {}): any { this.updateTargetUrlAndHref(); }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (button !== 0 || ctrlKey || metaKey) {
      return true;
    }

    if (typeof this.target === 'string' && this.target != '_self') {
      return true;
    }

    this.router.navigateByUrl(this.urlTree);
    return false;
  }

  private updateTargetUrlAndHref(): void {
    this.urlTree = this.router.createUrlTree(
        this.commands,
        {relativeTo: this.route, queryParams: this.queryParams, fragment: this.fragment});
    if (this.urlTree) {
      this.href = this.locationStrategy.prepareExternalUrl(this.router.serializeUrl(this.urlTree));
    }
  }
}
