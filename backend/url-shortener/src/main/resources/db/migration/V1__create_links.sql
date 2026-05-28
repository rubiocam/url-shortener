create table if not exists links (
                                     id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    original_url text not null,
    title text,
    notes text,
    archived boolean not null default false,
    click_count bigint not null default 0,
    last_clicked_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create table if not exists clicks (
                                      id uuid primary key default gen_random_uuid(),
    link_id uuid not null references links(id) on delete cascade,
    clicked_at timestamptz not null default now(),
    referrer text,
    user_agent text,
    ip_hash text
    );

create index if not exists idx_links_slug on links(slug);
create index if not exists idx_clicks_link_id_clicked_at on clicks(link_id, clicked_at desc);