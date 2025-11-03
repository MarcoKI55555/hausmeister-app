-- Migration v2: create schema with logo support
CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);
INSERT INTO roles (name) VALUES ('hausverwaltung') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('vbr') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('hausmeister') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS liegenschaften (
  id serial PRIMARY KEY,
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_users (
  id serial PRIMARY KEY,
  auth_uid text UNIQUE,
  email text UNIQUE,
  name text,
  role_id int REFERENCES roles(id),
  hausverwaltung_id int,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invites (
  id serial PRIMARY KEY,
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  role_id int REFERENCES roles(id),
  liegenschaft_id int,
  hausverwaltung_id int,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS tasks (
  id serial PRIMARY KEY,
  liegenschaft_id int,
  nummer text,
  kategorie text,
  beschreibung text,
  verantwortung text,
  frequenz text,
  extern boolean DEFAULT false,
  template boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS time_entries (
  id bigserial PRIMARY KEY,
  user_id int REFERENCES app_users(id),
  liegenschaft_id int,
  task_id int REFERENCES tasks(id),
  start_datetime timestamptz,
  end_datetime timestamptz,
  note text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '1', '1. Kontrollgang durch alle techn. u. baulichen Bereiche', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '2', '2. Kontrolle u. Wartung der techn. u. baulichen Anlagen', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '3', '3. Ausführen von kleinen Reparaturen am Gemeinschaftlichen Eigentum', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '4', '4. Beaufsichtigung und Kontrolle bei Wartungs- und Reparaturarbeiten durch Fremdfirmen', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '5', '5. Reinigung der technischen und baulichen Anlagen', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '6', '6. Pflege der Außenanlagen', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '7', '7. Winterdienst', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '8', '8. Sonstige Arbeiten', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '9', '9. Koordination/Abstimmung der Einsätze externer Firmen/Handwerker mit der Verwaltung', '', '', false, true) ON CONFLICT DO NOTHING;
INSERT INTO tasks (liegenschaft_id, nummer, kategorie, beschreibung, frequenz, extern, template) VALUES (NULL, '10', 'PWW-Heizungsanlage', '', '', false, true) ON CONFLICT DO NOTHING;
