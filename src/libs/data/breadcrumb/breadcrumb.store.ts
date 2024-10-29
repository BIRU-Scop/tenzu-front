import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";

type BreadCrumbConfig = {
  label: string;
  link?: string;
  doTranslation: boolean;
};

type BreadcrumbState = {
  firstLevel: BreadCrumbConfig | undefined;
  secondLevel: BreadCrumbConfig | undefined;
  thirdLevel: BreadCrumbConfig | undefined;
  fourthLevel: BreadCrumbConfig | undefined;
  fifthLevel: BreadCrumbConfig | undefined;
  sixthLevel: BreadCrumbConfig | undefined;
};

export const BreadcrumbStore = signalStore(
  { providedIn: "root" },
  withState<BreadcrumbState>({
    firstLevel: undefined,
    secondLevel: undefined,
    thirdLevel: undefined,
    fourthLevel: undefined,
    fifthLevel: undefined,
    sixthLevel: undefined,
  }),
  withMethods((store) => ({
    setFirstLevel(firstLevel: BreadCrumbConfig | undefined) {
      patchState(store, { firstLevel });
    },
    setSecondLevel(secondLevel: BreadCrumbConfig | undefined) {
      patchState(store, { secondLevel });
    },
    setThirdLevel(thirdLevel: BreadCrumbConfig | undefined) {
      patchState(store, { thirdLevel });
    },
    setFourthLevel(fourthLevel: BreadCrumbConfig | undefined) {
      patchState(store, { fourthLevel });
    },
    setFifthLevel(fifthLevel: BreadCrumbConfig | undefined) {
      patchState(store, { fifthLevel });
    },
    setSixthLevel(sixthLevel: BreadCrumbConfig | undefined) {
      patchState(store, { sixthLevel });
    },
    reset() {
      patchState(store, {});
    },
  })),
  withComputed((store) => ({
    breadCrumbConfig: computed(() => {
      const path: BreadCrumbConfig[] = [];
      type T = keyof BreadcrumbState;
      const keys: T[] = ["firstLevel", "secondLevel", "thirdLevel", "fourthLevel", "fifthLevel", "sixthLevel"];
      for (const key of keys) {
        const value = store[key]();
        if (value) {
          path.push(value);
        } else {
          break;
        }
      }
      return transformLinks(path);
    }),
  })),
);

const transformLinks = (links: BreadCrumbConfig[]) => {
  let currentPath = "";

  return links.map((item) => {
    // Ensure each link starts with a slash
    currentPath += item?.link?.startsWith("/") ? item.link : "/" + item.link;

    return {
      ...item,
      link: currentPath,
    };
  });
};
export type BreadcrumbStore = InstanceType<typeof BreadcrumbStore>;
