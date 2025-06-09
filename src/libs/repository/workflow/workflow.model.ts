/*
 * Copyright (C) 2024-2025 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { StatusSummary } from "../status/";

export enum Step {
  LEFT = -1,
  RIGHT = 1,
}

export type WorkflowNested = {
  id: string;
  name: string;
  slug: string;
  projectId: string;
};

export type Workflow = WorkflowNested & {
  statuses: StatusSummary[];
};

export type ReorderWorkflowStatusesPayload = {
  statusIds: string[];
  reorder: {
    place: "after" | "before";
    statusId: string;
  };
};
