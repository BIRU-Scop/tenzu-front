/*
 * Copyright (C) 2024-2026 BIRU
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

import { z } from "zod/v4";

export type Credential = {
  username: string;
  password: string;
};

export const tokensSchema = z.object({
  access: z.string().nullable(),
  refresh: z.string().nullable(),
  username: z.string().nullable(),
});
export type Tokens = z.infer<typeof tokensSchema>;

export const invitationTokensSchema = z.object({
  projectInvitationToken: z.string().optional(),
  workspaceInvitationToken: z.string().optional(),
  acceptProjectInvitation: z.boolean().optional(),
  acceptWorkspaceInvitation: z.boolean().optional(),
});
export type InvitationTokens = z.infer<typeof invitationTokensSchema>;

export const socialProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  client_id: z.string(),
});
export type SocialProvider = z.infer<typeof socialProviderSchema>;

export const authConfigSchema = z.object({
  socialaccount: z.object({
    providers: z.array(socialProviderSchema),
  }),
});
export type AuthConfig = z.infer<typeof authConfigSchema>;

export type ProviderRedirect = {
  url: string;
  body: {
    callbackUrl: string;
    acceptTermsOfService?: boolean;
    acceptPrivacyPolicy?: boolean;
  };
};

export const providerCallbackSchema = z.object({
  ...tokensSchema.partial().shape,
  ...invitationTokensSchema.shape,
  error: z
    .enum([
      "unknown",
      "cancelled",
      "denied",
      "reauthentication_required",
      "signup_closed",
      "permission_denied",
      "unverified",
      "missing_terms_acceptance",
    ])
    .optional(),
  socialSessionKey: z.string().optional(),
  email: z.string().optional(),
  next: z.string().optional(),
  fromSignup: z.boolean(),
});
export type ProviderCallback = z.infer<typeof providerCallbackSchema>;

export type ProviderContinueSignupPayload = {
  socialSessionKey: string;
  acceptTermsOfService: boolean;
  acceptPrivacyPolicy: boolean;
};
