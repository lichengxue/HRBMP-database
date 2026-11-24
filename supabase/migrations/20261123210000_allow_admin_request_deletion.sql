-- Request-review admins can remove individual intake requests from the GUI.
-- This permission does not apply to scientific records, archive assets, or Auth users.
begin;

revoke delete on public.hrbmp_data_requests from anon;
grant delete on public.hrbmp_data_requests to authenticated;

drop policy if exists "HRBMP admins can delete data requests"
on public.hrbmp_data_requests;

create policy "HRBMP admins can delete data requests"
on public.hrbmp_data_requests
for delete
to authenticated
using (
  (select public.is_hrbmp_request_admin())
  and request_status <> 'packaging'
);

commit;
