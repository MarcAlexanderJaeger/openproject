// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2023 the OpenProject GmbH
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

import {
  AfterViewInit, ChangeDetectionStrategy,
  Component, ElementRef, Input, OnInit,
} from '@angular/core';
import { WorkPackageResource } from 'core-app/features/hal/resources/work-package-resource';
import { TabComponent } from 'core-app/features/work-packages/components/wp-tabs/components/wp-tab-wrapper/tab';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { PathHelperService } from 'core-app/core/path-helper/path-helper.service';

@Component({
  selector: 'op-meetings-tab',
  templateUrl: './meetings-tab.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingsTabComponent implements OnInit, AfterViewInit, TabComponent {
  @Input() public workPackage:WorkPackageResource;
  turboFrameSrc:string;

  constructor(
    private elementRef:ElementRef,
    readonly PathHelper:PathHelperService,
    readonly I18n:I18nService,
  ) {}

  ngOnInit():void {
    // TODO: Should we try to restore the last selected tab via localStorage as done in following commented code?
    //
    // const storedSrc = localStorage.getItem(`turboFrameSrcMeetingsTabForWorkPackage${this.workPackage.id}`);
    // this.turboFrameSrc = storedSrc ? storedSrc : `/work_packages/${this.workPackage.id}/meetings/tab`;

    this.turboFrameSrc = `${this.PathHelper.staticBase}/work_packages/${this.workPackage.id}/meetings/tab`;
  }

  ngAfterViewInit():void {
    // TODO: Should we try to restore the last selected tab via localStorage as done in following commented code?
    //
    // const turboFrame = this.elementRef.nativeElement.querySelector('#work-package-meetings-tab-content');
    // if (turboFrame) {
    //   turboFrame.addEventListener('turbo:frame-load', (event: Event) => {
    //     const target = event.target as HTMLElement;
    //     const newSrc = target.getAttribute('src');
    //     localStorage.setItem(`turboFrameSrcMeetingsTabForWorkPackage${this.workPackage.id}`, newSrc||'');
    //   });
    // }
  }
}
