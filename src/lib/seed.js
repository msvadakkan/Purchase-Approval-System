import { col } from './db'

let seeded = false

export async function seed() {
  if (seeded) return

  const levels = await col('approval_levels')
  if (await levels.countDocuments() > 0) {
    seeded = true
    return
  }

  // Approval thresholds only — no demo users
  await levels.insertMany([
    { role: 'manager',         label: 'Manager',         max_amount: 5000,      updated_at: new Date() },
    { role: 'department_head', label: 'Department Head', max_amount: 25000,     updated_at: new Date() },
    { role: 'ceo',             label: 'CEO',             max_amount: 999999999, updated_at: new Date() },
  ])

  const companies = await col('companies')
  if (await companies.countDocuments({ name: 'Magenta Investments LLC' }) === 0) {
    await companies.insertOne({
      name:             'Magenta Investments LLC',
      trade_name:       'Magenta Investments',
      trade_license_no: '',
      vat_number:       '100234567890003',
      address:          '4903 Aspin Commercial Tower, Sheikh Zayed Road',
      city:             'Dubai',
      country:          'UAE',
      phone:            '+971 4 222 2500',
      email:            'info@magenta-investments.com',
      website:          'magenta-investments.com',
      logo_filename:    null,
      is_active:        true,
      created_at:       new Date(),
    })
  }

  seeded = true
}
