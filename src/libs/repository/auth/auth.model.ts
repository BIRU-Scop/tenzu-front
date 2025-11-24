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

export interface Credential {
  username: string;
  password: string;
}

export interface Tokens {
  access: string | null;
  refresh: string | null;
  username: string | null;
}

export interface SocialProvider {
  id: string;
  name: string;
  flows: [string];
  client_id: string;
}
export interface AuthConfig {
  status: number;
  data: {
    account: {
      authentication_method: string;
      email_verification_by_code_enabled: boolean;
      is_open_for_signup: boolean;
      login_by_code_enabled: boolean;
    };
    socialaccount: {
      providers: [SocialProvider];
    };
    mfa?: {
      supported_types: [string];
    };
    usersessions?: {
      track_activity: boolean;
    };
  };
}

export interface ProviderRedirect {
  url: string;
  body: {
    provider: string;
    process: string;
    callback_url: string;
    csrfmiddlewaretoken: string;
    acceptTermsOfService: boolean;
    acceptPrivacyPolicy: boolean;
  };
}

export interface ProviderCallback extends Partial<Tokens> {
  error?: "unknown" | "cancelled" | "denied";
  error_process?: "login" | "connect" | "redirect";
}
