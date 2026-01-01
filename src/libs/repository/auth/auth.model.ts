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

export type Credential = {
  username: string;
  password: string;
};

export type Tokens = {
  access: string | null;
  refresh: string | null;
  username: string | null;
};

export type InvitationTokens = {
  projectInvitationToken?: string;
  workspaceInvitationToken?: string;
  acceptProjectInvitation?: boolean;
  acceptWorkspaceInvitation?: boolean;
};

export type SocialProvider = {
  id: string;
  name: string;
  client_id: string;
};
export type AuthConfig = {
  socialaccount: {
    providers: [SocialProvider];
  };
};

export type ProviderRedirect = {
  url: string;
  body: {
    callbackUrl: string;
    acceptTermsOfService?: boolean;
    acceptPrivacyPolicy?: boolean;
  };
};

export type ProviderCallback = Partial<Tokens> &
  InvitationTokens & {
    error?:
      | "unknown"
      | "cancelled"
      | "denied"
      | "reauthentication_required"
      | "signup_closed"
      | "permission_denied"
      | "unverified"
      | "missing_terms_acceptance";
    socialSessionKey?: string;
    email?: string;
    next?: string;
    fromSignup: boolean;
  };

export type ProviderContinueSignupPayload = {
  socialSessionKey: string;
  acceptTermsOfService: boolean;
  acceptPrivacyPolicy: boolean;
};
