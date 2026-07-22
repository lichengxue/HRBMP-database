-- Let the HRBMP admin review data requests from the browser after Supabase
-- Auth login. Public users can still only insert requests.

create or replace function public.is_hrbmp_request_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select auth.jwt() ->> 'email') = 'chengxue.li@stonybrook.edu', false);
$$;

comment on function public.is_hrbmp_request_admin() is
  'True for the HRBMP data-request admin account allowed to review submitted requests from the GUI.';

grant execute on function public.is_hrbmp_request_admin() to authenticated;
grant select on public.hrbmp_data_requests to authenticated;
grant update (request_status) on public.hrbmp_data_requests to authenticated;

drop policy if exists "HRBMP admins can read data requests"
on public.hrbmp_data_requests;

create policy "HRBMP admins can read data requests"
on public.hrbmp_data_requests
for select
to authenticated
using ((select public.is_hrbmp_request_admin()));

drop policy if exists "HRBMP admins can update request status"
on public.hrbmp_data_requests;

create policy "HRBMP admins can update request status"
on public.hrbmp_data_requests
for update
to authenticated
using ((select public.is_hrbmp_request_admin()))
with check (
  (select public.is_hrbmp_request_admin())
  and request_status in ('submitted', 'reviewing', 'approved', 'declined')
);
