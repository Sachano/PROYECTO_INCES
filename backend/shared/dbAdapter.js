import pkg from 'pg'
const { Pool } = pkg

const USE_PG = process.env.USE_PG === 'true'

let pool = null

function getPool() {
  if (pool) return pool
  pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASS || '',
    database: process.env.PG_DB || 'inces',
    max: 10,
    idleTimeoutMillis: 30000
  })
  return pool
}

// ============================================
// USERS
// ============================================
export async function readUsers() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    return await readJson('users.json')
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM users ORDER BY id')
  return res.rows
}

export async function findUserByEmail(email) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const users = await readJson('users.json')
    return users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email])
  return res.rows[0] || null
}

export async function findUserByCedula(cedula) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const users = await readJson('users.json')
    return users.find(u => u.cedula?.replace(/\s/g, '').toLowerCase() === cedula.replace(/\s/g, '').toLowerCase())
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM users WHERE REPLACE(REPLACE(cedula, \'-\', \'\'), \'.\', \'\') = REPLACE(REPLACE($1, \'-\', \'\'), \'.\', \'\')', [cedula])
  return res.rows[0] || null
}

export async function findUserByUuid(uuid) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const users = await readJson('users.json')
    return users.find(u => u.uuid === uuid)
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM users WHERE uuid = $1', [uuid])
  return res.rows[0] || null
}

export async function createUser(userData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const users = await readJson('users.json')
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
    const newUser = { id: newId, ...userData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    users.push(newUser)
    await writeJson('users.json', users)
    return newUser
  }
  const p = getPool()
  const { uuid, first_name, last_name, cedula, email, phone, emergency_phone, role, status, password_hash, enrollment, location, area, security_questions } = userData
  
  const res = await p.query(`
    INSERT INTO users (uuid, first_name, last_name, cedula, email, phone, emergency_phone, role, status, password_hash, enrollment, location, area, security_questions)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `, [uuid, first_name, last_name, cedula, email, phone, emergency_phone || null, role || 'base', status || 'active', password_hash, enrollment || null, location || null, area || null, JSON.stringify(security_questions || [])])
  
  return res.rows[0]
}

export async function updateUser(userData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const users = await readJson('users.json')
    const idx = users.findIndex(u => u.id === userData.id || u.uuid === userData.uuid)
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...userData, updated_at: new Date().toISOString() }
      await writeJson('users.json', users)
      return users[idx]
    }
    return null
  }
  const p = getPool()
  const { id, uuid, first_name, last_name, cedula, email, phone, emergency_phone, role, status, password_hash, enrollment, location, area, security_questions, reset_token, reset_token_expires, avatar_url, last_login_at } = userData
  
  const res = await p.query(`
    UPDATE users SET
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      cedula = COALESCE($4, cedula),
      email = COALESCE($5, email),
      phone = COALESCE($6, phone),
      emergency_phone = COALESCE($7, emergency_phone),
      role = COALESCE($8, role),
      status = COALESCE($9, status),
      password_hash = COALESCE($10, password_hash),
      enrollment = COALESCE($11, enrollment),
      location = COALESCE($12, location),
      area = COALESCE($13, area),
      security_questions = COALESCE($14, security_questions),
      reset_token = COALESCE($15, reset_token),
      reset_token_expires = COALESCE($16, reset_token_expires),
      avatar_url = COALESCE($17, avatar_url),
      last_login_at = COALESCE($18, last_login_at),
      updated_at = NOW()
    WHERE id = $1 OR uuid = $1
    RETURNING *
  `, [id || uuid, first_name, last_name, cedula, email, phone, emergency_phone, role, status, password_hash, enrollment, location, area, JSON.stringify(security_questions || []), reset_token, reset_token_expires, avatar_url, last_login_at])
  
  return res.rows[0] || null
}

export async function deleteUser(idOrUuid) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const users = await readJson('users.json')
    const filtered = users.filter(u => u.id !== idOrUuid && u.uuid !== idOrUuid)
    await writeJson('users.json', filtered)
    return true
  }
  const p = getPool()
  await p.query('DELETE FROM users WHERE id = $1 OR uuid = $1', [idOrUuid])
  return true
}

// ============================================
// PROFILES
// ============================================
export async function readProfiles() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const profiles = await readJson('profile.json')
    return profiles
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM profiles')
  return res.rows
}

export async function getProfileByUserId(userId) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const profile = await readJson('profile.json')
    if (profile.user_id === userId || profile.id === userId) return profile
    return null
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM profiles WHERE user_id = $1', [userId])
  return res.rows[0] || null
}

export async function updateProfile(profileData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const profile = await readJson('profile.json')
    const updated = { ...profile, ...profileData, updated_at: new Date().toISOString() }
    await writeJson('profile.json', updated)
    return updated
  }
  const p = getPool()
  const { id, user_id, name, username, email, bio, avatar_url, followers, following, enrolled } = profileData
  
  const res = await p.query(`
    INSERT INTO profiles (user_id, name, username, email, bio, avatar_url, followers, following, enrolled)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_id) DO UPDATE SET
      name = COALESCE($2, profiles.name),
      username = COALESCE($3, profiles.username),
      email = COALESCE($4, profiles.email),
      bio = COALESCE($5, profiles.bio),
      avatar_url = COALESCE($6, profiles.avatar_url),
      followers = COALESCE($7, profiles.followers),
      following = COALESCE($8, profiles.following),
      enrolled = COALESCE($9, profiles.enrolled),
      updated_at = NOW()
    RETURNING *
  `, [user_id, name, username, email, bio, avatar_url, followers, following, JSON.stringify(enrolled || [])])
  
  return res.rows[0]
}

// ============================================
// COURSES
// ============================================
export async function readCourses() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    return await readJson('courses.json')
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM courses ORDER BY id')
  return res.rows
}

export async function getCourseById(id) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const courses = await readJson('courses.json')
    return courses.find(c => c.id === id)
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM courses WHERE id = $1', [id])
  return res.rows[0] || null
}

export async function createCourse(courseData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const courses = await readJson('courses.json')
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1
    const newCourse = { id: newId, ...courseData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    courses.push(newCourse)
    await writeJson('courses.json', courses)
    return newCourse
  }
  const p = getPool()
  const { title, author, hours, img, tag, description, long_description, instructor_user_id, syllabus_url, cover_img } = courseData
  
  const res = await p.query(`
    INSERT INTO courses (title, author, hours, img, tag, description, long_description, instructor_user_id, syllabus_url, cover_img)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [title, author || 'INCES', hours, img, tag, description, long_description, instructor_user_id, syllabus_url || '', cover_img])
  
  return res.rows[0]
}

export async function updateCourse(id, courseData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const courses = await readJson('courses.json')
    const idx = courses.findIndex(c => c.id === id)
    if (idx >= 0) {
      courses[idx] = { ...courses[idx], ...courseData, updated_at: new Date().toISOString() }
      await writeJson('courses.json', courses)
      return courses[idx]
    }
    return null
  }
  const p = getPool()
  const { title, author, hours, img, tag, description, long_description, instructor_user_id, syllabus_url, cover_img } = courseData
  
  const res = await p.query(`
    UPDATE courses SET
      title = COALESCE($2, title),
      author = COALESCE($3, author),
      hours = COALESCE($4, hours),
      img = COALESCE($5, img),
      tag = COALESCE($6, tag),
      description = COALESCE($7, description),
      long_description = COALESCE($8, long_description),
      instructor_user_id = COALESCE($9, instructor_user_id),
      syllabus_url = COALESCE($10, syllabus_url),
      cover_img = COALESCE($11, cover_img),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, title, author, hours, img, tag, description, long_description, instructor_user_id, syllabus_url, cover_img])
  
  return res.rows[0] || null
}

export async function deleteCourse(id) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const courses = await readJson('courses.json')
    const filtered = courses.filter(c => c.id !== id)
    await writeJson('courses.json', filtered)
    return true
  }
  const p = getPool()
  await p.query('DELETE FROM courses WHERE id = $1', [id])
  return true
}

// ============================================
// ENROLLMENTS
// ============================================
export async function readEnrollments() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const data = await readJson('enrollments.json')
    return data.items || []
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM enrollments ORDER BY id')
  return res.rows
}

export async function createEnrollment(enrollmentData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const data = await readJson('enrollments.json')
    const newId = (data.items?.length || 0) > 0 ? Math.max(...data.items.map(e => e.id)) + 1 : 1
    const newEnrollment = { id: newId, ...enrollmentData, created_at: new Date().toISOString() }
    data.items = data.items || []
    data.items.push(newEnrollment)
    await writeJson('enrollments.json', data)
    return newEnrollment
  }
  const p = getPool()
  const { course_id, user_id, status } = enrollmentData
  
  const res = await p.query(`
    INSERT INTO enrollments (course_id, user_id, status)
    VALUES ($1, $2, $3)
    ON CONFLICT (course_id, user_id) DO UPDATE SET
      status = COALESCE($3, enrollments.status)
    RETURNING *
  `, [course_id, user_id, status || 'enrolled'])
  
  return res.rows[0]
}

// ============================================
// ALERTS
// ============================================
export async function readAlerts() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    return await readJson('alerts.json')
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM alerts ORDER BY id DESC')
  return res.rows
}

export async function getAlertsByUserId(userId) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const alerts = await readJson('alerts.json')
    return alerts.filter(a => a.user_id === userId || !a.user_id)
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM alerts WHERE user_id = $1 OR user_id IS NULL ORDER BY id DESC', [userId])
  return res.rows
}

export async function createAlert(alertData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const alerts = await readJson('alerts.json')
    const newId = alerts.length > 0 ? Math.max(...alerts.map(a => a.id)) + 1 : 1
    const newAlert = { id: newId, ...alertData, created_at: new Date().toISOString() }
    alerts.push(newAlert)
    await writeJson('alerts.json', alerts)
    return newAlert
  }
  const p = getPool()
  const { user_id, subject, text, time, read } = alertData
  
  const res = await p.query(`
    INSERT INTO alerts (user_id, subject, text, time, read)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [user_id || null, subject, text, time, read || false])
  
  return res.rows[0]
}

export async function markAlertRead(id) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const alerts = await readJson('alerts.json')
    const idx = alerts.findIndex(a => a.id === id)
    if (idx >= 0) {
      alerts[idx].read = true
      await writeJson('alerts.json', alerts)
      return alerts[idx]
    }
    return null
  }
  const p = getPool()
  const res = await p.query('UPDATE alerts SET read = TRUE WHERE id = $1 RETURNING *', [id])
  return res.rows[0]
}

// ============================================
// AULA VIRTUAL POSTS
// ============================================
export async function readAulaVirtualPosts() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const data = await readJson('aulaVirtual.json')
    const allPosts = []
    for (const course of data.courses || []) {
      for (const post of course.posts || []) {
        allPosts.push({ ...post, courseId: course.courseId })
      }
    }
    return allPosts
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM aula_virtual_posts ORDER BY created_at DESC')
  return res.rows
}

export async function getAulaVirtualPostsByCourse(courseId) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const data = await readJson('aulaVirtual.json')
    const course = data.courses?.find(c => c.courseId === courseId)
    return course?.posts || []
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM aula_virtual_posts WHERE course_id = $1 ORDER BY created_at DESC', [courseId])
  return res.rows
}

export async function createAulaVirtualPost(postData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const data = await readJson('aulaVirtual.json')
    data.courses = data.courses || []
    let course = data.courses.find(c => c.courseId === postData.courseId)
    if (!course) {
      course = { courseId: postData.courseId, posts: [] }
      data.courses.push(course)
    }
    const newId = (course.posts?.length || 0) > 0 ? Math.max(...course.posts.map(p => p.id)) + 1 : 1
    const newPost = { id: newId, ...postData, createdAt: new Date().toISOString(), files: postData.files || [] }
    course.posts = course.posts || []
    course.posts.push(newPost)
    await writeJson('aulaVirtual.json', data)
    return newPost
  }
  const p = getPool()
  const { course_id, type, title, description, created_by_user_id, due_at, files } = postData
  
  const res = await p.query(`
    INSERT INTO aula_virtual_posts (course_id, type, title, description, created_by_user_id, due_at, files)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [course_id, type, title, description, created_by_user_id, due_at, JSON.stringify(files || [])])
  
  return res.rows[0]
}

// ============================================
// AULA VIRTUAL SUBMISSIONS
// ============================================
export async function readAulaVirtualSubmissions() {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const data = await readJson('aulaVirtualSubmissions.json')
    return data.items || []
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM aula_virtual_submissions ORDER BY submitted_at DESC')
  return res.rows
}

export async function getAulaVirtualSubmissionsByAssignment(assignmentId) {
  if (!USE_PG) {
    const { readJson } = await import('./jsonDb.js')
    const data = await readJson('aulaVirtualSubmissions.json')
    return (data.items || []).filter(s => s.assignmentId === assignmentId)
  }
  const p = getPool()
  const res = await p.query('SELECT * FROM aula_virtual_submissions WHERE assignment_id = $1 ORDER BY submitted_at DESC', [assignmentId])
  return res.rows
}

export async function createAulaVirtualSubmission(submissionData) {
  if (!USE_PG) {
    const { readJson, writeJson } = await import('./jsonDb.js')
    const data = await readJson('aulaVirtualSubmissions.json')
    data.items = data.items || []
    const newId = (data.items?.length || 0) > 0 ? Math.max(...data.items.map(s => s.id)) + 1 : 1
    const newSubmission = { id: newId, ...submissionData, submittedAt: new Date().toISOString() }
    data.items.push(newSubmission)
    await writeJson('aulaVirtualSubmissions.json', data)
    return newSubmission
  }
  const p = getPool()
  const { course_id, assignment_id, user_id, file, grade, feedback } = submissionData
  
  const res = await p.query(`
    INSERT INTO aula_virtual_submissions (course_id, assignment_id, user_id, file, grade, feedback)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (assignment_id, user_id) DO UPDATE SET
      file = $4,
      grade = COALESCE($5, aula_virtual_submissions.grade),
      feedback = COALESCE($6, aula_virtual_submissions.feedback)
    RETURNING *
  `, [course_id, assignment_id, user_id, JSON.stringify(file), JSON.stringify(grade), feedback])
  
  return res.rows[0]
}

// ============================================
// UTILITIES
// ============================================
export async function closePool() {
  if (pool) await pool.end()
  pool = null
}

export function isUsingPG() {
  return USE_PG
}
