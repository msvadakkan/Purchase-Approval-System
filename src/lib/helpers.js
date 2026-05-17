import { ObjectId } from 'mongodb'

export function normalize(doc) {
  if (!doc) return null
  const obj = { ...doc }
  if (obj._id) {
    obj.id = obj._id.toString()
    delete obj._id
  }
  for (const [k, v] of Object.entries(obj)) {
    if (v instanceof ObjectId) {
      obj[k] = v.toString()
    } else if (v instanceof Date) {
      obj[k] = v.toISOString()
    } else if (Array.isArray(v)) {
      obj[k] = v.map(item =>
        item && typeof item === 'object' && !(item instanceof ObjectId) && !(item instanceof Date)
          ? normalize(item)
          : item instanceof ObjectId ? item.toString()
          : item instanceof Date ? item.toISOString()
          : item
      )
    } else if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
      obj[k] = normalize(v)
    }
  }
  return obj
}

export function normalizeMany(docs) {
  return Array.from(docs).map(normalize)
}

export function toObjectId(id) {
  try { return new ObjectId(id) } catch { return null }
}

export function now() {
  return new Date()
}
