-- Create mcp_api_keys table for MCP server authentication
-- API keys allow external AI assistants (like Claude Desktop) to access parish data

CREATE TABLE mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- API Key identification
  name TEXT NOT NULL,                              -- User-friendly name: "Claude Desktop - Josh's Mac"
  key_prefix TEXT NOT NULL,                        -- First 12 chars for display/lookup: "os_live_a1b2"
  key_hash TEXT NOT NULL,                          -- bcrypt hash of full key

  -- Permissions
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],  -- 'read', 'write', 'delete'

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  use_count INTEGER NOT NULL DEFAULT 0,

  -- Lifecycle
  expires_at TIMESTAMPTZ,                          -- NULL = never expires
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT mcp_api_keys_key_prefix_unique UNIQUE (key_prefix),
  CONSTRAINT mcp_api_keys_scopes_valid CHECK (
    scopes <@ ARRAY['read', 'write', 'delete']::TEXT[]
  )
);

-- Indexes
CREATE INDEX idx_mcp_api_keys_parish_id ON mcp_api_keys(parish_id);
CREATE INDEX idx_mcp_api_keys_user_id ON mcp_api_keys(user_id);
CREATE INDEX idx_mcp_api_keys_key_prefix ON mcp_api_keys(key_prefix);
CREATE INDEX idx_mcp_api_keys_is_active ON mcp_api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_mcp_api_keys_created_at ON mcp_api_keys(created_at DESC);

-- Enable RLS
ALTER TABLE mcp_api_keys ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON mcp_api_keys TO anon;
GRANT ALL ON mcp_api_keys TO authenticated;
GRANT ALL ON mcp_api_keys TO service_role;

-- RLS Policies

-- SELECT: Users can view their own API keys
CREATE POLICY "Users can view their own API keys"
  ON mcp_api_keys
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Admin/Staff can create API keys for parishes they belong to
CREATE POLICY "Admin and staff can create API keys"
  ON mcp_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    parish_id IN (
      SELECT parish_id FROM parish_users
      WHERE user_id = auth.uid()
      AND ('admin' = ANY(roles) OR 'staff' = ANY(roles))
      AND deleted_at IS NULL
    )
  );

-- UPDATE: Users can update/revoke their own API keys
CREATE POLICY "Users can update their own API keys"
  ON mcp_api_keys
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own API keys
CREATE POLICY "Users can delete their own API keys"
  ON mcp_api_keys
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Service role policy for MCP server validation
CREATE POLICY "Service role full access"
  ON mcp_api_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Table comments
COMMENT ON TABLE mcp_api_keys IS 'API keys for MCP server authentication. Allows AI assistants to access parish data.';
COMMENT ON COLUMN mcp_api_keys.key_prefix IS 'First 12 characters of the API key, used for display and lookup. Format: os_live_XXXX';
COMMENT ON COLUMN mcp_api_keys.key_hash IS 'bcrypt hash of the full API key. The full key is only shown once at creation.';
COMMENT ON COLUMN mcp_api_keys.scopes IS 'Allowed operations: read (query data), write (create/update), delete (remove records)';
COMMENT ON COLUMN mcp_api_keys.is_active IS 'Whether the key is currently active. Set to false to temporarily disable.';
COMMENT ON COLUMN mcp_api_keys.revoked_at IS 'Timestamp when the key was revoked. Revoked keys cannot be reactivated.';
