import bcrypt from 'bcryptjs'
import { col } from './db'

let seeded = false

export async function seed() {
  if (seeded) return
  const users = await col('users')
  if (await users.countDocuments({ email: 'admin@magentainvestments.ae' }) > 0) {
    seeded = true
    return
  }

  const demoUsers = [
    ['System Admin',   'admin@magentainvestments.ae',    'admin123',    'admin',           'IT'],
    ['John CEO',       'ceo@magentainvestments.ae',       'password123', 'ceo',             'Executive'],
    ['Sarah Head',     'depthead@magentainvestments.ae',  'password123', 'department_head', 'Finance'],
    ['Mike Manager',   'manager@magentainvestments.ae',   'password123', 'manager',         'Operations'],
    ['Alice Employee', 'alice@magentainvestments.ae',     'password123', 'employee',        'Operations'],
    ['Bob Employee',   'bob@magentainvestments.ae',       'password123', 'employee',        'Finance'],
  ]

  for (const [name, email, pwd, role, department] of demoUsers) {
    await users.insertOne({
      name, email, role, department,
      is_active: true,
      password_hash: await bcrypt.hash(pwd, 10),
      created_at: new Date(),
    })
  }

  const admin = await users.findOne({ email: 'admin@magentainvestments.ae' })
  const adminId = admin._id.toString()

  const companies = await col('companies')
  await companies.insertMany([
    {
      name: 'Magenta Investments LLC',
      trade_name: 'Magenta Investments',
      trade_license_no: 'DED-2024-001',
      vat_number: '100234567890003',
      address: 'Office 401, Tower A, Business Bay',
      city: 'Dubai', country: 'UAE',
      phone: '+971 4 123 4567',
      email: 'info@magentainvestments.ae',
      website: 'www.magentainvestments.ae',
      logo_filename: null,
      owner_id: adminId,
      is_active: true,
      created_at: new Date(),
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
