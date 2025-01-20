import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

export async function openDatabase() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE,
        telefone TEXT,
        dataMatricula TEXT,
        valorMensalidade REAL
      );
      CREATE TABLE IF NOT EXISTS pagamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alunoId INTEGER,
        dataPagamento TEXT,
        valor REAL,
        periodo INTEGER,
        FOREIGN KEY (alunoId) REFERENCES alunos(id)
      );
    `);
  }
  return db;
}

export async function getAlunos() {
  const db = await openDatabase();
  return db.all('SELECT * FROM alunos');
}

export async function addAluno(aluno: Omit<Aluno, 'id'>) {
  const db = await openDatabase();
  const result = await db.run(
    'INSERT INTO alunos (nome, email, telefone, dataMatricula, valorMensalidade) VALUES (?, ?, ?, ?, ?)',
    [aluno.nome, aluno.email, aluno.telefone, aluno.dataMatricula, aluno.valorMensalidade]
  );
  return { ...aluno, id: result.lastID };
}

export async function getPagamentos() {
  const db = await openDatabase();
  return db.all(`
    SELECT pagamentos.*, alunos.nome as alunoNome
    FROM pagamentos
    JOIN alunos ON pagamentos.alunoId = alunos.id
  `);
}

export async function addPagamento(pagamento: Omit<Pagamento, 'id'>) {
  const db = await openDatabase();
  const result = await db.run(
    'INSERT INTO pagamentos (alunoId, dataPagamento, valor, periodo) VALUES (?, ?, ?, ?)',
    [pagamento.alunoId, pagamento.dataPagamento, pagamento.valor, pagamento.periodo]
  );
  return { ...pagamento, id: result.lastID };
}

export async function getAlunosComMensalidadesVencidas() {
  const db = await openDatabase();
  const dataAtual = new Date().toISOString().split('T')[0];
  return db.all(`
    SELECT alunos.*, MAX(pagamentos.dataPagamento) as ultimoPagamento,
           DATE(MAX(pagamentos.dataPagamento), '+' || pagamentos.periodo || ' months') as dataVencimento
    FROM alunos
    LEFT JOIN pagamentos ON alunos.id = pagamentos.alunoId
    GROUP BY alunos.id
    HAVING dataVencimento < ?
    ORDER BY dataVencimento
  `, [dataAtual]);
}

