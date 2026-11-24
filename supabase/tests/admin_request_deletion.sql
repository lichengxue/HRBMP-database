-- Run against a migrated database as its administrator.
-- Only two unique fixture requests are inserted or deleted, then rolled back.
begin;

do $$
begin
  if exists (
    select 1 from public.hrbmp_data_requests
    where request_id in (
      '7b7c8468-d581-44fb-9d42-e2f89a0f6221'::uuid,
      '7b7c8468-d581-44fb-9d42-e2f89a0f6222'::uuid
    )
  ) then raise exception 'The deletion-test fixture IDs are already in use.';
  end if;
end $$;

insert into public.hrbmp_data_requests
  (request_id, requester_name, requester_email, request_status)
values
  ('7b7c8468-d581-44fb-9d42-e2f89a0f6221', 'TEST deletion policy rollback', 'hrbmp-delete-check@example.invalid', 'submitted'),
  ('7b7c8468-d581-44fb-9d42-e2f89a0f6222', 'TEST packaging policy rollback', 'hrbmp-delete-check@example.invalid', 'packaging');

do $$
begin
  perform set_config('request.jwt.claims', '{"email":"hrbmp-delete-check@example.invalid","role":"authenticated"}', true);
end $$;
set local role authenticated;
do $$
declare removed integer;
begin
  delete from public.hrbmp_data_requests
  where request_id in ('7b7c8468-d581-44fb-9d42-e2f89a0f6221', '7b7c8468-d581-44fb-9d42-e2f89a0f6222');
  get diagnostics removed = row_count;
  if removed <> 0 then raise exception 'An ordinary user deleted a request.'; end if;
end $$;
reset role;

set local role anon;
do $$
begin
  begin
    delete from public.hrbmp_data_requests where request_id = '7b7c8468-d581-44fb-9d42-e2f89a0f6221';
    raise exception 'Anonymous users unexpectedly have deletion permission.';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

do $$
declare reviewer text;
begin
  select admin_email into reviewer from public.hrbmp_request_admins
  where can_review_requests order by admin_email limit 1;
  if reviewer is null then raise exception 'No request-review admin is configured.'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('email', reviewer, 'role', 'authenticated')::text, true);
end $$;
set local role authenticated;
do $$
declare removed integer;
begin
  delete from public.hrbmp_data_requests where request_id = '7b7c8468-d581-44fb-9d42-e2f89a0f6222';
  get diagnostics removed = row_count;
  if removed <> 0 then raise exception 'A packaging request was deleted.'; end if;
  delete from public.hrbmp_data_requests where request_id = '7b7c8468-d581-44fb-9d42-e2f89a0f6221';
  get diagnostics removed = row_count;
  if removed <> 1 then raise exception 'The approved admin could not delete the fixture request.'; end if;
end $$;
reset role;
rollback;
select 'Admin deletion, ordinary-user denial, anonymous denial, and packaging protection passed; fixtures rolled back.' as result;
