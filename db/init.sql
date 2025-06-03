CREATE TABLE IF NOT EXISTS months (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    itau NUMERIC DEFAULT 0,
    nubank NUMERIC DEFAULT 0,
    salario NUMERIC DEFAULT 0,
    saldo_extra NUMERIC DEFAULT 0,
    saldo_anterior NUMERIC DEFAULT 0,
    saldo_final NUMERIC DEFAULT 0
);
