-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.birthdays (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  date text NOT NULL,
  note text,
  group text DEFAULT 'other'::text CHECK ("group" = ANY (ARRAY['family'::text, 'friend'::text, 'work'::text, 'other'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT birthdays_pkey PRIMARY KEY (id),
  CONSTRAINT birthdays_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);