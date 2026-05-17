import bcrypt from 'bcryptjs'
import { col } from './db'

let seeded = false

export async function seed() {
  if (seeded) return
  const users = await col('users')
  if (await users.countDocuments({ email: 'admin@company.com' }) > 0) {
    seeded = true
    return
  }

  const demoUsers = [
    ['System Admin',   'admin@company.com',    'admin123',    'admin',           'IT'],
    ['John CEO',       'ceo@company.com',       'password123', 'ceo',             'Executive'],
    ['Sarah Head',     'depthead@company.com',  'password123', 'department_head', 'Finance'],
    ['Mike Manager',   'manager@company.com',   'password123', 'manager',         'Operations'],
    ['Alice Employee', 'alice@company.com',     'password123', 'employee',        'Operations'],
    ['Bob Employee',   'bob@company.com',       'password123', 'employee',        'Finance'],
  ]

  for (const [name, email, pwd, role, department] of demoUsers) {
    await users.insertOne({
      name, email, role, department,
      is_active: true,
      password_hash: await bcrypt.hash(pwd, 10),
      created_at: new Date(),
    })
  }

  const admin = await users.findOne({ email: 'admin@company.com' })
  const adminId = admin._id.toString()

  const companies = await col('companies')
  await companies.insertMany([
    {
      name: 'Alpha Trading LLC',
      trade_license_no: 'DED-2024-001',
      vat_number: '100234567890003',
      address: 'Office 401, Tower A, Business Bay',
      city: 'Dubai', country: 'UAE',
      phone: '+971 4 123 4567', email: 'info@alphatrading.ae',
      website: 'www.alphatrading.ae', logo_filename: null,
      owner_id: adminId, created_at: new Date(),
    },
    {
      name: 'Beta Supplies FZE',
      trade_license_no: 'JAFZA-2024-088',
      vat_number: '100456789012003',
      address: 'Warehouse 12, Jebel Ali Free Zone',
      city: 'Dubai', country: 'UAE',
      phone: '+971 4 987 6543', email: 'info@betasupplies.ae',
      website: 'www.betasupplies.ae', logo_filename: null,
      owner_id: adminId, created_at: new Date(),
    },
  ])

  const levels = await col('approval_levels')
  await levels.insertMany([
    { role: 'manager',         label: 'Manager',         max_amount: 5000,      updated_at: new Date() },
    { role: 'department_head', label: 'Department Head', max_amount: 25000,     updated_at: new Date() },
    { role: 'ceo',             label: 'CEO',             max_amount: 999999999, updated_at: new Date() },
  ])

  seeded = true
}
