-- Security advisor fixes.
-- decrement_stock: pin search_path so it can't be redirected to other schemas.
alter function public.decrement_stock(bigint, integer) set search_path = public;

-- rls_auto_enable is an event-trigger helper; nobody should call it via the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
