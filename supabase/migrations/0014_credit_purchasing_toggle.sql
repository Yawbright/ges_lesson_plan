-- Temporary purchase lock. Packages remain visible, checkout is controlled by this setting.

insert into public.admin_app_settings (key, value)
values ('credit_purchasing', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;
