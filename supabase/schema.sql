-- Esegui questo nella SQL Editor di Supabase (https://supabase.com/dashboard → SQL Editor)

-- Tabella RSVP principale (un row per invitato)
CREATE TABLE IF NOT EXISTS rsvp (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  nome        text NOT NULL,
  cognome     text NOT NULL,
  partecipa   boolean NOT NULL DEFAULT true,
  menu        text NOT NULL DEFAULT 'standard',
  allergie    text,
  CONSTRAINT rsvp_nome_cognome_unique UNIQUE (nome, cognome)
);

-- Accompagnatori (un row per persona aggiuntiva)
CREATE TABLE IF NOT EXISTS rsvp_accompagnatori (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id  uuid NOT NULL REFERENCES rsvp(id) ON DELETE CASCADE,
  nome     text NOT NULL,
  cognome  text NOT NULL,
  menu     text NOT NULL DEFAULT 'standard',
  allergie text
);

-- Richieste regalo (solo per il riepilogo admin)
CREATE TABLE IF NOT EXISTS regali (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nome       text,
  email      text NOT NULL,
  importo    integer,
  messaggio  text
);

-- Row Level Security: disabilita (il sito accede solo via service role key server-side)
ALTER TABLE rsvp               DISABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_accompagnatori DISABLE ROW LEVEL SECURITY;
ALTER TABLE regali             DISABLE ROW LEVEL SECURITY;
