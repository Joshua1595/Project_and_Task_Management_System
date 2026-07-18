import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

dotenv.config({ override: true });

// Identified region for project 'onuzesxydxqtshnuklhv' is Stockholm (eu-north-1)
const config = {
  user: 'postgres.onuzesxydxqtshnuklhv',
  password: '@Jeremy583414',
  host: 'aws-0-eu-north-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const schemaSql = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  profile_image TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at VARCHAR(255) NOT NULL,
  updated_at VARCHAR(255) NOT NULL
);

-- Create Projects table
CREATE TABLE projects (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  start_date VARCHAR(50) NOT NULL,
  end_date VARCHAR(50) NOT NULL,
  manager_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at VARCHAR(255) NOT NULL,
  updated_at VARCHAR(255) NOT NULL
);

-- Create Tasks table
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  deadline VARCHAR(50) NOT NULL,
  created_at VARCHAR(255) NOT NULL,
  updated_at VARCHAR(255) NOT NULL
);

-- Create Assignments table
CREATE TABLE assignments (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  assigned_at VARCHAR(255) NOT NULL
);
`;

async function run() {
  try {
    console.log(`Resolving pooler host to IPv4: ${config.host}...`);
    const dnsResult = await lookup(config.host, { family: 4 });
    console.log(`Resolved ${config.host} to IPv4: ${dnsResult.address}`);
    config.host = dnsResult.address;

    console.log('Connecting to Supabase PostgreSQL database via pooler...');
    const client = new pg.Client(config);
    await client.connect();
    console.log('Connected successfully!');
    
    console.log('Executing schema creation SQL...');
    await client.query(schemaSql);
    console.log('Tables created successfully in Supabase!');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

run();
