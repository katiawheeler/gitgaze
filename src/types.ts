import type { Widgets } from "neo-blessed";

export interface DashboardLayout {
  screen: Widgets.Screen;
  statusPane: Widgets.ListElement;
  commitsPane: Widgets.ListElement;
  branchesPane: Widgets.ListElement;
  detailPane: Widgets.BoxElement;
}

export interface PaneList {
  statusPane: Widgets.ListElement;
  commitsPane: Widgets.ListElement;
  branchesPane: Widgets.ListElement;
  detailPane: Widgets.BoxElement;
}

export type FocusablePane = Widgets.ListElement | Widgets.BoxElement;
