export interface Credential {
  username: string;
  password: string;
}

export interface Tokens {
  token: string | null;
  refresh: string | null;
  username: string | null;
}
