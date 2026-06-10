--Themes table
create table themes (
  theme_id bigint generated always as identity primary key,
  theme_name text not null unique
);

--Lego sets table
create table lego_sets (
  set_id bigint generated always as identity primary key,
  set_name text not null,
  theme_id bigint not null references themes(theme_id),
  set_number text unique not null,
  release_year int,
  price numeric(10, 2) not null default 0,
  stock int default 0,
  image_url text,
  created_at timestamp default now()
);