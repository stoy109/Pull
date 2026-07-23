begin;

-- Compatibility no-op: the RBAC/profile foundation and canonical activity log
-- schema are owned by migrations 202607230001 and 202607230003 respectively.
-- This legacy version is retained only so existing migration histories remain valid.

commit;
