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

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    months_id INTEGER, -- declara a coluna
    tipo VARCHAR(20) NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC DEFAULT 0,
    data DATE,
    FOREIGN KEY (months_id) REFERENCES months(id) -- define a foreign key
);
