-- ============================================================
-- OAUTH2 AUTHORIZATION SERVER TABLES
-- ============================================================
-- Implements OAuth2 Authorization Code Flow with PKCE
-- Allows Claude.ai and other OAuth clients to access user data
-- ============================================================

-- ============================================================
-- 1. OAUTH CLIENTS
-- ============================================================
-- Registered OAuth2 client applications (e.g., Claude.ai)

CREATE TABLE oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parish scope (null for legacy global clients)
  parish_id UUID REFERENCES parishes(id) ON DELETE CASCADE,

  -- Client identification
  client_id TEXT NOT NULL UNIQUE,               -- Public identifier: "os_xxxxxxxx"
  client_secret_hash TEXT NOT NULL,             -- bcrypt hash of client secret
  client_secret_prefix TEXT NOT NULL,           -- First 8 chars for display

  -- Client metadata
  name TEXT NOT NULL,                           -- "Parish Name - Claude.ai"
  description TEXT,                             -- "OAuth client for Claude.ai MCP integration"
  logo_url TEXT,                                -- For consent screen display

  -- OAuth configuration
  redirect_uris TEXT[] NOT NULL,                -- Allowed callback URLs
  allowed_scopes TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],

  -- Trust level
  is_first_party BOOLEAN NOT NULL DEFAULT false,  -- First-party apps skip consent
  is_confidential BOOLEAN NOT NULL DEFAULT true,  -- Can keep secrets (server-side apps)

  -- Lifecycle
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT oauth_clients_scopes_valid CHECK (
    allowed_scopes <@ ARRAY['read', 'write', 'delete', 'profile']::TEXT[]
  )
);

CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_parish_id ON oauth_clients(parish_id);
CREATE INDEX idx_oauth_clients_is_active ON oauth_clients(is_active) WHERE is_active = true;

-- ============================================================
-- 2. OAUTH AUTHORIZATION CODES
-- ============================================================
-- Temporary codes exchanged for tokens (10 minute lifetime)

CREATE TABLE oauth_authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code data
  code_hash TEXT NOT NULL,                      -- bcrypt hash of auth code
  code_prefix TEXT NOT NULL,                    -- First 8 chars for debugging

  -- Relationships
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Request parameters (for validation at token exchange)
  redirect_uri TEXT NOT NULL,
  scopes TEXT[] NOT NULL,
  state TEXT,                                   -- Passed through for CSRF protection

  -- PKCE (required for public clients)
  code_challenge TEXT,
  code_challenge_method TEXT CHECK (code_challenge_method IN ('S256', 'plain')),

  -- Lifecycle
  expires_at TIMESTAMPTZ NOT NULL,              -- 10 minutes from creation
  used_at TIMESTAMPTZ,                          -- Set when exchanged for token
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_oauth_auth_codes_code_prefix ON oauth_authorization_codes(code_prefix);
CREATE INDEX idx_oauth_auth_codes_expires_at ON oauth_authorization_codes(expires_at);
CREATE INDEX idx_oauth_auth_codes_client_id ON oauth_authorization_codes(client_id);
CREATE INDEX idx_oauth_auth_codes_user_id ON oauth_authorization_codes(user_id);

-- ============================================================
-- 3. OAUTH ACCESS TOKENS
-- ============================================================
-- Short-lived access tokens (1 hour lifetime)

CREATE TABLE oauth_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Token data
  token_hash TEXT NOT NULL,                     -- bcrypt hash of token
  token_prefix TEXT NOT NULL UNIQUE,            -- First 12 chars for lookup

  -- Relationships
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Scope and permissions
  scopes TEXT[] NOT NULL,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,

  -- Lifecycle
  expires_at TIMESTAMPTZ NOT NULL,              -- 1 hour from creation
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_oauth_access_tokens_token_prefix ON oauth_access_tokens(token_prefix);
CREATE INDEX idx_oauth_access_tokens_user_id ON oauth_access_tokens(user_id);
CREATE INDEX idx_oauth_access_tokens_client_id ON oauth_access_tokens(client_id);
CREATE INDEX idx_oauth_access_tokens_parish_id ON oauth_access_tokens(parish_id);
CREATE INDEX idx_oauth_access_tokens_expires_at ON oauth_access_tokens(expires_at);

-- ============================================================
-- 4. OAUTH REFRESH TOKENS
-- ============================================================
-- Long-lived refresh tokens (30 day lifetime)

CREATE TABLE oauth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Token data
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL UNIQUE,

  -- Relationships
  access_token_id UUID REFERENCES oauth_access_tokens(id) ON DELETE SET NULL,
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Scope (can be subset of original)
  scopes TEXT[] NOT NULL,

  -- Lifecycle
  expires_at TIMESTAMPTZ NOT NULL,              -- 30 days from creation
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Token rotation tracking
  rotated_at TIMESTAMPTZ,                       -- Set when rotated to new token
  replaced_by_id UUID REFERENCES oauth_refresh_tokens(id)
);

CREATE INDEX idx_oauth_refresh_tokens_token_prefix ON oauth_refresh_tokens(token_prefix);
CREATE INDEX idx_oauth_refresh_tokens_user_id ON oauth_refresh_tokens(user_id);
CREATE INDEX idx_oauth_refresh_tokens_client_id ON oauth_refresh_tokens(client_id);
CREATE INDEX idx_oauth_refresh_tokens_parish_id ON oauth_refresh_tokens(parish_id);
CREATE INDEX idx_oauth_refresh_tokens_expires_at ON oauth_refresh_tokens(expires_at);

-- ============================================================
-- 5. OAUTH USER CONSENTS
-- ============================================================
-- Tracks which users have authorized which clients

CREATE TABLE oauth_user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,

  -- Consent details
  granted_scopes TEXT[] NOT NULL,

  -- Lifecycle
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,

  -- Unique constraint: one consent per user/parish/client combo
  CONSTRAINT oauth_user_consents_unique UNIQUE (user_id, parish_id, client_id)
);

CREATE INDEX idx_oauth_user_consents_user_id ON oauth_user_consents(user_id);
CREATE INDEX idx_oauth_user_consents_client_id ON oauth_user_consents(client_id);
CREATE INDEX idx_oauth_user_consents_parish_id ON oauth_user_consents(parish_id);

-- ============================================================
-- 6. OAUTH USER PERMISSIONS
-- ============================================================
-- Admin-controlled per-user OAuth settings

CREATE TABLE oauth_user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Permission settings
  oauth_enabled BOOLEAN NOT NULL DEFAULT true,  -- Admin can disable OAuth for specific users
  allowed_scopes TEXT[] NOT NULL DEFAULT ARRAY['read', 'profile']::TEXT[],  -- Max scopes user can grant

  -- Audit
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint
  CONSTRAINT oauth_user_permissions_unique UNIQUE (user_id, parish_id),

  -- Scope validation
  CONSTRAINT oauth_user_permissions_scopes_valid CHECK (
    allowed_scopes <@ ARRAY['read', 'write', 'delete', 'profile']::TEXT[]
  )
);

CREATE INDEX idx_oauth_user_permissions_user_id ON oauth_user_permissions(user_id);
CREATE INDEX idx_oauth_user_permissions_parish_id ON oauth_user_permissions(parish_id);

-- ============================================================
-- 7. ADD OAUTH SETTINGS TO PARISH_SETTINGS
-- ============================================================

ALTER TABLE parish_settings
ADD COLUMN IF NOT EXISTS oauth_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS oauth_default_user_scopes TEXT[] NOT NULL DEFAULT ARRAY['read', 'profile']::TEXT[];

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_user_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT ALL ON oauth_clients TO anon;
GRANT ALL ON oauth_clients TO authenticated;
GRANT ALL ON oauth_clients TO service_role;

GRANT ALL ON oauth_authorization_codes TO anon;
GRANT ALL ON oauth_authorization_codes TO authenticated;
GRANT ALL ON oauth_authorization_codes TO service_role;

GRANT ALL ON oauth_access_tokens TO anon;
GRANT ALL ON oauth_access_tokens TO authenticated;
GRANT ALL ON oauth_access_tokens TO service_role;

GRANT ALL ON oauth_refresh_tokens TO anon;
GRANT ALL ON oauth_refresh_tokens TO authenticated;
GRANT ALL ON oauth_refresh_tokens TO service_role;

GRANT ALL ON oauth_user_consents TO anon;
GRANT ALL ON oauth_user_consents TO authenticated;
GRANT ALL ON oauth_user_consents TO service_role;

GRANT ALL ON oauth_user_permissions TO anon;
GRANT ALL ON oauth_user_permissions TO authenticated;
GRANT ALL ON oauth_user_permissions TO service_role;

-- ============================================================
-- RLS POLICIES: OAUTH CLIENTS
-- ============================================================

-- Anyone (including anonymous) can view active OAuth clients
-- Required for OAuth flow to validate client_id before user authenticates
CREATE POLICY "Anonymous can view active OAuth clients"
  ON oauth_clients
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can view active OAuth clients"
  ON oauth_clients
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role full access
CREATE POLICY "Service role full access to oauth_clients"
  ON oauth_clients
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Parish admins can manage their own OAuth clients
CREATE POLICY "Parish admins can manage their OAuth clients"
  ON oauth_clients
  FOR ALL
  TO authenticated
  USING (
    parish_id IN (
      SELECT pu.parish_id FROM parish_users pu
      WHERE pu.user_id = auth.uid()
      AND 'admin' = ANY(pu.roles)
      AND pu.deleted_at IS NULL
    )
  )
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id FROM parish_users pu
      WHERE pu.user_id = auth.uid()
      AND 'admin' = ANY(pu.roles)
      AND pu.deleted_at IS NULL
    )
  );

-- ============================================================
-- RLS POLICIES: AUTHORIZATION CODES
-- ============================================================

-- Users can view their own authorization codes
CREATE POLICY "Users can view their own auth codes"
  ON oauth_authorization_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role full access (for token exchange)
CREATE POLICY "Service role full access to auth codes"
  ON oauth_authorization_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS POLICIES: ACCESS TOKENS
-- ============================================================

-- Users can view their own access tokens
CREATE POLICY "Users can view their own access tokens"
  ON oauth_access_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can revoke their own access tokens
CREATE POLICY "Users can revoke their own access tokens"
  ON oauth_access_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to access tokens"
  ON oauth_access_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS POLICIES: REFRESH TOKENS
-- ============================================================

-- Users can view their own refresh tokens
CREATE POLICY "Users can view their own refresh tokens"
  ON oauth_refresh_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can revoke their own refresh tokens
CREATE POLICY "Users can revoke their own refresh tokens"
  ON oauth_refresh_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to refresh tokens"
  ON oauth_refresh_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS POLICIES: USER CONSENTS
-- ============================================================

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
  ON oauth_user_consents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own consents
CREATE POLICY "Users can create their own consents"
  ON oauth_user_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can revoke their own consents
CREATE POLICY "Users can revoke their own consents"
  ON oauth_user_consents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access to user consents"
  ON oauth_user_consents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- RLS POLICIES: USER PERMISSIONS
-- ============================================================

-- Users can view their own permissions
CREATE POLICY "Users can view their own OAuth permissions"
  ON oauth_user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all permissions for their parish
CREATE POLICY "Admins can view parish OAuth permissions"
  ON oauth_user_permissions
  FOR SELECT
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND 'admin' = ANY(roles)
      AND deleted_at IS NULL
    )
  );

-- Admins can manage permissions for their parish
CREATE POLICY "Admins can manage parish OAuth permissions"
  ON oauth_user_permissions
  FOR ALL
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND 'admin' = ANY(roles)
      AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND 'admin' = ANY(roles)
      AND deleted_at IS NULL
    )
  );

-- Service role full access
CREATE POLICY "Service role full access to user permissions"
  ON oauth_user_permissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE COMMENTS
-- ============================================================

COMMENT ON TABLE oauth_clients IS 'Registered OAuth2 client applications (e.g., Claude.ai)';
COMMENT ON TABLE oauth_authorization_codes IS 'Temporary authorization codes for OAuth2 flow (10 min lifetime)';
COMMENT ON TABLE oauth_access_tokens IS 'OAuth2 access tokens for API authentication (1 hour lifetime)';
COMMENT ON TABLE oauth_refresh_tokens IS 'OAuth2 refresh tokens for obtaining new access tokens (30 day lifetime)';
COMMENT ON TABLE oauth_user_consents IS 'User authorizations for OAuth clients';
COMMENT ON TABLE oauth_user_permissions IS 'Admin-controlled per-user OAuth settings';

COMMENT ON COLUMN parish_settings.oauth_enabled IS 'Master switch to enable/disable OAuth for entire parish';
COMMENT ON COLUMN parish_settings.oauth_default_user_scopes IS 'Default scopes assigned to new users for OAuth';

-- Note: OAuth clients are created per-parish through the OAuth Settings UI.
-- Each parish generates their own client credentials for Claude.ai integration.
