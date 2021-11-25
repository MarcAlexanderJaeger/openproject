// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2021 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See COPYRIGHT and LICENSE files for more details.
//++

import { OPContextMenuService } from 'core-app/shared/components/op-context-menu/op-context-menu.service';
import { Directive, ElementRef } from '@angular/core';
import { OpContextMenuTrigger } from 'core-app/shared/components/op-context-menu/handlers/op-context-menu-trigger.directive';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { StateService } from '@uirouter/core';
import {
  bimCardsViewIdentifier,
  bimSplitViewCardsIdentifier,
  bimSplitViewTableIdentifier,
  bimTableViewIdentifier,
  bimViewerViewIdentifier,
  BimViewService,
} from 'core-app/features/bim/ifc_models/pages/viewer/bim-view.service';
import { ViewerBridgeService } from 'core-app/features/bim/bcf/bcf-viewer-bridge/viewer-bridge.service';
import { WorkPackageFiltersService } from 'core-app/features/work-packages/components/filters/wp-filters/wp-filters.service';
import { OpContextMenuItem } from 'core-app/shared/components/op-context-menu/op-context-menu.types';

@Directive({
  selector: '[opBimViewDropdown]',
})
export class BimViewToggleDropdownDirective extends OpContextMenuTrigger {
  constructor(readonly elementRef:ElementRef,
    readonly opContextMenu:OPContextMenuService,
    readonly bimView:BimViewService,
    readonly I18n:I18nService,
    readonly state:StateService,
    readonly wpFiltersService:WorkPackageFiltersService,
    readonly viewerBridgeService:ViewerBridgeService) {
    super(elementRef, opContextMenu);
  }

  protected open(evt:JQuery.TriggeredEvent):void {
    this.buildItems();
    this.opContextMenu.show(this, evt);
  }

  public get locals():{ showAnchorRight?:boolean, contextMenuId?:string, items:OpContextMenuItem[] } {
    return {
      items: this.items,
      contextMenuId: 'bim-view-context-menu',
    };
  }

  private buildItems() {
    const items = this.viewerBridgeService.shouldShowViewer
      ? [bimViewerViewIdentifier, bimCardsViewIdentifier, bimSplitViewCardsIdentifier, bimSplitViewTableIdentifier, bimTableViewIdentifier]
      : [bimCardsViewIdentifier, bimTableViewIdentifier];

    this.items = items
      .map((key) => ({
        hidden: key === this.bimView.currentViewerState(),
        linkText: this.bimView.text[key],
        icon: this.bimView.icon[key],
        onClick: () => {
          // Close filter section
          if (this.wpFiltersService.visible) {
            this.wpFiltersService.toggleVisibility();
          }

          switch (key) {
            case bimCardsViewIdentifier:
            case bimTableViewIdentifier:
            case bimViewerViewIdentifier:
            case bimSplitViewCardsIdentifier:
            case bimSplitViewTableIdentifier:
              this.bimView.update(key);
              break;
            default:
          }

          return true;
        },
      }));
  }
}
