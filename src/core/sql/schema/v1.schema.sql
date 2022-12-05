-- schema.sql
-- can only be run after the bootstrap.sql file is run manually to setup the db

-- GENERAL ------------------------------------------------------------

create schema admin;

CREATE OR REPLACE FUNCTION random_between(low INT ,high INT)
   RETURNS INT AS
$$
BEGIN
   RETURN floor(random()* (high-low + 1) + low);
END;
$$ language 'plpgsql' STRICT;

-- VERSION CONTROL ---------------------------------------------------

-- reference table
create table admin.database_version_control (
  id bigserial primary key,
  version bigint not null,
  completed timestamp default current_timestamp
);

-- AUTHENTICATION ---------------------------------------------------

create table admin.users (
  user_id bigserial primary key,
  active bool not null default true,
  email varchar(255) unique not null,
  is_email_verified bool not null default false,
  password varchar(128) not null,
  created_at timestamp not null default current_timestamp
);

-- make room for manually created service accounts
alter sequence admin.users_user_id_seq restart with 100; 

create table admin.avatars(
  user_id bigint not null references admin.users(user_id),
  avatar varchar(64) unique not null,
  url varchar(128),
  created_at timestamp not null default current_timestamp,
  primary key (user_id, avatar)
);

create table admin.avatars_history(
  avatar_history_id bigserial primary key,
  user_id bigint not null references admin.users(user_id),
  avatar varchar(64) not null,
  url varchar(128),
  created_at timestamp not null,
  changed_at timestamp not null default current_timestamp
);

create type admin.token_type as enum (
  'Confirm',
  'Deny'
);

create table admin.tokens (
  token_id bigserial primary key,
  user_id bigint references admin.users(user_id),
  created_at timestamp not null default current_timestamp,
  token text
);

create index on admin.tokens(token);
create index on admin.tokens(user_id, token);

create table admin.email_tokens(
  token varchar(64) primary key,
  user_id bigint not null references admin.users(user_id),
  type admin.token_type not null,
  created_at timestamp not null default current_timestamp
);

create table admin.reset_tokens(
  token varchar(64) primary key,
  user_id bigint not null references admin.users(user_id),
  created_at timestamp not null default current_timestamp
);

create table admin.websocket_sessions (
  websocket_session_id varchar(64) not null primary key,
  user_id bigint references admin.users(user_id),
  created_at timestamp not null default current_timestamp,
  token text not null -- one to many
);

create index on admin.websocket_sessions (user_id);

create type admin.email_sent_type as enum (
  'Register',
  'PasswordReset'
);

create type admin.email_response_type as enum (
  'Bounce',
  'Complaint',
  'Delivery'
);

create table admin.emails_sent (
  email_sent_id bigserial primary key,
  email varchar(255) not null,
  message_id varchar(64) not null,
  type admin.email_sent_type not null,
  response admin.email_response_type,
  created_at timestamp not null default current_timestamp
);

create index on admin.emails_sent (message_id);

create table admin.emails_blocked (
  email varchar(255) primary key,
  created_at timestamp not null default current_timestamp
);

create table admin.notifications (
  notification_id bigserial primary key,
  user_id bigint not null references admin.users(user_id),
  is_notified bool not null default false,
  text text,
  created_at timestamp not null default current_timestamp
);

create index on admin.notifications (user_id, is_notified);

-- Organizations, Roles, Authorization -----------------------------------------------

create table admin.site_admins(
  id bigserial primary key,
  name varchar(64) not null unique
);

create table admin.organizations (
  id bigserial primary key,
  name varchar(128) not null unique
);

create table admin.roles (
  id bigserial primary key,
  organization bigint not null references admin.organizations(id),
  name varchar(64) not null,
  unique (organization, name)
);

-- language skill ---------------------------------------------------
create type admin.language_skill_enum as enum (
  '1',
  '2',
  '3',
  '4',
  '5'
);

create table admin.language_skills (
  id bigserial primary key,
  user_id varchar(512) not null, -- prolly will change, not sure how we will reference users yet
  language_table varchar(64) not null,
  language_id bigint not null,
  skill_level admin.language_skill_enum not null,
  unique (user_id, language_table, language_id)
);

-- site text ---------------------------------------------------
create table admin.app_list (
  id bigserial primary key,
  app_name varchar(128)
);

create table admin.site_text_keys (
  id bigserial primary key,
  app bigint not null references admin.app_list(id),
  language_table varchar(64) not null,
  language_id bigint not null,
  site_text_key varchar(512) not null,
  description varchar(512),
  unique (app, site_text_key)
);

-- site text translation ---------------------------------------------------
create table admin.site_text_translations(
  id bigserial primary key,
  site_text bigint not null references admin.site_text_keys(id),
  language_table varchar(64) not null,
  language_id bigint not null,
  user_id varchar(512) not null, -- prolly will change, not sure how we will reference users yet
  site_text_translation varchar(512) not null,
  description_translation varchar(512) not null,
  unique (site_text, site_text_translation)
);

-- voting ---------------------------------------------------
create table admin.votables(
  table_name varchar(64) not null unique
);

create table admin.elections (
  id bigserial primary key,
  app_id bigint not null, -- todo, references app
  name varchar(128) not null,
  table_name varchar(64) not null references admin.votables(table_name),
  row bigint not null,
  created_by varchar(512), -- placeholder, not sure how to reference users yet
  unique (app_id, name)
);

create table admin.ballot_entries (
  id bigserial primary key,
  election_id bigint not null references admin.elections(id),
  table_name varchar(64) not null references admin.votables(table_name),
  row bigint not null,
  created_by varchar(512) -- placeholder, not sure how to reference users yet
);

create table admin.votes (
  id bigserial primary key,
  user_id varchar(512),
  ballot_entry_id bigint not null references admin.ballot_entries(id),
  up bool not null, -- true = up vote, false = down vote, delete record to remove vote from user
  unique (user_id, ballot_entry_id)
);

-- discussion ---------------------------------------------------
create table admin.discussions (
  id bigserial primary key,
  app bigint not null references admin.app_list(id),
  org bigint not null references admin.organizations(id),
  table_name varchar(64) not null,
  row bigint not null
);

create table admin.posts (
  id bigserial primary key,
  discussion bigint references admin.discussions(id),
  user_id varchar(512) not null, -- prolly will change, not sure how we will reference users yet
  quill_text text,
  plain_text text,
  postgres_language regconfig not null default 'simple',
  search_text tsvector generated always as (
  		to_tsvector(
   			postgres_language,
  			plain_text
  		)
  ) stored,
  created_at timestamp default current_timestamp
);

create index posts_search_gin on admin.posts using gin (search_text);

create table admin.reactions (
  id bigserial primary key,
  user_id varchar(512) not null, -- will change, we use sso to track users
  content bigint not null, -- will change, not sure what format reactions need to take just yet
  unique (user_id, content)
);

-- DATASETS ---------------------------------------------------------

create type iso_639_2_entry_type as enum (
  'B', -- Bibliograph
  'T'  -- Terminology
       -- null represents both
);

-- https://www.loc.gov/standards/iso639-2/php/code_list.php
create table iso_639_2 (
  id bigserial primary key,
  iso_639_2 varchar(3),
  entry_type iso_639_2_entry_type,
  iso_639_1 varchar(2),
  english_name varchar(128),
  french_name varchar(128),
  german_name varchar(128)
);

-- https://www.loc.gov/standards/iso639-5/id.php
create table iso_639_5 (
  id bigserial primary key,
  identifier varchar(3) not null,
  english_name varchar(128),
  french_name varchar(128),
  iso_639_2 varchar(128),
  hierarchy varchar(128),
  notes varchar(128)
);

-- SIL TABLES: http://www.iso639-3.sil.org/

-- I(ndividual), M(acrolanguage), S(pecial)
create type iso_639_3_scope_type as enum (
 'I',
 'M',
 'S'
);

-- A(ncient), C(onstructed), E(xtinct), H(istorical), L(iving), S(pecial)
create type iso_639_3_entry_type as enum (
 'A',
 'C',
 'E',
 'H',
 'L',
 'S'
);

create table iso_639_3 (
  id bigserial primary key,
  iso_639_3 varchar(3) not null, -- The three-letter 639-3 identifier
  part_2b varchar(3) null, -- Equivalent 639-2 identifier of the bibliographic applications code set, if there is one
  part_2t varchar(3) null, -- Equivalent 639-2 identifier of the terminology applications code set, if there is one
  part_1 varchar(2) null, -- Equivalent 639-1 identifier, if there is one
  scope iso_639_3_scope_type not null, -- I(ndividual), M(acrolanguage), S(pecial)
  entry_type  iso_639_3_entry_type not null, -- A(ncient), C(onstructed), E(xtinct), H(istorical), L(iving), S(pecial)
  ref_name varchar(150) not null, -- Reference language name 
  comment varchar(150) null -- Comment relating to one or more of the columns
);

create table iso_639_3_names (
  id bigserial primary key,
  iso_639_3 varchar(3) not null, -- three letter 639-3 identifier
  print_name varchar(75) not null, -- one of the names associated with this identifier
  inverted_name varchar(75) not null -- the inverted form of this print_name form
);

-- Active, Retired
create type iso_639_3_status_type as enum (
  'A', 
  'R' 
);

CREATE TABLE iso_639_3_macrolanguages (
  id bigserial primary key,
  m_id varchar(3) not null, -- the identifier for a macrolanguage
  i_id varchar(3) not null, -- the identifier for an individual language that is a member of the macrolanguage
  i_status iso_639_3_status_type not null -- indicating the status of the individual code element
);

create type iso_639_3_retirement_reason_options as enum (
  'C', -- Change
  'D', -- Duplicate
  'N', -- Non-existent
  'S', -- Split
  'M' -- Merge
);

create table iso_639_3_retirements (
  id bigserial primary key,
  iso_639_3 varchar(3) not null, -- three letter 639-3 identifier
  ref_name varchar(150) not null, -- reference name of the language
  ret_reason iso_639_3_retirement_reason_options, -- code for retirement
  change_to varchar(3), -- in the cases of C, D, and M, the identifier to which all instances of this id should be changed
  ret_remedy varchar(300), -- the instructions for updating an instance of the retired (split) identifier
  effective timestamp not null -- the date the retirement became effective
);

create type progress_bible_language_details_unit_type as enum (
  'L', 
  'S',
  'D' 
);

create type progress_bible_language_details_code_status as enum (
  'Active', 
  'Retired'
);

create type progress_bible_language_details_language_status as enum (
  'Living', 
  'Extinct'
);

create table progress_bible_language_details(
  id bigserial primary key,
  unit_code varchar(5)  not null,
  unit_type progress_bible_language_details_unit_type not null,
  unit_name varchar(200) not null,
  unit_full_name varchar(200) not null,
  ethnologue_name varchar(200),
  iso_639_3_code varchar(5),
  is_sign_language bool,
  code_status progress_bible_language_details_code_status not null,
  language_status progress_bible_language_details_language_status not null,
  language_scope varchar(20),
  primary_continent varchar(200),
  primary_country_name varchar(200),
  primary_country_code varchar(2),
  retirement_explanation varchar(500),
  how_to_fix varchar(500),
  retired_date timestamp,
  show_active_language bool,
  show_retired_language bool,
  show_active_dialect bool,
  show_retired_dialect bool,
  show_sign_language bool
);

create table sil_country_codes(
    id bigserial primary key,
    code varchar(2) not null,
    name varchar(200) not null,
    area varchar(200) not null
);

create type sil_language_codes_status as enum (
 'L',
 'X'
);

create table sil_language_codes(
    id bigserial primary key,
    code varchar(3) not null,
    country_code varchar(2) not null,
    status sil_language_codes_status not null,
    name varchar(200) not null
);

create table sil_language_index(
    id bigserial primary key,
    language_code varchar(3) not null,
    country_code varchar(2) not null,
    name_type varchar(2) not null,
    name varchar(200) not null
);

create table uf_additional_languages(
    id bigserial primary key,
    ietf_tag varchar(200),
    two_letter varchar(2),
    three_letter varchar(3),
    common_name varchar(200),
    native_name varchar(200),
    direction varchar(3),
    comment varchar(500)
);

create table uf_countries_list(
    id bigserial primary key,
    code varchar(2),
    alpha_3_code varchar(3),
    name varchar(200),
    region varchar(200),
    wa_region varchar(200),
    population int
);

create table uf_langnames(
    id bigserial primary key,
    code varchar(100),
    name varchar(200)
);

create table uf_languages_with_bible_portions(
    id bigserial primary key,
    language varchar(200),
    media varchar(25),
    published bool default false,
    info varchar(500)
);

create table uf_languages_with_gospel_recording(
    id bigserial primary key,
    language varchar(200),
    media varchar(25),
    published bool default false,
    info varchar(500)
);

create table uf_languages_with_jesus_film(
     id bigserial primary key,
     language varchar(200),
     media varchar(25),
     published bool default false,
     info varchar(500)
 );

create table uf_languages_with_one_story_bible_stories(
    id bigserial primary key,
    language varchar(200),
    media varchar(25),
    published bool default false,
    info varchar(500)
);

create table uf_languages_with_open_bible_stories(
    id bigserial primary key,
    language varchar(200),
    media varchar(25),
    published bool default false,
    info text
);

create table uf_languages_with_radio_broadcast(
    id bigserial primary key,
    language varchar(200),
    media varchar(25),
    published bool default false,
    info text
);

create table uf_languages(
    id bigserial primary key,
    code varchar(50) not null,
    iso_639_3 varchar(3),
    name varchar(200) not null,
    alternate_name text,
    anglicized_name varchar(200),
    country varchar(200),
    gateway_language varchar(200),
    gw varchar(200)
);

create table uf_networks(
    id bigserial primary key,
    network varchar(200),
    countries text,
    languages text
);

create table gsec_listing_of_people_groups(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(512),
    continent varchar(200),
    sub_continent varchar(200),
    country varchar(200),
    country_of_origin varchar(200),
    people_group varchar(200),
    global_status_of_evangelical_christianity int,
    evangelical_engagement bool,
    population bigint, -- confirm
    dispersed bool,
    rol varchar(3),
    language varchar(200),
    religion varchar(200),
    nomadic bool,
    nomadic_type int,
    nomadic_description varchar(200),
    written_scripture bool,
    jesus_film bool,
    radio_broadcast bool,
    gospel_recording bool,
    audio_scripture bool,
    gospel_films bool,
    the_hope bool,
    resources int, -- 25
    physical_exertion varchar(25), -- can be enum
    freedom_index varchar(25), -- can be enum
    government_restrictions_index text, -- can be enum some rows have detailed text
    social_hostilities_index varchar(25), -- can be enum
    threat_level varchar(250),
    rop1 varchar(5),
    rop2 varchar(10),
    rop3 int,
    people_name varchar(200),
    genc varchar(3),
    fips varchar(2),
    fips_of_origin varchar(2),
    latitude varchar(50),
    longitude varchar(50),
    imb_affinity_group varchar(200),
    not_engaged_anywhere varchar(5),
    spi int,
    strategic_priority_index varchar(200),
    population_layer varchar(50)
);

--2022-08_GSEC_Listing_of_Unengaged_Unreached_People_Groups
create table gsec_listing_of_unengaged_unreached_people_groups(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(200),
    continent varchar(200),
    sub_continent varchar(200),
    country varchar(200),
    country_of_origin varchar(200),
    people_group varchar(200),
    global_status_of_evangelical_christianity int,
    evangelical_engagement bool,
    population bigint,
    dispersed bool,
    rol varchar(3),
    language varchar(200),
    religion varchar(200),
    nomadic bool,
    nomadic_type int,
    nomadic_description varchar(200),
    published_scripture bool,
    jesus_film bool,
    radio_broadcast bool,
    gospel_recording bool,
    audio_scripture bool,
    gospel_films bool,
    the_hope bool,
    resources int,
    physical_exertion varchar(25),
    freedom_index varchar(25),
    government_restrictions_index text,
    social_hostilities_index varchar(25),
    threat_level varchar(250),
    rop1 varchar(5),
    rop2 varchar(10),
    rop3 int,
    rop_people_name varchar(200),
    genc varchar(3),
    fips  varchar(2),
    fips_of_origin varchar(2),
    latitude varchar(50),
    longitude varchar(50),
    imb_affinity_group varchar(200),
    not_engaged_anywhere varchar(5),
    spi int,
    strategic_priority_index varchar(200),
    ror varchar(10),
    diaspora  bool
);

create table gsec_listing_of_unreached_people_groups(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(200),
    continent varchar(200),
    sub_continent varchar(200),
    country varchar(200),
    country_of_origin varchar(200),
    people_group varchar(200),
    global_status_of_evangelical_christianity int,
    evangelical_engagement bool,
    population bigint,
    dispersed bool,
    rol varchar(3),
    language varchar(200),
    religion varchar(200),
    nomadic bool,
    nomadic_type int,
    nomadic_description varchar(200),
    published_scripture bool,
    jesus_film bool,
    radio_broadcast bool,
    gospel_recording bool,
    audio_scripture bool,
    gospel_films bool,
    the_hope bool,
    resources int,
    physical_exertion varchar(25),
    freedom_index varchar(25),
    government_restrictions_index text,
    social_hostilities_index varchar(25),
    threat_level varchar(250),
    rop1 varchar(5),
    rop2 varchar(10),
    rop3 int,
    rop_people_name varchar(200),
    genc varchar(3),
    fips varchar(2),
    fips_of_origin varchar(2),
    latitude varchar(50),
    longitude varchar(50),
    imb_affinity_group varchar(200),
    not_engaged_anywhere varchar(5),
    spi int,
    strategic_priority_index varchar(200)
);

create table gsec_listing_of_uupg_100k_additions(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(200),
    country varchar(200),
    people_group varchar(200),
    global_status_of__evangelical_christianity int,
    language varchar(200),
    religion varchar(200),
    population bigint,
    addition_date timestamp,
    addition_reasons text
);

create table gsec_listing_of_uupg_100k_removals(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(200),
    country varchar(200),
    people_group varchar(200),
    global_status_of_evangelical_christianity int,
    language varchar(200),
    religion varchar(200),
    population bigint,
    addition_date timestamp,
    addition_reasons text
);

create table gsec_listing_of_uupg_100k(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(200),
    continent varchar(200),
    sub_continent varchar(200),
    country varchar(200),
    country_of_origin varchar(200),
    people_group varchar(200),
    global_status_of_evangelical_christianity int,
    rol varchar(3),
    language varchar(200),
    religion varchar(200),
    nomadic bool,
    nomadic_type int,
    nomadic_description varchar(200),
    population bigint,
    dispersed bool,
    published_scripture bool,
    jesus_film bool,
    radio_broadcast bool,
    gospel_recording bool,
    audio_scripture bool,
    gospel_films bool,
    the_hope bool,
    resources int,
    physical_exertion varchar(25),
    freedom_index varchar(25),
    government_restrictions_index text,
    social_hostilities_index varchar(25),
    threat_level varchar(250),
    rop1 varchar(5),
    rop2 varchar(10),
    rop3 int,
    people_name varchar(200),
    genc varchar(3),
    fips varchar(2),
    fips_of_origin varchar(2),
    latitude varchar(50),
    longitude varchar(50),
    addition bool,
    addition_date timestamp,
    addition_reasons text,
    imb_affinity_group varchar(200),
    not_engaged_anywhere varchar(50),
    spi int,
    strategic_priority_index varchar(200)
);

create table people_groups_data_only(
    id bigserial primary key,
    peid bigint,
    affinity_bloc varchar(200),
    people_cluster varchar(512),
    continent varchar(200),
    sub_continent varchar(200),
    country varchar(200),
    country_of_origin varchar(200),
    people_group varchar(200),
    global_status_of_evangelical_christianity int,
    evangelical_engagement bool,
    population bigint,
    dispersed bool,
    rol varchar(3),
    language varchar(200),
    religion varchar(200),
    nomadic bool,
    nomadic_type int,
    nomadic_description varchar(200),
    written_scripture bool,
    jesus_film bool,
    radio_broadcast bool,
    gospel_recording bool,
    audio_scripture bool,
    gospel_films bool,
    the_hope bool,
    resources int,
    physical_exertion varchar(25),
    freedom_index varchar(25),
    government_restrictions_index text,
    social_hostilities_index varchar(25),
    threat_level varchar(250),
    rop1 varchar(5),
    rop2 varchar(10),
    rop3 int,
    people_name varchar(200),
    genc varchar(3),
    fips varchar(2),
    fips_of_origin varchar(2),
    latitude varchar(50),
    longitude varchar(50),
    imb_affinity_group varchar(200),
    not_engaged_anywhere varchar(5),
    spi int,
    strategic_priority_index varchar(200),
    population_layer varchar(50)
);

create table rod_dialects(
    id bigserial primary key,
    dialect_code varchar(10),
    language_code varchar(3),
    country_code varchar(2),
    dialect_name varchar(200),
    language_name varchar(200),
    location_name varchar(200)
);

create table rod_changelist(
    id bigserial primary key,
    dialect_code varchar(10),
    date timestamp,
    change_type varchar(3),
    prev_language_code varchar(3),
    new_language_code varchar(3),
    explanation text
);

create table rod_alternatenameindex(
    id bigserial primary key,
    dialect_code varchar(10),
    variant_name varchar(500)
);

create table glottolog_language(
    id bigserial primary key,
    glottocode varchar(20),
    name varchar(200),
    top_level_family varchar(200),
    iso_639_3 varchar(3),
    macro_area varchar(200),
    child_dialects int,
    latitude varchar(50),
    longitude varchar(50)
);

create table glottolog_family(
    id bigserial primary key,
    name varchar(200),
    level varchar(200),
    macro_area varchar(550),
    sub_families int,
    child_languages int,
    top_level_family int
);