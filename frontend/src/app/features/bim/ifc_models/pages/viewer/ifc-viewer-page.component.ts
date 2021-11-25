import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  PartitionedQuerySpacePageComponent,
  ToolbarButtonComponentDefinition, ViewPartitionState,
} from 'core-app/features/work-packages/routing/partitioned-query-space-page/partitioned-query-space-page.component';
import { WorkPackageFilterButtonComponent } from 'core-app/features/work-packages/components/wp-buttons/wp-filter-button/wp-filter-button.component';
import { ZenModeButtonComponent } from 'core-app/features/work-packages/components/wp-buttons/zen-mode-toggle-button/zen-mode-toggle-button.component';
import {
  bimSplitViewCardsIdentifier,
  bimViewerViewIdentifier,
  BimViewService,
  BimViewState,
} from 'core-app/features/bim/ifc_models/pages/viewer/bim-view.service';
import { BimViewToggleButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/view-toggle/bim-view-toggle-button.component';
import { IfcModelsDataService } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-models-data.service';
import { QueryParamListenerService } from 'core-app/features/work-packages/components/wp-query/query-param-listener.service';
import { BimManageIfcModelsButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/manage-ifc-models-button/bim-manage-ifc-models-button.component';
import { WorkPackageCreateButtonComponent } from 'core-app/features/work-packages/components/wp-buttons/wp-create-button/wp-create-button.component';
import { BehaviorSubject } from 'rxjs';
import { BcfImportButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/import-export-bcf/bcf-import-button.component';
import { BcfExportButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/import-export-bcf/bcf-export-button.component';
import { RefreshButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/import-export-bcf/refresh-button.component';
import { ViewerBridgeService } from 'core-app/features/bim/bcf/bcf-viewer-bridge/viewer-bridge.service';
import { UntilDestroyedMixin } from 'core-app/shared/helpers/angular/until-destroyed.mixin';
import { Ng2StateDeclaration } from '@uirouter/angular';
import { QueryResource } from 'core-app/features/hal/resources/query-resource';

@Component({
  templateUrl: '../../../../work-packages/routing/partitioned-query-space-page/partitioned-query-space-page.component.html',
  styleUrls: [
    '../../../../work-packages/routing/partitioned-query-space-page/partitioned-query-space-page.component.sass',
    './styles/generic.sass',
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    BimViewService,
    QueryParamListenerService,
  ],
})
export class IFCViewerPageComponent extends PartitionedQuerySpacePageComponent implements UntilDestroyedMixin, OnInit {
  text = {
    title: this.I18n.t('js.bcf.management'),
    delete: this.I18n.t('js.button_delete'),
    edit: this.I18n.t('js.button_edit'),
    areYouSure: this.I18n.t('js.text_are_you_sure'),
  };

  newRoute$ = new BehaviorSubject<string|undefined>(undefined);

  toolbarButtonComponents:ToolbarButtonComponentDefinition[] = [
    {
      component: WorkPackageCreateButtonComponent,
      inputs: {
        stateName$: this.newRoute$,
        allowed: ['work_packages.createWorkPackage', 'work_package.copy'],
      },
    },
    {
      component: RefreshButtonComponent,
      show: ():boolean => !this.viewerBridgeService.shouldShowViewer,
    },
    {
      component: BcfImportButtonComponent,
      show: ():boolean => this.ifcData.allowed('manage_bcf'),
      containerClasses: 'hidden-for-mobile',
    },
    {
      component: BcfExportButtonComponent,
      show: ():boolean => this.ifcData.allowed('manage_bcf'),
      containerClasses: 'hidden-for-mobile',
    },
    {
      component: WorkPackageFilterButtonComponent,
      show: ():boolean => this.bimView.currentViewerState() !== bimViewerViewIdentifier,
    },
    {
      component: BimViewToggleButtonComponent,
      containerClasses: 'hidden-for-mobile',
    },
    {
      component: ZenModeButtonComponent,
      containerClasses: 'hidden-for-mobile',
    },
    {
      component: BimManageIfcModelsButtonComponent,
      // Hide 'Manage models' toolbar button on plugin environment (ie: Revit)
      show: ():boolean => this.viewerBridgeService.shouldShowViewer
        && this.ifcData.allowed('manage_ifc_models'),

    },
  ];

  // get newRoute() {
  //   // Open new work packages in full view when there
  //   // is no viewer (ie: Revit)
  //   return this.viewerBridgeService.shouldShowViewer
  //     ? this.state.current.data.newRoute
  //     : 'bim.partitioned.new';
  // }

  constructor(readonly ifcData:IfcModelsDataService,
    readonly bimView:BimViewService,
    readonly injector:Injector,
    readonly viewerBridgeService:ViewerBridgeService) {
    super(injector);
  }

  ngOnInit():void {
    super.ngOnInit();

    // TODO: find better spot to modify columns
    // void this.wpTableColumns.onReady()
    //   .then(() => this.wpTableColumns.addColumn('bcfThumbnail', 2));

    this.setupChangeObserver(this.bimView);

    this.querySpace.query.values$()
      .subscribe((query) => {
        const dr = query.displayRepresentation || bimSplitViewCardsIdentifier;
        if (BimViewService.isBimViewState(dr) && this.bimView.currentViewerState() !== dr) {
          this.currentPartition = IFCViewerPageComponent.derivePartition(<BimViewState>dr);
          this.filterAllowed = dr !== bimViewerViewIdentifier;
        }
      });


    // // Keep the new route up to date depending on where we move to
    // this.transitionUnsubscribeFn = this.transition.onSuccess({}, () => {
    //   this.newRoute$.next(this.newRoute);
    // });
  }

  /**
   * Initialize the BimViewService when the component is refreshed
   */
  public refresh(visibly = false, firstPage = false):Promise<QueryResource> {
    return super.refresh(visibly, firstPage)
      .then((query) => {
        this.bimView.initialize(query, query.results);
        return query;
      });
  }

  protected shouldUpdateHtmlTitle():boolean {
    return this.$state.current.name === 'bim.partitioned.list';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected setPartition(state:Ng2StateDeclaration):void {
    // do nothing, because partition is set and handled by view state of BimViewerService (line:
  }

  private static derivePartition(state:BimViewState):ViewPartitionState {
    switch (state) {
      case 'splitCards':
      case 'splitTable':
        return '-split';
      case 'cards':
      case 'table':
        return '-right-only';
      case 'viewer':
        return '-left-only';
      default:
        return '-split';
    }
  }
}
