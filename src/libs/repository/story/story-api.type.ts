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

import { Story } from "./story.model";

export type BaseParams = { projectId: Story["projectId"]; ref: Story["ref"] };
export type ListEntitiesSummaryParams = { workflowId: Story["workflowId"] };
export type GetEntityDetailParams = BaseParams;
export type CreateEntityDetailParams = ListEntitiesSummaryParams;
export type PutEntityDetailParams = BaseParams;
export type PatchEntityDetailParams = BaseParams;
export type DeleteEntityDetailParams = BaseParams;
