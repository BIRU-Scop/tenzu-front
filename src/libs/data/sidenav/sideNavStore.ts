import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type NavListItem = {
  iconName: string;
  label: string;
  href: string;
  testId: string;
  componentConfig?: {
    componentRef: any;
    data?: any;
  };
};
export type SideNavAvatar = {
  type: string;
  name: string;
  color: number;
};

const initialState = {
  primaryNavItems: [],
  secondaryNavItems: [],
  avatar: undefined,
  resized: false,
};

export const SideNavStore = signalStore(
  { providedIn: "root" },
  withState<{
    primaryNavItems: NavListItem[];
    secondaryNavItems: NavListItem[];
    avatar: SideNavAvatar | undefined;
    resized: boolean;
  }>(initialState),
  withMethods((store) => ({
    setPrimaryNavItems(primaryNavItems: NavListItem[]) {
      patchState(store, { primaryNavItems });
    },
    setSecondaryNavItems(secondaryNavItems: NavListItem[]) {
      patchState(store, { secondaryNavItems });
    },
    setAvatar(avatar?: SideNavAvatar) {
      patchState(store, { avatar });
    },
    setResized(resized: boolean) {
      patchState(store, { resized });
    },
    reset() {
      patchState(store, initialState);
    },
  })),
);
