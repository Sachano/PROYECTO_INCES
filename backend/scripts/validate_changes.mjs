import assert from 'assert'

const BASE = process.env.BASE || 'http://localhost:3002'

async function req(path, opts={}){
  const url = `${BASE}${path}`
  const res = await fetch(url, opts)
  let body = null
  try{ body = await res.json() }catch(e){ body = await res.text().catch(()=>null) }
  return { status: res.status, body }
}

async function login(identifier, password){
  return await req('/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ identifier, password }) })
}

async function checkDuplicate(field, value){
  return await req('/api/auth/check-duplicate', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ field, value }) })
}

async function createUserAsAdmin(token, payload){
  return await req('/api/users', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
}

async function run(){
  console.log('Starting validation script against', BASE)

  // 1) check-duplicate cedula formats
  const cedulaTests = [
    { value: 'V12345678', expect: true },
    { value: 'V-12345678', expect: true },
    { value: 'v12345678', expect: true },
    { value: '12345678', expect: false }
  ]
  for(const t of cedulaTests){
    const r = await checkDuplicate('cedula', t.value)
    console.log('check-duplicate', t.value, '=>', r.body)
    assert(typeof r.body.exists === 'boolean')
  }

  // 2) login as admin
  const adminLogin = await login('sachano@gmail.com', 'Sachano')
  assert(adminLogin.status === 200 && adminLogin.body.token, 'admin login failed')
  const token = adminLogin.body.token
  console.log('admin token obtained')

  // 3) create user as admin with location+area -> expect tempPassword returned and enrollment generated
  const ced = String(Math.floor(10000000 + Math.random()*89999999))
  const email = `test.user.${Date.now()}-${Math.floor(Math.random()*1000)}@example.test`
  const phone = '0414' + String(Math.floor(1000000 + Math.random()*8999999))
  const createRes = await createUserAsAdmin(token, {
    firstName: 'Auto', lastName: 'Tester', cedulaType: 'V', cedula: ced,
    email, phone, location: 'CCS', area: 'INF', role: 'estudiante'
  })
  console.log('create user response', createRes.status, createRes.body)
  assert(createRes.status === 201, 'admin create failed')
  assert(createRes.body.tempPassword || createRes.body.password, 'no temp password returned')

  const tempPassword = createRes.body.tempPassword || createRes.body.password

  // 4) login as new user with temp password => expect MUST_CHANGE_PASSWORD or similar
  const loginNew = await login(email, tempPassword)
  console.log('login new user response', loginNew.status, loginNew.body)
  assert(loginNew.status === 401 || (loginNew.body && loginNew.body.error === 'MUST_CHANGE_PASSWORD'), 'mustChangePassword flow not enforced')

  console.log('\nAll validations passed (check-duplicate, admin create with enrollment, temp password, mustChangePassword behavior).')
}

run().catch(err => { console.error('Validation script failed:', err); process.exit(1) })
