import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

const zipPath = path.join(rootDir, 'backend.zip')

console.log('📦 Empaquetando backend en backend.zip...')

// Remove existing zip if it exists
if (fs.existsSync(zipPath)) {
  try {
    fs.unlinkSync(zipPath)
  } catch (err) {
    // Ignore error
  }
}

try {
  // Execute native tar command
  const cmd = 'tar --exclude="node_modules" --exclude=".env" --exclude="*.zip" -a -c -f backend.zip -C backend .'
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' })
  console.log('✅ ¡backend.zip creado con éxito!')
  console.log(`📁 Ubicación: ${zipPath}`)
  console.log(`⚖️ Tamaño: ${(fs.statSync(zipPath).size / 1024).toFixed(2)} KB`)
} catch (error) {
  console.warn('⚠️ Falló empaquetado nativo de tar. Intentando método alternativo de PowerShell...')
  try {
    const psCmd = 'powershell -Command "Get-ChildItem -Path backend -Exclude node_modules, .env, *.zip | Compress-Archive -DestinationPath backend.zip -Force"'
    execSync(psCmd, { cwd: rootDir, stdio: 'inherit' })
    console.log('✅ ¡backend.zip creado con éxito usando PowerShell!')
  } catch (psError) {
    console.error('❌ Error en el método de PowerShell:', psError.message)
    process.exit(1)
  }
}
