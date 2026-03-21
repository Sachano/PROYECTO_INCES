-- ============================================
-- Complete migration for INCES Platform
-- PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    cedula TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    emergency_phone TEXT,
    role TEXT NOT NULL DEFAULT 'base' CHECK (role IN ('base', 'admin', 'master')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    password_hash TEXT NOT NULL,
    enrollment TEXT,
    location TEXT,
    area TEXT,
    security_questions JSONB DEFAULT '[]',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    notifications JSONB DEFAULT '[]'
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cedula ON users(cedula);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    username TEXT,
    email TEXT,
    bio TEXT,
    avatar_url TEXT DEFAULT '',
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    enrolled JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'INCES',
    hours INTEGER,
    img TEXT,
    tag TEXT,
    description TEXT,
    long_description TEXT,
    instructor_user_id INTEGER REFERENCES users(id),
    syllabus_url TEXT DEFAULT '',
    cover_img TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_courses_tag ON courses(tag);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_user_id);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'suspended')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    text TEXT,
    time TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);

-- ============================================
-- AULA VIRTUAL (Virtual Classroom) TABLES
-- ============================================

-- Posts table for course content, assignments, grades
CREATE TABLE IF NOT EXISTS aula_virtual_posts (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('content', 'assignment', 'grades', 'announcement')),
    title TEXT NOT NULL,
    description TEXT,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_at TIMESTAMP WITH TIME ZONE,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aula_posts_course_id ON aula_virtual_posts(course_id);
CREATE INDEX IF NOT EXISTS idx_aula_posts_type ON aula_virtual_posts(type);
CREATE INDEX IF NOT EXISTS idx_aula_posts_created_by ON aula_virtual_posts(created_by_user_id);

-- Submissions table for student assignments
CREATE TABLE IF NOT EXISTS aula_virtual_submissions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assignment_id INTEGER NOT NULL REFERENCES aula_virtual_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    grade JSONB DEFAULT NULL,
    feedback TEXT,
    UNIQUE(assignment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_aula_submissions_course_id ON aula_virtual_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_aula_submissions_assignment ON aula_virtual_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_aula_submissions_user_id ON aula_virtual_submissions(user_id);

-- ============================================
-- Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aula_virtual_posts_updated_at BEFORE UPDATE ON aula_virtual_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert default master user (password: inces123)
-- NOTE: This is for development only! In production, use proper user creation flow
-- INSERT INTO users (uuid, first_name, last_name, cedula, email, phone, role, status, password_hash, created_at, updated_at)
-- VALUES (
--     'usr_master_001',
--     'Admin',
--     'INCES',
--     'V-00000000',
--     'admin@inces.gob.ve',
--     '',
--     'master',
--     'active',
--     '$2a$10$6TwHRq8he7m81EezlqL8BeIwkWAqVnPBnOyFTEmKv5.nhBvcu/Mi6',
--     NOW(),
--     NOW()
-- );
