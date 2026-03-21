/**
 * Script de Migración de JSON a PostgreSQL
 * 
 * Este script migra todos los datos de los archivos JSON a PostgreSQL.
 * 
 * Uso:
 * 1. Asegúrate de tener PostgreSQL instalado y configurado
 * 2. Crea la base de datos y ejecuta las migraciones SQL primero:
 *    psql -U postgres -d inces -f db/migrations/001_create_tables.sql
 *    psql -U postgres -d inces -f db/migrations/002_create_all_tables.sql
 * 3. Ejecuta este script:
 *    node db/migrations/migrate_to_pg.js
 * 
 * Para usar PostgreSQL, establece las variables de entorno:
 *   USE_PG=true
 *   PG_HOST=localhost
 *   PG_PORT=5432
 *   PG_USER=postgres
 *   PG_PASS=tu-contraseña
 *   PG_DB=inces
 */

import pkg from 'pg'
const { Pool } = 'default' && pkg
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = (fileName) => path.join(__dirname, '..', 'db', fileName)

async function readJson(fileName) {
  try {
    const raw = await fs.readFile(dbPath(fileName), 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.log(`No se pudo leer ${fileName}: ${e.message}`)
    return null
  }
}

async function migrate() {
  // Configurar conexión a PostgreSQL
  const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASS || '',
    database: process.env.PG_DB || 'inces',
  })

  try {
    console.log('🚀 Iniciando migración de datos a PostgreSQL...\n')

    // ============================================
    // MIGRAR USERS
    // ============================================
    console.log('📦 Migrando usuarios...')
    const users = await readJson('users.json')
    if (users && Array.isArray(users)) {
      for (const user of users) {
        await pool.query(`
          INSERT INTO users (uuid, first_name, last_name, cedula, email, phone, emergency_phone, role, status, password_hash, enrollment, location, area, security_questions, avatar_url, created_at, updated_at, last_login_at, notifications)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (uuid) DO NOTHING
        `, [
          user.uuid, user.firstName || user.first_name, user.lastName || user.last_name,
          user.cedula, user.email, user.phone, user.emergencyPhone || user.emergency_phone,
          user.role || 'base', user.status || 'active', user.passwordHash || user.password_hash,
          user.enrollment, user.location, user.area,
          JSON.stringify(user.securityQuestions || user.security_questions || []),
          user.avatarUrl || user.avatar_url || '',
          user.createdAt || user.created_at || new Date().toISOString(),
          user.updatedAt || user.updated_at || new Date().toISOString(),
          user.lastLoginAt || user.last_login_at, JSON.stringify(user.notifications || [])
        ])
      }
      console.log(`  ✅ ${users.length} usuarios migrados`)
    }

    // ============================================
    // MIGRAR PROFILES
    // ============================================
    console.log('📦 Migrando perfiles...')
    const profile = await readJson('profile.json')
    if (profile) {
      // Buscar usuario por email para obtener el user_id
      let userId = profile.user_id
      if (!userId && profile.email) {
        const userResult = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [profile.email])
        if (userResult.rows.length > 0) {
          userId = userResult.rows[0].id
        }
      }
      
      if (userId) {
        await pool.query(`
          INSERT INTO profiles (user_id, name, username, email, bio, avatar_url, followers, following, enrolled, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (user_id) DO NOTHING
        `, [
          userId, profile.name, profile.username, profile.email, profile.bio,
          profile.avatarUrl || profile.avatar_url || '', profile.followers || 0,
          profile.following || 0, JSON.stringify(profile.enrolled || []),
          profile.updatedAt || profile.updated_at || new Date().toISOString()
        ])
        console.log('  ✅ Perfil migrado')
      }
    }

    // ============================================
    // MIGRAR COURSES
    // ============================================
    console.log('📦 Migrando cursos...')
    const courses = await readJson('courses.json')
    if (courses && Array.isArray(courses)) {
      for (const course of courses) {
        await pool.query(`
          INSERT INTO courses (id, title, author, hours, img, tag, description, long_description, instructor_user_id, syllabus_url, cover_img, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING
        `, [
          course.id, course.title, course.author || 'INCES', course.hours,
          course.img, course.tag, course.description, course.longDescription || course.long_description,
          course.instructorUserId || course.instructor_user_id,
          course.syllabusUrl || course.syllabus_url || '',
          course.coverImg || course.cover_img || '',
          course.createdAt || course.created_at || new Date().toISOString(),
          course.updatedAt || course.updated_at || new Date().toISOString()
        ])
      }
      console.log(`  ✅ ${courses.length} cursos migrados`)
    }

    // ============================================
    // MIGRAR ENROLLMENTS
    // ============================================
    console.log('📦 Migrando inscripciones...')
    const enrollments = await readJson('enrollments.json')
    if (enrollments && enrollments.items && Array.isArray(enrollments.items)) {
      for (const enrollment of enrollments.items) {
        await pool.query(`
          INSERT INTO enrollments (course_id, user_id, status, enrolled_at)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (course_id, user_id) DO NOTHING
        `, [
          enrollment.courseId || enrollment.course_id,
          enrollment.userId || enrollment.user_id,
          enrollment.status || 'enrolled',
          enrollment.createdAt || enrollment.enrolled_at || new Date().toISOString()
        ])
      }
      console.log(`  ✅ ${enrollments.items.length} inscripciones migradas`)
    }

    // ============================================
    // MIGRAR ALERTS
    // ============================================
    console.log('📦 Migrando alertas...')
    const alerts = await readJson('alerts.json')
    if (alerts && Array.isArray(alerts)) {
      for (const alert of alerts) {
        await pool.query(`
          INSERT INTO alerts (subject, text, time, read, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          alert.subject, alert.text, alert.time, alert.read || false,
          new Date().toISOString()
        ])
      }
      console.log(`  ✅ ${alerts.length} alertas migradas`)
    }

    // ============================================
    // MIGRAR AULA VIRTUAL POSTS
    // ============================================
    console.log('📦 Migrando publicaciones del aula virtual...')
    const aulaVirtual = await readJson('aulaVirtual.json')
    if (aulaVirtual && aulaVirtual.courses && Array.isArray(aulaVirtual.courses)) {
      let totalPosts = 0
      for (const course of aulaVirtual.courses) {
        if (course.posts && Array.isArray(course.posts)) {
          for (const post of course.posts) {
            await pool.query(`
              INSERT INTO aula_virtual_posts (id, course_id, type, title, description, created_by_user_id, due_at, files, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (id) DO NOTHING
            `, [
              post.id, course.courseId, post.type, post.title, post.description,
              post.createdByUserId || post.created_by_user_id,
              post.dueAt || post.due_at, JSON.stringify(post.files || []),
              post.createdAt || post.created_at || new Date().toISOString()
            ])
            totalPosts++
          }
        }
      }
      console.log(`  ✅ ${totalPosts} publicaciones migradas`)
    }

    // ============================================
    // MIGRAR AULA VIRTUAL SUBMISSIONS
    // ============================================
    console.log('📦 Migrando entregas del aula virtual...')
    const submissions = await readJson('aulaVirtualSubmissions.json')
    if (submissions && submissions.items && Array.isArray(submissions.items)) {
      for (const sub of submissions.items) {
        await pool.query(`
          INSERT INTO aula_virtual_submissions (id, course_id, assignment_id, user_id, file, submitted_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [
          sub.id, sub.courseId || sub.course_id, sub.assignmentId || sub.assignment_id,
          sub.userId || sub.user_id, JSON.stringify(sub.file),
          sub.submittedAt || sub.submitted_at || new Date().toISOString()
        ])
      }
      console.log(`  ✅ ${submissions.items.length} entregas migradas`)
    }

    console.log('\n🎉 ¡Migración completada exitosamente!')
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Ejecutar si se llama directamente
migrate()
