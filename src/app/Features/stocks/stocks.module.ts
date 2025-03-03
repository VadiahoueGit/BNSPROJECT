import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StocksRoutingModule } from './stocks-routing.module';
import { StocksComponent } from './stocks.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CalendarModule } from 'angular-calendar';
import { AccordionModule } from 'primeng/accordion';
import { AnimateModule } from 'primeng/animate';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoFocusModule } from 'primeng/autofocus';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { BlockUIModule } from 'primeng/blockui';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DeferModule } from 'primeng/defer';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FocusTrapModule } from 'primeng/focustrap';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InplaceModule } from 'primeng/inplace';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { SpinnerModule } from 'primeng/spinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { StepsModule } from 'primeng/steps';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TimelineModule } from 'primeng/timeline';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { FinancesRoutingModule } from '../finances/finances-routing.module';
import { SharedComponentModule } from '../shared-component/shared-component.module';
import { EntreenStockComponent } from './entreen-stock/entreen-stock.component';
import { SortieDeStockComponent } from './sortie-de-stock/sortie-de-stock.component';
import { TransfertDeStockComponent } from './transfert-de-stock/transfert-de-stock.component';
import { VisualisationDeStockComponent } from './visualisation-de-stock/visualisation-de-stock.component';
import { AnalyseDeStockComponent } from './analyse-de-stock/analyse-de-stock.component';
import { InventaireStoksComponent } from './inventaire-stoks/inventaire-stoks.component';
import {MouvementStockComponent} from "./mouvement-stock/mouvement-stock.component";


@NgModule({
  declarations: [
    StocksComponent,
    EntreenStockComponent,
    SortieDeStockComponent,
    TransfertDeStockComponent,
    VisualisationDeStockComponent,
    AnalyseDeStockComponent,
    InventaireStoksComponent,
    MouvementStockComponent
  ],
  imports: [
    CommonModule,
    StocksRoutingModule,
      NgSelectModule,
      SharedComponentModule,
      AvatarModule,
      AvatarGroupModule,
      AnimateOnScrollModule,
      FormsModule,
      HttpClientModule,
      ReactiveFormsModule,
      AccordionModule,
      AutoCompleteModule,
      BadgeModule,
      BreadcrumbModule,
      BlockUIModule,
      ButtonModule,
      CalendarModule,
      CarouselModule,
      CascadeSelectModule,
      ChartModule,
      CheckboxModule,
      ChipsModule,
      ChipModule,
      ColorPickerModule,
      ConfirmDialogModule,
      ConfirmPopupModule,
      ContextMenuModule,
      VirtualScrollerModule,
      DataViewModule,
      DialogModule,
      DividerModule,
      DockModule,
      DragDropModule,
      DropdownModule,
      DynamicDialogModule,
      DeferModule,
      EditorModule,
      FieldsetModule,
      FileUploadModule,
      FocusTrapModule,
      GalleriaModule,
      InplaceModule,
      InputMaskModule,
      InputSwitchModule,
      InputTextModule,
      InputTextareaModule,
      InputNumberModule,
      ImageModule,
      KnobModule,
      ListboxModule,
      MegaMenuModule,
      MenuModule,
      MenubarModule,
      MessageModule,
      MessagesModule,
      MultiSelectModule,
      OrganizationChartModule,
      OrderListModule,
      OverlayPanelModule,
      PaginatorModule,
      PanelModule,
      PanelMenuModule,
      PasswordModule,
      PickListModule,
      ProgressSpinnerModule,
      ProgressBarModule,
      RadioButtonModule,
      RatingModule,
      SelectButtonModule,
      SidebarModule,
      ScrollerModule,
      ScrollPanelModule,
      ScrollTopModule,
      SkeletonModule,
      SlideMenuModule,
      SliderModule,
      SpeedDialModule,
      SpinnerModule,
      SplitterModule,
      SplitButtonModule,
      StepsModule,
      TableModule,
      TabMenuModule,
      TabViewModule,
      TagModule,
      TerminalModule,
      TieredMenuModule,
      TimelineModule,
      // ToastModule,
      ToggleButtonModule,
      ToolbarModule,
      TooltipModule,
      TriStateCheckboxModule,
      TreeModule,
      TreeSelectModule,
      TreeTableModule,
      AnimateModule,
      CardModule,
      RippleModule,
      StyleClassModule,
      AutoFocusModule,

    ],
    exports: [
      AvatarModule,
      AvatarGroupModule,
      AnimateOnScrollModule,
      FormsModule,
      HttpClientModule,
      ReactiveFormsModule,
      AccordionModule,
      AutoCompleteModule,
      BadgeModule,
      BreadcrumbModule,
      BlockUIModule,
      ButtonModule,
      CalendarModule,
      CarouselModule,
      CascadeSelectModule,
      ChartModule,
      CheckboxModule,
      ChipsModule,
      ChipModule,
      ColorPickerModule,
      ConfirmDialogModule,
      ConfirmPopupModule,
      ContextMenuModule,
      VirtualScrollerModule,
      DataViewModule,
      DialogModule,
      DividerModule,
      DeferModule,
      DockModule,
      DragDropModule,
      DropdownModule,
      DynamicDialogModule,
      EditorModule,
      FieldsetModule,
      FileUploadModule,
      FocusTrapModule,
      GalleriaModule,
      InplaceModule,
      InputMaskModule,
      InputSwitchModule,
      InputTextModule,
      InputTextareaModule,
      InputNumberModule,
      ImageModule,
      KnobModule,
      ListboxModule,
      MegaMenuModule,
      MenuModule,
      MenubarModule,
      MessageModule,
      MessagesModule,
      MultiSelectModule,
      OrganizationChartModule,
      OrderListModule,
      OverlayPanelModule,
      PaginatorModule,
      PanelModule,
      PanelMenuModule,
      PasswordModule,
      PickListModule,
      ProgressSpinnerModule,
      ProgressBarModule,
      RadioButtonModule,
      RatingModule,
      SelectButtonModule,
      SidebarModule,
      ScrollerModule,
      ScrollPanelModule,
      ScrollTopModule,
      SkeletonModule,
      SlideMenuModule,
      SliderModule,
      SpeedDialModule,
      SpinnerModule,
      SplitterModule,
      SplitButtonModule,
      StepsModule,
      TableModule,
      TabMenuModule,
      TabViewModule,
      TagModule,
      TerminalModule,
      TieredMenuModule,
      TimelineModule,
      // ToastModule,
      ToggleButtonModule,
      ToolbarModule,
      TooltipModule,
      TriStateCheckboxModule,
      TreeModule,
      TreeSelectModule,
      TreeTableModule,
      AnimateModule,
      CardModule,
      RippleModule,
      StyleClassModule,
      AutoFocusModule,
      NgxDatatableModule
    ],
})
export class StocksModule { }
