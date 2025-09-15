You can test the postgresql connection using

`psql -U postgres -d patient_vitals`

`SELECT count(*) FROM pg_tables WHERE schemaname = 'public';`

`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
